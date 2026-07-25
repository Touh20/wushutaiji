# 西安理工大学武术太极社 官网 -- 最终部署版

## 技术栈

- **框架**: Next.js 14 (App Router)
- **样式**: Tailwind CSS 3 + 自定义水墨风主题
- **数据库**: Supabase (PostgreSQL + Auth + Storage)
- **部署**: Vercel（免费套餐）

## 功能

- 🏠 首页：社团介绍、荣誉展示、公告、活动照片墙
- 📢 公告栏：管理员发布社团公告
- 🏛 校园墙（论坛）：失物招领、闲置交易、考研交流、游戏娱乐、吐槽灌水
- 📝 加入我们：注册（姓名 + 学号 + 昵称 + 水果头像）
- 🎨 活动风采：照片墙
- 🖼 网站设置：Logo 及 4 个图片插槽（后台可编辑）
- 📰 广告位管理
- ⚙️ 管理后台：公告管理、帖子管理、用户管理（封号/解封）、广告管理
- 📱 响应式设计，支持移动端

## 快速开始

### 1. 配置数据库

打开 Supabase Dashboard：
**[https://supabase.com/dashboard/project/grqfcmjhcknnqgrfyqjq](https://supabase.com/dashboard/project/grqfcmjhcknnqgrfyqjq)**

**① SQL Editor** → 把 `supabase-schema.sql` 全部内容复制进去执行
**② Storage** → 创建 5 个公开 bucket：
- `post-images`
- `activity-images`
- `ads`
- `site-assets`
- `avatars`

### 2. 注册管理员

打开终端（在项目目录下），运行：

```bash
node setup.mjs
```

这将会注册管理员账号：**学号 3242211016 / 密码 qbz1395555**

### 3. 设置超级管理员权限

去 Supabase Dashboard → **SQL Editor**，运行：
```sql
UPDATE public.users SET role = 'super_admin' WHERE student_id = '3242211016';
```

### 4. 本地运行

```bash
pnpm dev
```

访问 **http://localhost:3000** → 右上角齿轮图标 → 设置头像和昵称
访问 **http://localhost:3000/admin** → 管理后台

### 5. 部署到 Vercel（上线）

1. 在 GitHub 创建新仓库，把项目代码上传
2. 打开 [vercel.com](https://vercel.com) → Import 你的 GitHub 仓库
3. 在 Vercel 的 Environment Variables 添加：
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://grqfcmjhcknnqgrfyqjq.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdycWZjbWpoY2tubnFncmZ5cWpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ5NTQwODQsImV4cCI6MjEwMDUzMDA4NH0.r1AcMNiKI88mEhJgufeDycXu8EhfLP4tCHvKfgd3sNE`
4. 部署后自动获得 `wushutaiji.vercel.app`

```
管理员账号：**学号 3242211016 / 密码 qbz1395555 / 昵称 摸手的鱼**
社团电话：**13109570357**
