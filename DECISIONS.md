# AI Menu Companion - Decision Log

# AI 菜单助手 - 决策日志

---

## Origin / 起源

- 2026-04-30 saw flipbook.page, inspired by its "visual decomposition" approach
  2026-04-30 看到 flipbook.page，受其"视觉化拆解"启发
- 2026-05-01 talked with restaurant manager, clarified direction: not building an ordering system, but a menu comprehension tool
  2026-05-01 与餐厅经理讨论后明确方向：不做点单系统，做菜单理解工具

---

## Real Problem (Observed) / 真实问题（亲身观察）

**Setting**: Auckland Chinese fine-dining restaurant, paper menu without images, dish names mostly in Chinese
**环境**：奥克兰华人 fine dining，纸质菜单无图，菜名以中文为主

**Pain points / 痛点**:

1. Western customers don't know what's in Chinese dishes → afraid to order → lost orders
   洋人客人不知道中国菜成分 → 不敢点 → 流失订单

2. Customers with food allergies can't self-check → high communication cost + risk
   食物过敏客人无法自助查询 → 沟通成本高 + 风险

3. Servers repeatedly explain ingredients verbally → time wasted
   服务员需要反复口头解释成分 → 浪费时间

---

## Constraint (Critical) / 关键约束

Manager's clear stance: **no customer self-ordering system**
经理明确：**不能做客人自助点单系统**

- Reason: fine dining requires kitchen pace control + service quality
  理由：fine dining 需要厨房节奏控制 + 服务质量
- I accept this constraint; product positioning adjusted to "menu comprehension tool during waiting time"
  我接受这个约束，产品定位调整为"等待期菜单理解工具"

---

## Product Definition / 产品定义

**An AI-powered visual menu companion for fine dining restaurants.**
**一款面向 fine dining 餐厅的 AI 视觉菜单伴侣。**

- Customer scans QR code on table → opens web menu
  客人扫桌上 QR code → 网页菜单
- Used while waiting for the server
  在等待服务员的时间内使用
- Does NOT replace the ordering process
  不替代点单流程

---

## Path Decision: Path A (Visual Menu First) / 路线决策：A 路线（视觉菜单优先）

- Choose A over B: visual experience as primary, RAG as secondary
  选择 A 而非 B：视觉化为主，RAG 为辅
- Skills gained: React + data modeling + LLM API (complementary to RAG learned in TFT project)
  学到的技能：React + 数据建模 + LLM API（互补于 TFT 项目学的 RAG）

---

## A1 Scope (May, 2-3 weeks · 1 hour/day) / A1 范围(5 月,2-3 周 · 每天 1 小时)

**Single-dish polished demo / 单道菜精致 demo**

- **Only Kung Pao Chicken** for A1
  A1 只做宫保鸡丁
- Click dish → animated ingredient breakdown
  点击菜品 → 动画展开成分
- Allergen highlighting (peanuts, shellfish, gluten, dairy, alcohol, etc.)
  过敏标记(花生、海鲜、麸质、乳制品、酒精等)
- Bilingual dish names + short English cultural explanation
  中英双语菜名 + 简短英文文化解释
- Focus: **single-dish complete experience** instead of multi-dish half-baked
  重点:**单道菜的完整体验**,而不是多道菜的半成品

### Why scope reduction (2026-05-07) / 为什么缩范围

Original A1 was 3 dishes (main + dessert + cocktail). Reduced to 1 dish (Kung Pao Chicken only) for these reasons:
原 A1 是 3 道菜(主菜 + 甜点 + 鸡尾酒)。缩为 1 道(只宫保鸡丁),理由:

1. **Faster path to manager feedback** — A1 done in 2-3 weeks instead of 4
   更快拿到经理反馈 — A1 缩短到 2-3 周(原 4 周)
2. **Polished single dish > half-baked three dishes** for stakeholder demo
   精致 1 道 > 半成品 3 道,给利益相关者看时更有说服力
3. **De-risk the unknown** — animation, visual breakdown are new territory
   降低未知风险 — 动画、视觉拆解是新领域,先用 1 道菜跑通
4. Dessert + cocktail move to A2 (after manager validates direction)
   甜点 + 鸡尾酒移到 A2(经理确认方向后再做)

---

## A1 Out of Scope (Defer to A2) / A1 不做的事（推迟到 A2）

- AI natural-language Q&A ("Can I have this without peanuts?")
  AI 自然语言问答
- Owner self-service input dashboard
  老板自助录入后台
- Auto-translation
  自动翻译
- Multi-restaurant SaaS
  多餐厅 SaaS
- Multi-language support beyond EN/CN
  英中之外的多语言
- Analytics
  数据分析
- Complex animations
  复杂动画

---

## A2 Plan (June+, after job-hunting starts) / A2 计划（6 月起，开始投简历后）

- Add RAG-based Q&A layer / 加 RAG 问答层
- Expand to full menu (30+ dishes) / 扩展到全菜单（30+ 道）
- Add cultural explanations / alternative ingredient suggestions
  加文化解释 / 替代成分建议
- Explore commercialization / 商业化探索

---

## How AI Is Used in A1 / AI 在 A1 中的使用方式

- **LLM API (one-time content generation)** / **LLM API（一次性内容生成）**:
  - Dish name → ingredient list (I review)
    给菜名 → 生成成分列表（我审核）
  - Dish name → English cultural explanation
    给菜名 → 生成英文文化解释
- **NOT called from user-facing client** (v1 is static web + database)
  **不在用户端调用 LLM**（v1 是静态网页 + 数据库）
- **NOT a RAG project** (RAG is learned in TFT project)
  **不是 RAG 项目**（RAG 在 TFT 项目里学）

---

## Parallel Project: TFT_AI v2 (Where I Learn RAG) / 并行项目：TFT_AI v2（学 RAG 的地方）

- Concurrent, 1 hour/day / 同期推进，每天 1 小时
- May goal: upgrade TFT_AI v1 → v2 with RAG over strategy data
  5 月目标：把 TFT_AI v1 升级为 v2，加 RAG over 攻略数据
- The two projects build complementary skills, no overlap
  两个项目技能互补，不重复

---

## Stakeholder Talk Required (Before Coding) / 动手前需要的沟通

Brief chat with owner / manager / 跟老板或经理简短聊一下:

- "I want to build a small web app where customers scan a QR code to see ingredients"
  "我想做一个让客人扫码看菜成分的小网页"
- "Can I use 3 of our dishes for a demo?"
  "我能用我们的 3 道菜做个 demo 吗？"
- "It won't replace ordering — just lets customers preview while waiting"
  "这个不会替代点单，只是让客人自己先看看"

No formal proposal needed; just confirm no objection.
不需要正式立项，只要他不反对就行。

---

## Time Plan / 时间表

- **5/2 (Sat)**: Work shift, no project work / 上班，不动
- **5/3 (Sun)**: Depending on overtime, either fully kick off v1 or do data prep
  根据加班情况，要么完整启动 v1，要么做小版本数据准备
- **5/4 – 5/31**: v1 development (1 hr menu + 1 hr TFT-RAG per evening)
  v1 主体开发（每天下班 1 小时菜单 + 1 小时 TFT-RAG）
- **6/1+**: Start applying for jobs regardless of project completion
  开始投简历（无论项目完成度如何）

---

## What I'm NOT Doing This Week (May 1–3) / 这周（5/1–5/3）不做的事

- No code / 不写代码
- No tech stack research / 不研究技术栈细节
- No UI mockups / 不画 UI mockup
- No new dependencies / 不安装新依赖
- All "ideas" go in this file only — no implementation until Sunday
  周日动手前，所有"想法"都只写在这个文件里

---

## Anti-Goals / 绝对不做的事

- ❌ No ordering system (against manager's wish)
  不做点单系统（违反经理意愿）
- ❌ No AI Q&A in v1 (data layer first)
  不在 v1 加 AI 问答（先把数据层做对）
- ❌ No commercialization detour from job-hunting (May–July: jobs first)
  不为了商业化偏离求职主线（5-7 月先找工作）
- ❌ No flipbook clone (can't afford the GPU)
  不做成 flipbook 克隆（烧不起算力）
- ❌ No RAG learning in this project (RAG goes in TFT project)
  不在菜单项目里学 RAG（RAG 在 TFT 项目学）

---

## Tech Stack Decision (2026-05-03) / 技术栈决策

### Frontend / 前端
- **Vite** (build tool, replaces CRA which was deprecated in 2023)
  Vite 作为构建工具，替代已弃用的 CRA
- **React 18+** (familiar from RFG project)
  React 18+（RFG 项目已用过，零学习成本）
- **Tailwind CSS** (utility-first, RFG already used)
  Tailwind CSS（RFG 已用过）

### Why not / 不选的理由
- ❌ Plain HTML/CSS/JS — too simple, limited resume value
  原生 HTML/CSS/JS — 太简单，简历加分有限
- ❌ Create React App — deprecated by React team in 2023
  CRA — React 官方 2023 年已弃用
- ❌ Next.js — overkill for v1, no SSR needed yet
  Next.js — v1 用不上服务端渲染

### Data layer (v1) / 数据层（v1）
- **Static JSON files** in `data/` folder, imported directly into React
  静态 JSON 文件存 `data/` 文件夹，直接 import 进 React
- No backend, no database for v1 — defer to v2 if needed
  v1 无后端无数据库，v2 视情况再加

### LLM integration (v1) / LLM 集成（v1）
- One-time content generation via Claude API (offline, before deployment)
  一次性内容生成（离线，部署前）通过 Claude API 完成
- Generated cultural notes / ingredient lists are saved into JSON files
  生成的文化解释 / 成分列表存进 JSON 文件
- **Customer-facing app does NOT call LLM at runtime in v1**
  v1 用户端运行时不调用 LLM
