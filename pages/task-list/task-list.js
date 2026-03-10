const app = getApp()

Page({
  data: {
    groupedTasks: [],
    isEmpty: true
  },

  onLoad() {
    this.loadTasks()
  },

  onShow() {
    this.loadTasks()
  },

  loadTasks() {
    const tasks = app.getTasks()
    
    // 按 homeworkTitle 分组
    const groups = {}
    tasks.forEach(t => {
      // 兼容旧数据或直接添加的任务
      const key = t.homeworkTitle ? t.homeworkTitle : '其他任务'
      if (!groups[key]) {
        groups[key] = { homeworkTitle: key, tasks: [], done: 0, total: 0 }
      }
      groups[key].tasks.push(t)
      groups[key].total++
      if (t.completed) groups[key].done++
    })

    const groupedTasks = Object.values(groups)

    this.setData({
      groupedTasks,
      isEmpty: tasks.length === 0
    })
  },

  // toggleTask(e) {
  //   // 列表页不再支持直接勾选完成
  // },

  deleteTask(e) {
    const id = e.currentTarget.dataset.id
    wx.showModal({
      title: '删除任务',
      content: '确定要删除这个任务吗？',
      success: (res) => {
        if (res.confirm) {
          app.deleteTask(id)
          this.loadTasks()
        }
      }
    })
  },

  goAdd() {
    wx.navigateTo({ url: '/pages/add-homework/add-homework' })
  },

  goToTimer(e) {
    const task = e.currentTarget.dataset.task
    if (task.completed) return // 已完成的任务不跳转

    // 传递 remainingSeconds 到 URL，如果存在的话
    let url = `/pages/timer/timer?id=${task.id}&title=${encodeURIComponent(task.title)}&duration=${task.duration || 20}`
    if (typeof task.remainingSeconds !== 'undefined') {
      url += `&remaining=${task.remainingSeconds}`
    }
    wx.navigateTo({ url })
  },

  goIndex() {
    wx.navigateBack()
  }
})
