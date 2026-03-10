# 作了么？- 游戏化作业提醒小程序

中学生作业游戏化工具，通过罗盘转盘随机选择任务，增加学习趣味性和成就感。

## 功能

- **作业录入**：输入作业名称，手动拆分为多个小任务
- **任务列表**：查看、打勾完成、删除任务
- **罗盘转盘**：由当日任务构成转盘，随机选择任务，带动画效果
- **完成庆祝**：全部完成后烟花动画 +「山高万仞，只登一步」+ 分享

## 运行方式

1. 安装 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
2. 打开微信开发者工具，选择「导入项目」
3. 选择本目录 `homeworkreminder`
4. AppID 可使用测试号或留空
5. 编译并预览

## 项目结构

```
├── app.js / app.json / app.wxss
├── pages/
│   ├── index/           # 首页 - 罗盘转盘
│   ├── task-list/       # 任务列表
│   ├── add-homework/    # 添加作业
│   └── celebration/     # 完成庆祝
├── project.config.json
└── sitemap.json
```

## 设计说明

- **配色**：珊瑚红主色 + 青绿/柠檬黄点缀，适合学生群体
- **动画**：转盘 ease-out 缓动、打勾弹跳、烟花粒子
- **性能**：Canvas 2D 绘制、will-change 优化、requestAnimationFrame 动画
