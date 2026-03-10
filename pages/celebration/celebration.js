Page({
  data: {
    confetti: [],
    randomQuote: ''
  },

  onLoad() {
    const arr = []
    const colors = ['#6C5CE7', '#00B894', '#FDCB6E', '#FF7675', '#0984E3']
    for (let i = 0; i < 24; i++) {
      arr.push({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.6,
        color: colors[i % colors.length]
      })
    }
    
    // 随机鼓励语库
    const quotes = [
      '不积跬步，无以至千里。',
      '每一个不曾起舞的日子，都是对生命的辜负。',
      '星光不问赶路人，时光不负有心人。',
      '现在的努力，是为了将来的选择权。',
      '山高万仞，只登一步。',
      '种一棵树最好的时间是十年前，其次是现在。',
      '只要路是对的，就不怕路远。',
      '每天进步一点点，坚持带来大改变。',
      '今日事今日毕，你是最棒的时间管理者！',
      '学习如逆水行舟，不进则退。'
    ]
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)]
    
    this.setData({ 
      confetti: arr,
      randomQuote
    })
  },

  onShareAppMessage() {
    return {
      title: '作了么？今日任务全部完成！山高万仞，只登一步 🎉',
      path: '/pages/index/index'
    }
  },

  goHome() {
    wx.reLaunch({ url: '/pages/index/index' })
  },

  share() {
    wx.showToast({ title: '点击右上角 ··· 分享', icon: 'none' })
  }
})
