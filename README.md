# Zhang Jiajie · 作品集

个人主页与项目索引：<https://zhangjiajie20061102.github.io/>

一个单文件静态站点，原生 HTML + CSS + JavaScript，没有构建步骤、没有框架、没有外部字体和图片。
封面视觉全部由 CSS 渐变生成，克隆下来双击 `index.html` 就能看。

## 站点结构

```
.
├── index.html                      # 主页：Hero / 项目 / 能力 / 关于
├── solve.html                      # 一元二次方程求解器（主页第 06 张卡片指向它）
├── archive/
│   └── index-2026-04-original.html # 旧版首页留档（当初的 CSS 3D 立方体）
└── README.md
```

## 功能

- **项目卡片**：六个仓库，含在线 Demo 与源码链接，按技术栈筛选（小程序 / Python / Java / 前端 / 数据）
- **滚动入场**：`IntersectionObserver` 驱动，同组元素依次错开 70ms；尊重 `prefers-reduced-motion`
- **响应式**：≥820px 双列卡片，更窄自动单列；移动端隐藏次级导航
- **无障碍**：筛选按钮带 `aria-pressed`，键盘焦点有可见描边，结果区域用 `aria-live` 播报

## 本地运行

直接双击 `index.html`，或起一个静态服务器：

```bash
python -m http.server 8000
```

## 一元二次方程求解器

`solve.html` 处理了四种情况，不只是套公式：

| 条件 | 输出 |
|---|---|
| `a = 0, b ≠ 0` | 退化为一元一次方程 |
| `Δ > 0` | 两个不等实根 |
| `Δ = 0` | 两个相等实根 |
| `Δ < 0` | 一对共轭复根 `p ± qi` |

结果区同时展示判别式的逐步计算，输入变化时实时重算。

## 部署

推送到 `main` 分支即由 GitHub Pages 自动发布，无需额外配置。

## 相关项目

| 项目 | 说明 |
|---|---|
| [shop-assistant-miniprogram](https://github.com/ZhangJiajie20061102/shop-assistant-miniprogram) | 微信小程序进销存，云开发数据库 + Vant + ECharts |
| [qq-chat-demo](https://github.com/ZhangJiajie20061102/qq-chat-demo) | 多线程 socket 聊天程序，76 项自动化测试 |
| [hanoi-3d-game](https://github.com/ZhangJiajie20061102/hanoi-3d-game) | 纯原生 3D 汉诺塔，递归自动解题 |
| [attendance](https://github.com/ZhangJiajie20061102/attendance) | Java Servlet + Docker，已部署 Render |
