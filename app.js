// 作了么？- 游戏化作业提醒
App({
  globalData: {
    tasks: [],
    todayKey: ''
  },

  onLaunch() {
    this.initTodayTasks()
    this.mockHistoryData()
  },

  // 临时数据修复：为历史任务随机生成耗时 (2-10分钟)
  mockHistoryData() {
    const index = wx.getStorageSync('history_index') || []
    index.forEach(date => {
      const tasks = wx.getStorageSync(`tasks_${date}`) || []
      let updated = false
      tasks.forEach(t => {
        if (t.completed && (!t.timeSpent || t.timeSpent <= 0)) {
          // 随机生成 120-600 秒
          t.timeSpent = Math.floor(Math.random() * (600 - 120 + 1)) + 120
          updated = true
        }
      })
      if (updated) {
        wx.setStorageSync(`tasks_${date}`, tasks)
      }
    })
  },

  // 获取今日日期 key (YYYY-MM-DD)
  getTodayKey() {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  },

  initTodayTasks() {
    const key = this.getTodayKey()
    this.globalData.todayKey = key
    const stored = wx.getStorageSync(`tasks_${key}`)
    this.globalData.tasks = stored && Array.isArray(stored) ? stored : []
  },

  getTasks() {
    const key = this.getTodayKey()
    if (key !== this.globalData.todayKey) {
      this.initTodayTasks()
    }
    return this.globalData.tasks
  },

  saveTasks(tasks) {
    this.globalData.tasks = tasks
    const key = this.globalData.todayKey
    wx.setStorageSync(`tasks_${key}`, tasks)
    this.updateHistoryIndex(key)
  },

  // 更新历史记录索引
  updateHistoryIndex(dateKey) {
    let history = wx.getStorageSync('history_index') || []
    if (!history.includes(dateKey)) {
      history.push(dateKey)
      // 按日期倒序排
      history.sort((a, b) => b.localeCompare(a))
      wx.setStorageSync('history_index', history)
    }
  },

  // 获取完整的历史记录列表（带完成状态）
  getHistoryList() {
    const index = wx.getStorageSync('history_index') || []
    return index.map(date => {
      const tasks = wx.getStorageSync(`tasks_${date}`) || []
      const total = tasks.length
      const done = tasks.filter(t => t.completed).length
      return {
        date,
        total,
        done,
        isAllDone: total > 0 && total === done,
        tasks // 包含详细任务以便展开查看
      }
    })
  },

  addTask(title, homeworkTitle = '', duration = 0) {
    const tasks = this.getTasks()
    const id = 't_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8)
    tasks.push({ id, title, completed: false, homeworkTitle, duration })
    this.saveTasks(tasks)
    return id
  },

  addTasks(tasksData, homeworkTitle = '') {
    const tasks = this.getTasks()
    const now = Date.now()
    // tasksData is expected to be an array of {title, duration}
    tasksData.forEach((task, i) => {
      const id = 't_' + now + '_' + i + '_' + Math.random().toString(36).slice(2, 6)
      tasks.push({ 
        id, 
        title: task.title, 
        completed: false, 
        homeworkTitle, 
        duration: task.duration || 0 
      })
    })
    this.saveTasks(tasks)
  },

  toggleTask(id) {
    const tasks = this.getTasks()
    const t = tasks.find(x => x.id === id)
    if (t) {
      t.completed = !t.completed
      this.saveTasks(tasks)
      return t.completed
    }
    return false
  },

  completeTask(id) {
    const tasks = this.getTasks()
    const t = tasks.find(x => x.id === id)
    if (t) {
      t.completed = true
      this.saveTasks(tasks)
      return true
    }
    return false
  },

  updateTaskProgress(id, remainingSeconds, timeSpent) {
    const tasks = this.getTasks()
    const t = tasks.find(x => x.id === id)
    if (t) {
      t.remainingSeconds = remainingSeconds
      if (typeof timeSpent !== 'undefined') {
        t.timeSpent = timeSpent
      }
      this.saveTasks(tasks)
    }
  },

  deleteTask(id) {
    const tasks = this.getTasks().filter(x => x.id !== id)
    this.saveTasks(tasks)
  },

  clearTasks() {
    this.saveTasks([])
  },

  isAllCompleted() {
    const tasks = this.getTasks()
    return tasks.length > 0 && tasks.every(t => t.completed)
  }
})
