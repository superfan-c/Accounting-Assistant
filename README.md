# 记账助手

移动端风格的记账 Web App：记一笔、看明细、看统计、管分类，并带**预算进度**和**打卡勋章**。数据存在 **Supabase**（登录 + PostgreSQL + 行级权限），关掉标签页再打开仍保持登录。支持中 / 英 / 日。

---

## 技术栈

| 层 | 技术 | 本仓库版本 |
|----|------|------------|
| 前端 | React + TypeScript + Vite | React 19、TypeScript 6、Vite 8 |
| UI | Ant Design + Ant Design Mobile（底部 TabBar） | antd 6、antd-mobile 5 |
| 路由 | React Router | react-router-dom 7 |
| 图表 | Recharts | 3 |
| 日期 | dayjs | 1.11 |
| CSV 导出 | PapaParse | 5 |
| 后端 / 数据 | Supabase（Auth + PostgreSQL + RLS） | @supabase/supabase-js 2 |
| 记账提醒 | Web Push + Service Worker + Edge Function `send-reminders` + Cron | `public/sw.js` |
| 本地偏好 | `localStorage`（背景、字体、语言、头像、勋章已读/佩戴） | — |

---

## 环境要求

本地跑前端：

| 项 | 要求 |
|----|------|
| Node.js | **20.19+** 或 **22.12+**（Vite 8 要求） |
| 包管理器 | npm（随 Node 安装即可） |
| 操作系统 | Windows / macOS / Linux |
| 浏览器 | 近两年的 Chrome、Edge、Firefox、Safari |

记账提醒额外需要：

| 项 | 要求 |
|----|------|
| 协议 | 生产环境必须 **HTTPS**（本地 `http://localhost` 可以订阅推送） |
| 浏览器能力 | 支持 Notification、Push API、Service Worker |
| 账号 | 一个 [Supabase](https://supabase.com) 项目（免费计划即可） |
| 部署函数（可选） | [Supabase CLI](https://supabase.com/docs/guides/cli)（`npx supabase` 也行，不必全局安装） |

国内 Chrome 常因连不上 Google FCM 导致推送订阅失败，可改用 Firefox，或给浏览器开可访问外网的代理。iPhone 需把站点「添加到主屏幕」后，在 PWA 里授权通知。

---

## 本地开发

复制 `.env.example` 为 `.env` 并填好后：


```bash
npm install
npm run dev    # 改 .env 后需重启
npm run build
```

环境变量写在 `.env`（可参考 `.env.example`），不要提交到仓库：

```
REACT_APP_SUPABASE_URL=https://<project-ref>.supabase.co
REACT_APP_SUPABASE_ANON_KEY=<anon 或 sb_publishable_...>
REACT_APP_VAPID_PUBLIC_KEY=<web-push 公钥>
```

---

## 功能介绍

| 模块 | 说明 |
|------|------|
| 登录 / 注册 | 邮箱 + 密码。忘记密码走邮件链接重置。未登录一律进登录页。 |
| 记一笔 | 支出 / 收入、分类、金额、日期、备注。 |
| 明细 | 按月或按年查看，搜索，编辑 / 删除，导出 CSV。 |
| 统计 | 按所选月份查看：打卡热力图、收支结余、分类饼图、本月收支趋势。勋章在「我的」。 |
| 分类管理 | 增删改；已有记账的分类不能删。新用户注册后自动写入默认分类。 |
| 我的 | 脱敏邮箱、头像外圈右下佩戴勋章、称号在用户名下方、统计卡片、我的勋章、记账提醒、预算管理、数据导出、退出。导航右侧只显示状态（已解锁 / 已开启），不带数量、时刻或金额。 |
| 设置 | 背景主题（含上传图）、字体、语言 zh / en / ja、头像。 |
| 记账提醒 | 个人中心入口 → 弹窗设置开关、每天时刻、通知文案；点确定才保存。 |
| 预算管理 | 月支出预算 + 可选分类预算；首页条纹进度条；50% / 80% / 100% 应用内各弹一次。 |
| 打卡勋章 | 按最长连续 / 累计天数与笔数解锁；首次达成弹窗；可佩戴到头像右下并显示称号。 |

金额在库里按 **分** 存储，界面按 **元** 展示。

偏好（背景、字体、语言、头像）和勋章已读 / 佩戴记录存在浏览器 `localStorage`；记账、提醒、预算全部走云端，必须登录后才能读写。

预览图在 [`assets/`](./assets/) 目录：

| 页面 | 预览 |
|------|------|
| 记一笔 | [assets/1.png](./assets/1.png) |
| 明细 | [assets/2.png](./assets/2.png) |
| 统计 | [assets/3.png](./assets/3.png) |
| 个人中心 | [assets/4.png](./assets/4.png) |
| 设置 | [assets/5.png](./assets/5.png) |
| 记账提醒 | [assets/6.png](./assets/6.png) |
| 登录 | [assets/7.png](./assets/7.png) |
| 注册 | [assets/8.png](./assets/8.png) |
| 忘记密码 | [assets/9.png](./assets/9.png) |

---

## 当前 Supabase 配置

本次接入的项目：

| 项 | 值 |
|----|-----|
| Project URL | `https://fvevsvsbyzougcjannqh.supabase.co` |
| Dashboard | [打开项目](https://supabase.com/dashboard/project/fvevsvsbyzougcjannqh) |
| 客户端密钥 | Dashboard → **Project Settings → API** 里的 anon / publishable key，填到 `.env` 的 `REACT_APP_SUPABASE_ANON_KEY` |

表结构在 `supabase/schema.sql`。已有库若还没有提醒表，再执行 `supabase/reminder.sql`；若还没有预算表，再执行 `supabase/budget.sql`。

主要表：

- `categories`：分类（`user_id + name + type` 唯一）
- `records`：记账（金额单位：分）
- `reminder_settings`：提醒开关、北京时间时刻、文案、当天是否已推过
- `reminder_subscriptions`：Web Push 订阅
- `budget_settings`：预算开关、月支出预算、本月黄/红弹窗是否已提示
- `budget_categories`：分类支出预算

RLS：只能读写自己的数据（`auth.uid() = user_id`）。

### Authentication（必改）

1. **Authentication → Providers → Email**：开启 Email  
2. **Confirm email：关闭**（关闭后注册立即登录，日常不再发确认邮件）  
3. **URL Configuration → Redirect URLs** 加上：
   - `http://localhost:5173/login**`
   - 线上地址同理，例如 `https://你的域名/login**`
4. 建议把 Refresh token 有效期调到 30～90 天，减少反复登录  

以前用验证码注册、还没有密码的账号：登录页点「忘记密码」，给原邮箱设一次密码即可。

登录态用 Supabase refresh token 存在 `localStorage`，并自动刷新。

---

## 打卡勋章

统计页有所选月份的打卡热力图（在月份选择器下方、其他图表上方）；勋章墙在个人中心「我的勋章」。未解锁仍显示原勋章样式，只是灰色。

**主勋章**看**最长连续**天数（断签后最长纪录仍保留）：

| 勋章 | 称号 | 条件 |
|------|------|------|
| 🪶 开笔入账 | 记账书童 | 任意一天打卡（连续 1 天） |
| 🌱 七日笔耕 | 萌芽账手 | 最长连续 7 天 |
| 🌙 三十而立 | 月下账房 | 最长连续 30 天 |
| 🧮 半载不辍 | 铁算盘 | 最长连续 182 天 |
| 👑 滴水穿石 | 一代账王 | 最长连续 365 天 |

**彩蛋**看累计，断签也不清零（「零断签」仍看最长连续 365）：

| 勋章 | 称号 | 条件 |
|------|------|------|
| 🕰 老账房 | 老账房 | 累计记账 100 天 |
| 💯 百分百 | 百分百 | 累计 100 笔 |
| 🌈 四季掌柜 | 四季掌柜 | 连续 4 个自然月都有记录 |
| 🎯 零断签 | 零断签 | 最长连续 365 天 |

交互：

- 首次达成：弹出「成就解锁」（勋章 + 介绍，底部确定 / 现在佩戴）
- 我的勋章：悬停看介绍，点击选中，已点亮可佩戴替换；未点亮「佩戴」为灰色
- 头像：外圈右下放已佩戴勋章；从未手动佩戴则自动用最高档主勋章
- 称号：显示在用户名下方，与用户名上下排列

已读、获得日期、佩戴选择只存在本机 `localStorage`（`ledger_seen_achievements`、`ledger_achievement_unlocked_at`、`ledger_equipped_badge`），换设备不会带过去。

---

## 预算管理

只统计**支出**。入口：我的 → **预算管理**。弹窗里改开关、本月总额、可选分类预算，**确定才保存**（取消 / X 不保存，点遮罩不关闭）。个人中心该行右侧只显示「已开启 / 已关闭」。

首页「记一笔」上方进度条（开启且月预算 > 0 才显示）：

- 文案：`本月预算：` + `已用 ¥x / ¥y`
- 条纹分段着色：0–50% 绿、50–80% 黄、80% 以上红（不是整条变色）
- 超支不额外写百分比文案

应用内提醒（`BudgetAlertModal`，不是推送），本月每个节点只弹一次：

| 进度 | 月预算文案 | 分类预算文案 |
|------|------------|--------------|
| 50% | 预算已过半 | `{分类} 预算已过半` |
| 80% | 预算预警 | `{分类} 预算预警` |
| 100% | 预算警告 | `{分类} 预算警告` |


---

## 记账提醒（Web Push）

规则：用户选一个 **北京时间钟点**（例如 `21:00`），每天到点后约 5 分钟内检查一次；**当天还没记账** 才发系统通知。关掉网页仍可能收到。点通知打开网站：已登录进「记一笔」，未登录先到登录页。

电脑关机 / 没网 / 拒绝通知权限则收不到。国内 Chrome 常因连不上 Google FCM 失败，可改用 Firefox 或给浏览器开可访问外网的代理。iPhone 需「添加到主屏幕」后在 PWA 里授权。

### 1. 生成 VAPID 密钥

```bash
npx web-push generate-vapid-keys
```

- 公钥 → `.env` 的 `REACT_APP_VAPID_PUBLIC_KEY`，并同步到 Edge Function Secret `VAPID_PUBLIC_KEY`
- 私钥 **只** 放到 Function Secret `VAPID_PRIVATE_KEY`

### 2. 部署 Edge Function

函数目录：`supabase/functions/send-reminders/`（`verify_jwt = false`，由 `CRON_SECRET` 鉴权）。

```bash
npx supabase functions deploy send-reminders --project-ref fvevsvsbyzougcjannqh
```

Secrets 在 Dashboard 左侧 **Edge Functions → Secrets**：

| Secret | 说明 |
|--------|------|
| `VAPID_PUBLIC_KEY` | 与前端公钥相同 |
| `VAPID_PRIVATE_KEY` | VAPID 私钥 |
| `VAPID_SUBJECT` | 必须是 URL，例如 `mailto:你的邮箱@xxx.com` |
| `CRON_SECRET` | 自定义一串随机字符，Cron 调用时带上 |

`SUPABASE_URL`、`SUPABASE_SERVICE_ROLE_KEY` 由平台自动注入，一般不用手填。

### 3. Cron 调用配置

函数自己不会到点执行，必须由 Cron **每分钟 HTTP POST 一次**。发送窗口是「到点后约 5 分钟」，每分钟扫一次才不容易漏；没到点会马上返回，对免费额度影响很小。

#### 先启用扩展

否则建任务会报找不到 `cron.job`：

1. Dashboard → **Database → Extensions**
2. 搜索并启用 **`pg_cron`**、**`pg_net`**

#### 再建定时任务

Dashboard → **Integrations → Cron** → Create a new job，按下面填：

| 字段 | 填什么 |
|------|--------|
| Name | `send-reminders`（任意名称） |
| Schedule | `* * * * *`（每分钟；不是只在 21:00 跑一次） |
| Type | HTTP Request |
| Method | **POST** |
| URL | `https://fvevsvsbyzougcjannqh.supabase.co/functions/v1/send-reminders` |
| Timeout | **5000～10000 ms**（默认 1000ms 太短，函数跑不完） |
| HTTP Headers | 见下方，必须带上 `CRON_SECRET` |
| HTTP Body | `{}` 即可 |

请求头用下面 **任选一种**（`CRON_SECRET` 必须和 Edge Function Secrets 里的值完全一致）。推荐第一种，避免和平台自动加的 `Authorization` 打架：

```
Content-Type: application/json
x-cron-secret: <CRON_SECRET>
```

或：

```
Content-Type: application/json
Authorization: Bearer <CRON_SECRET>
```

注意：`Authorization` 后面跟的是 **`CRON_SECRET`**，不是 anon / publishable key。函数 `verify_jwt = false`，用这串密钥鉴权。

保存后可在 Cron 任务日志或 Edge Function Logs 里看到每分钟的调用。返回 `{"ok":true,"sent":0,...}` 表示扫过了但还没到点或当天已记过账，属于正常。

前端入口：我的 → **记账提醒** → 弹窗改开关 / 时间 / 模板 → **确定** 保存。
