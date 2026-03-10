const app = getApp()

Page({
  data: {
    taskId: '',
    taskTitle: '',
    duration: 0, // minutes
    remainingSeconds: 0,
    timeSpent: 0, // seconds
    timeStr: '00:00',
    isRunning: true,
    timer: null,
    showAddTimeModal: false,
    addTimeVal: ''
  },

  onLoad(options) {
    const { id, title, duration, remaining } = options
    const tasks = app.getTasks()
    const task = tasks.find(t => t.id === id)
    
    // 读取已消耗时间（如果存在）
    let timeSpent = 0
    if (task && typeof task.timeSpent !== 'undefined') {
      timeSpent = task.timeSpent
    }
    
    // 优先级：
    // 1. URL 参数中的 remaining (从首页传过来的最新状态)
    // 2. 内存/Storage 中的 task.remainingSeconds
    // 3. 默认总时长
    let remainingSeconds
    if (typeof remaining !== 'undefined') {
      remainingSeconds = parseInt(remaining)
    } else if (task && typeof task.remainingSeconds !== 'undefined') {
      remainingSeconds = task.remainingSeconds
    } else {
      const mins = parseInt(duration) || 20
      remainingSeconds = mins * 60
    }

    this.setData({
      taskId: id,
      taskTitle: decodeURIComponent(title),
      duration: parseInt(duration) || 20,
      remainingSeconds,
      timeSpent,
      timeStr: this.formatTime(remainingSeconds)
    })
    this.startTimer()
  },

  onUnload() {
    this.stopTimer()
    // 如果倒计时结束（remainingSeconds <= 0）且用户离开页面，自动标记为完成
    if (this.data.remainingSeconds <= 0) {
      // 确保保存 timeSpent
      app.updateTaskProgress(this.data.taskId, 0, this.data.timeSpent)
      app.completeTask(this.data.taskId)
    } else {
      this.saveProgress()
    }
  },

  saveProgress() {
    // 只有在未完成的情况下才保存进度
    if (this.data.remainingSeconds > 0) {
      app.updateTaskProgress(this.data.taskId, this.data.remainingSeconds, this.data.timeSpent)
    }
  },

  startTimer() {
    if (this.data.timer) return
    
    this.setData({ isRunning: true })
    const timer = setInterval(() => {
      if (this.data.remainingSeconds <= 0) {
        // 倒计时结束，不再自动完成，而是停止计时并等待用户操作
        this.stopTimer()
        return
      }
      
      const next = this.data.remainingSeconds - 1
      const spent = (this.data.timeSpent || 0) + 1
      this.setData({
        remainingSeconds: next,
        timeSpent: spent,
        timeStr: this.formatTime(next)
      })
    }, 1000)
    
    this.setData({ timer })
  },

  stopTimer() {
    if (this.data.timer) {
      clearInterval(this.data.timer)
      this.setData({ timer: null, isRunning: false })
      // 暂停时保存进度（如果时间未结束）
      if (this.data.remainingSeconds > 0) {
        this.saveProgress()
      }
    }
  },

  handleToggleOrAdd() {
    if (this.data.remainingSeconds <= 0) {
      this.setData({
        showAddTimeModal: true,
        addTimeVal: ''
      })
    } else {
      this.toggleTimer()
    }
  },

  onAddTimeInput(e) {
    this.setData({ addTimeVal: e.detail.value })
  },

  confirmAddTime() {
    const val = parseInt(this.data.addTimeVal)
    if (!val || val <= 0) {
      wx.showToast({ title: '请输入有效时间', icon: 'none' })
      return
    }
    const addSeconds = val * 60
    this.setData({
      remainingSeconds: addSeconds,
      timeStr: this.formatTime(addSeconds),
      showAddTimeModal: false,
      addTimeVal: ''
    })
    this.startTimer()
  },

  cancelAddTime() {
    this.setData({
      showAddTimeModal: false,
      addTimeVal: ''
    })
  },

  toggleTimer() {
    if (this.data.isRunning) {
      this.stopTimer()
    } else {
      this.startTimer()
    }
  },

  formatTime(seconds) {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  },

  finishTask() {
    this.stopTimer()
    // 确保最后一次进度（包含 timeSpent）被保存
    app.updateTaskProgress(this.data.taskId, this.data.remainingSeconds, this.data.timeSpent)
    app.completeTask(this.data.taskId)
    
    // 鼓励语
    const cheers = [
      '离成功更近一步！',
      '加油，好样的！',
      '快完成了，加油！',
      '太棒了，继续保持！',
      '效率真高，点赞！',
      '坚持就是胜利！'
    ]
    const randomCheer = cheers[Math.floor(Math.random() * cheers.length)]
    
    if (app.isAllCompleted()) {
      wx.showToast({ title: '太棒了！全部完成 🎉', icon: 'none', duration: 2000 })
      setTimeout(() => wx.redirectTo({ url: '/pages/celebration/celebration' }), 1600)
    } else {
      wx.showToast({ title: randomCheer, icon: 'none', duration: 1500 })
      setTimeout(() => wx.navigateBack(), 1500)
    }
  }
})