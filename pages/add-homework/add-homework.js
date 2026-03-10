const app = getApp()

Page({
  data: {
    homeworkTitle: '',
    // 默认给 20 分钟
    taskInputs: [{title: '', duration: '20'}, {title: '', duration: '20'}],
    canSubmit: false
  },

  onLoad() {},

  onHomeworkInput(e) {
    this.setData({ homeworkTitle: e.detail.value })
    this.checkCanSubmit()
  },

  onTaskInput(e) {
    const idx = parseInt(e.currentTarget.dataset.idx, 10)
    const val = e.detail.value
    const arr = [...this.data.taskInputs]
    arr[idx].title = val
    this.setData({ taskInputs: arr })
    this.checkCanSubmit()
  },

  onDurationInput(e) {
    const idx = parseInt(e.currentTarget.dataset.idx, 10)
    let val = e.detail.value
    
    // 严格校验：移除非数字字符，不允许0开头（除非就是0，但需求要求>0，所以不允许0开头）
    val = val.replace(/\D/g, '')
    if (val.startsWith('0')) {
      val = val.replace(/^0+/, '')
    }
    
    const arr = [...this.data.taskInputs]
    arr[idx].duration = val
    
    // 如果输入为空，暂不强制设回默认值，但在提交时会校验
    this.setData({ taskInputs: arr })
    // 手动返回 value 以实现输入过滤效果
    return val
  },

  addTaskSlot() {
    this.setData({
      taskInputs: [...this.data.taskInputs, {title: '', duration: '20'}]
    })
  },

  removeTaskSlot(e) {
    const idx = parseInt(e.currentTarget.dataset.idx, 10)
    // 允许删除到剩1个
    if (this.data.taskInputs.length <= 1) return
    const arr = this.data.taskInputs.filter((_, i) => i !== idx)
    this.setData({ taskInputs: arr })
    this.checkCanSubmit()
  },

  checkCanSubmit() {
    const validTitle = this.data.taskInputs.some(t => t.title.trim())
    const hasHomework = this.data.homeworkTitle.trim().length > 0
    // 校验所有已输入标题的任务，其时长是否有效
    // 允许时长为空(提交时补默认)，但如果输入了必须>0
    // 实际上我们在 onDurationInput 已经过滤了非数字和前导0，所以只要有值就是正整数
    this.setData({ canSubmit: hasHomework && validTitle })
  },

  submit() {
    const homework = this.data.homeworkTitle.trim()
    
    // 过滤出有标题的任务
    const validTasks = this.data.taskInputs.filter(t => t.title.trim())
    
    // 校验时长
    for (let t of validTasks) {
      if (!t.duration || parseInt(t.duration) <= 0) {
        wx.showToast({ title: '任务时长必须大于0', icon: 'none' })
        return
      }
    }

    const tasksToSubmit = validTasks.map(t => ({
      title: t.title.trim(),
      duration: parseInt(t.duration)
    }))

    if (!homework || tasksToSubmit.length === 0) {
      wx.showToast({ title: '请填写作业和至少一个任务', icon: 'none' })
      return
    }
    
    app.addTasks(tasksToSubmit, homework)
    wx.showToast({ title: '添加成功', icon: 'success' })
    setTimeout(() => {
      wx.navigateBack()
    }, 800)
  },

  goBack() {
    wx.navigateBack()
  }
})
