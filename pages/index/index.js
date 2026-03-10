const app = getApp()

const COLORS = ['#6C5CE7', '#00B894', '#FDCB6E', '#FF7675', '#0984E3', '#E17055']

function buildWheelData(tasks) {
  const n = tasks.length
  if (n === 0) return { gradient: '', sectors: [] }
  const step = 360 / n
  
  // 生成硬边渐变，从 0deg（正上方）开始
  const stops = []
  for (let i = 0; i < n; i++) {
    const startDeg = i * step
    const endDeg = (i + 1) * step
    const colorIndex = i % COLORS.length
    const color = COLORS[colorIndex]
    stops.push(`${color} ${startDeg}deg ${endDeg}deg`)
  }
  const gradient = `conic-gradient(from 0deg, ${stops.join(', ')})`
  
  const sectors = tasks.map((t, i) => {
    // 扇区中心角度：从 0deg 开始顺时针计算
    const centerDeg = (i + 0.5) * step
    // 分割线角度
    const dividerDeg = i * step
    
    let displayTitle = t.title
    const prefix = t.homeworkTitle ? t.homeworkTitle + ':' : ''
    const MAX_LEN = 11
    if ((prefix + displayTitle).length > MAX_LEN) {
      if (prefix.length >= MAX_LEN - 2) {
         displayTitle = prefix.slice(0, MAX_LEN - 3) + '…'
      } else {
         displayTitle = prefix + displayTitle.slice(0, MAX_LEN - prefix.length - 1) + '…'
      }
    } else {
      displayTitle = prefix + displayTitle
    }
    
    return {
      id: t.id,
      title: displayTitle,
      fullTitle: t.title,
      homework: t.homeworkTitle || '',
      duration: t.duration || 20,
      centerDeg: centerDeg, // 存储每个扇区的中心角度，用于 spin 计算
      transform: `rotate(${centerDeg}deg) translateY(-165rpx) rotate(-90deg)`,
      dividerTransform: `rotate(${dividerDeg}deg)`
    }
  })
  return { gradient, sectors }
}

Page({
  data: {
    tasks: [],
    sectors: [],
    wheelGradient: '',
    isEmpty: true,
    spinning: false,
    wheelAngle: 0,
    selectedTask: null,
    selectedIndex: -1
  },

  onShow() {
    this.loadTasks()
  },

  loadTasks() {
    const allTasks = app.getTasks()
    // 只显示未完成的任务
    const tasks = allTasks.filter(t => !t.completed)
    const { gradient, sectors } = buildWheelData(tasks)
    
    // 如果只剩一个任务，自动选中它，并保留其可能存在的进度状态
    if (tasks.length === 1) {
      this.setData({
        tasks,
        sectors,
        wheelGradient: gradient,
        isEmpty: false,
        selectedTask: tasks[0],
        selectedIndex: 0
      })
    } else {
      this.setData({
        tasks,
        sectors,
        wheelGradient: gradient,
        isEmpty: tasks.length === 0,
        selectedTask: null,
        selectedIndex: -1
      })
    }
  },

  spin() {
    if (this.data.spinning || this.data.tasks.length === 0) {
      if (this.data.tasks.length === 0) {
        wx.showToast({ title: '先添加任务吧', icon: 'none' })
      }
      return
    }
    const tasks = this.data.tasks
    const n = tasks.length
    
    // 按照权重随机选择
    // 虽然物理上不同大小扇区被指针指到的概率就是其面积比
    // 但我们可以手动模拟这个概率来选 targetIndex
    const totalWeight = tasks.reduce((sum, t) => sum + (t.duration || 20), 0)
    let random = Math.random() * totalWeight
    let targetIndex = -1
    
    for (let i = 0; i < n; i++) {
      const w = tasks[i].duration || 20
      if (random < w) {
        targetIndex = i
        break
      }
      random -= w
    }
    if (targetIndex === -1) targetIndex = n - 1 // fallback

    const centerDeg = this.data.sectors[targetIndex].centerDeg
    
    // 计算目标旋转角度
    // 目标是让 targetIndex 对应的 centerDeg 转到正上方 (0度 / 360度)
    // 旋转是顺时针的 (角度增加)
    // 假设当前角度为 A，目标是找到一个新的 A' > A，使得 (A' + centerDeg) % 360 = 0
    
    const currentAngle = this.data.wheelAngle
    // 计算当前位置距离下一个“0点”还有多少度
    const currentPos = (currentAngle + centerDeg) % 360
    const distToZero = (360 - currentPos) % 360 
    
    // 加上至少 5 圈 (1800度) 
    const rotateAngle = 360 * 5 + distToZero
    const targetAngle = currentAngle + rotateAngle
    
    const duration = 3500

    this.setData({ spinning: true })
    wx.vibrateShort({ type: 'medium' })

    const startAngle = currentAngle
    const startTime = Date.now()

    const raf = (typeof requestAnimationFrame === 'function') ? requestAnimationFrame : (fn) => setTimeout(fn, 16)
    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const easeOut = 1 - Math.pow(1 - progress, 3)
      const angle = startAngle + rotateAngle * easeOut
      this.setData({ wheelAngle: angle })
      if (progress < 1) {
        this.animId = raf(animate)
      } else {
        this.setData({
          spinning: false,
          selectedTask: tasks[targetIndex],
          selectedIndex: targetIndex
        })
        wx.vibrateShort({ type: 'heavy' })
      }
    }
    this.animId = raf(animate)
  },

  goTaskList() {
    wx.navigateTo({ url: '/pages/task-list/task-list' })
  },

  goAdd() {
    wx.navigateTo({ url: '/pages/add-homework/add-homework' })
  },

  goHistory() {
    wx.navigateTo({ url: '/pages/history/history' })
  },

  completeTask(e) {
    // 首页不再支持直接勾选完成，而是进入计时器
    this.startTimer()
  },

  startTimer() {
    const task = this.data.selectedTask
    if (!task) return
    
    // 传递 remainingSeconds 到 URL，如果存在的话
    let url = `/pages/timer/timer?id=${task.id}&title=${encodeURIComponent(task.title)}&duration=${task.duration || 20}`
    if (typeof task.remainingSeconds !== 'undefined') {
      url += `&remaining=${task.remainingSeconds}`
    }
    wx.navigateTo({ url })
  },

  onUnload() {
    if (this.animId) {
      ((typeof cancelAnimationFrame === 'function') ? cancelAnimationFrame : clearTimeout)(this.animId)
    }
  }
})
