const app = getApp()

Page({
  data: {
    history: [],
    trendSlogan: '开始你的连胜纪录！🔥'
  },

  onShow() {
    this.loadHistory()
  },

  loadHistory() {
    const list = app.getHistoryList() || []
    // 默认不展开
    const history = list.map(item => Object.assign({}, item, { expanded: false }))
    // 按日期倒序
    history.sort((a, b) => b.date.localeCompare(a.date))
    
    this.setData({ history })
    if (history.length > 0) {
      this.updateSlogan(history)
      // 延迟绘制图表，避免转场动画期间的渲染闪烁
      setTimeout(() => {
        this.initChart(history)
      }, 500)
    }
  },

  updateSlogan(history) {
    // 简单逻辑：根据最近一次的完成情况
    const last = history[0]
    let slogan = '保持热爱，奔赴山海 🚀'
    if (last.isAllDone) {
      slogan = '完美达成！势不可挡 🔥'
    } else if (last.done > 0) {
      slogan = '积跬步，至千里 🏃'
    }
    // 检查连续完成天数（简化版）
    let streak = 0
    for (let h of history) {
      if (h.isAllDone) streak++
      else break
    }
    if (streak > 1) {
      slogan = `${streak} 天连胜！简直是神 🏆`
    }
    this.setData({ trendSlogan: slogan })
  },

  initChart(history) {
    const query = wx.createSelectorQuery().in(this)
    query.select('#trendChart')
      .fields({ node: true, size: true })
      .exec((res) => {
        if (!res || !res[0]) return
        const canvas = res[0].node
        const ctx = canvas.getContext('2d')
        const dpr = wx.getSystemInfoSync().pixelRatio
        canvas.width = res[0].width * dpr
        canvas.height = res[0].height * dpr
        ctx.scale(dpr, dpr)
        this.drawChart(ctx, res[0].width, res[0].height, history)
      })
  },

  drawChart(ctx, w, h, history) {
    // 取最近7天数据，按日期正序
    const data = history.slice(0, 7).reverse()
    if (data.length === 0) return

    const pad = 20
    const chartW = w - pad * 2
    const chartH = h - pad * 2
    
    // 找出最大值用于归一化
    const totals = data.map(d => d.total)
    totals.push(5)
    const maxVal = Math.max.apply(null, totals)
    
    ctx.clearRect(0, 0, w, h)
    
    // 绘制折线
    ctx.beginPath()
    ctx.lineWidth = 3
    ctx.strokeStyle = '#6C5CE7' // var(--primary)
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    const stepX = chartW / (data.length - 1 || 1)
    
    data.forEach((d, i) => {
      const x = pad + i * stepX
      // y轴翻转：完成数越高越靠上
      const y = h - pad - (d.done / maxVal) * chartH
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    })
    ctx.stroke()

    // 绘制点
    data.forEach((d, i) => {
      const x = pad + i * stepX
      const y = h - pad - (d.done / maxVal) * chartH
      ctx.beginPath()
      ctx.arc(x, y, 4, 0, 2 * Math.PI)
      ctx.fillStyle = '#FDCB6E' // var(--accent)
      ctx.fill()
      ctx.strokeStyle = '#2D3436'
      ctx.lineWidth = 2
      ctx.stroke()
    })
  },

  toggleExpand(e) {
    const idx = e.currentTarget.dataset.idx
    const expanded = !this.data.history[idx].expanded
    // 使用传统方式构造对象，避免计算属性名导致的 babel 错误
    const change = {}
    change['history[' + idx + '].expanded'] = expanded
    this.setData(change)
    wx.vibrateShort({ type: 'light' })
  },

  goBack() {
    wx.navigateBack()
  }
})
