# Zhang Jiajie · 作品集

个人主页与项目索引：<https://zhangjiajie20061102.github.io/>

一个单文件静态站点，原生 HTML + CSS + JavaScript，没有构建步骤、没有框架、没有外部字体和图片。
封面视觉全部由 CSS 渐变生成，克隆下来双击 `index.html` 就能看。

## 站点结构

```
.
├── index.html                      # 主页：Hero / 项目 / 能力 / 关于
├── solve.html                      # 一元二次方程求解器（主页第 06 张卡片指向它）
├── kaoyan/                         # 考研决策台（主页第 09 张卡片指向它）
│   ├── index.html                  # 页面结构：时间轴 / 国家线 / 分数分布 / 目标池
│   ├── data.js                     # 国家线与节点数据（含官方出处）
│   ├── app.js                      # 统计、箱线图、目标池逻辑
│   └── style.css
├── lab/
│   ├── index.html                  # 在线小工具集入口（主页第 10 张卡片指向它）
│   ├── typing.html / typing.js     # 打字测速
│   ├── 2048.html  / game2048.js    # 2048
│   ├── maze.html  / maze.js        # 迷宫生成与寻路对比
│   └── style.css                   # 三个工具共享的样式
├── archive/
│   └── index-2026-04-original.html # 旧版首页留档（当初的 CSS 3D 立方体）
└── README.md
```

## 功能

- **项目卡片**：八个仓库、十个入口，状态徽章区分「在线可用 / 仅微信内 / 仅本地」，按技术栈筛选（小程序 / Python / Java / 前端 / 数据）
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

## 在线小工具集（lab/）

三个纯前端工具，零依赖、无构建、无后端，数据只写 `localStorage`：

- **打字测速**：逐字符判定对错，实时算 WPM 与准确率，60 秒倒计时
- **2048**：完整合并规则、分数与最高分、一步撤销
- **迷宫寻路**：递归回溯生成完美迷宫，同一张图上跑 BFS 与 A*，对比访问格数，可从起点手动走

## 考研决策台（kaoyan/）

它回答的是「我考了 380 分，在这所学校的录取名单里排第几」，而国家线只回答「你够不够门槛」。

- **时间轴**：2027 考研从招生简章到调剂系统的全部节点，按当天日期自动标记已过 / 当前 / 预计
- **国家线**：2025 与 2026 年、22 个门类、A / B 区总分与两条单科线，可跨年对比涨跌，填入自己的分数直接算差值
- **分数分布**：粘贴拟录取名单的初试总分，算出均值、标准差、中位数、四分位、z 值、百分位，
  画箱线图并标出你的位置；填招生人数还能估算名次
- **目标池**：把分析结果存下来，按 z 值自动分档成保底 / 稳妥 / 擦线 / 冲刺，可导出 JSON

数据只存在浏览器 `localStorage`，不上传。国家线与报名人数来自教育部和研招网公开文件，
年份与口径差异（部分专业学位合并 / 拆分划线）在页面上直接标注，不隐藏。

## 部署

推送到 `main` 分支即由 GitHub Pages 自动发布，无需额外配置。

## 相关项目

| 项目 | 说明 |
|---|---|
| [shop-assistant-miniprogram](https://github.com/ZhangJiajie20061102/shop-assistant-miniprogram) | 微信小程序进销存，云开发数据库 + Vant + ECharts |
| [qq-chat-demo](https://github.com/ZhangJiajie20061102/qq-chat-demo) | 多线程 socket 聊天程序，76 项自动化测试 |
| [hanoi-3d-game](https://github.com/ZhangJiajie20061102/hanoi-3d-game) | 纯原生 3D 汉诺塔，递归自动解题 |
| [attendance](https://github.com/ZhangJiajie20061102/attendance) | Java Servlet + Docker，已部署 Render |
| [wenqu](https://github.com/ZhangJiajie20061102/wenqu) | 问答社区，Node 22 内置 SQLite，一人一票由联合主键保证 |
| [netdoctor](https://github.com/ZhangJiajie20061102/netdoctor) | 网络环境诊断器，Python 标准库，检测代理 / TUN MTU / 残留驱动 |
