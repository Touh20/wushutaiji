-- =============================================
-- 西安理工大学武术太极社 - Supabase 数据库结构
-- 在 Supabase SQL Editor 中执行此脚本
-- =============================================

-- 1. 用户表（关联 auth.users）
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  student_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  nickname TEXT NOT NULL,
  avatar_url TEXT DEFAULT 'apple',
  role TEXT DEFAULT 'member' CHECK (role IN ('super_admin', 'admin', 'member')),
  is_banned BOOLEAN DEFAULT FALSE,
  profile_change_month TEXT DEFAULT '',
  profile_change_count INTEGER DEFAULT 0
);

-- 自动创建用户档案的触发器
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.users (id, student_id, name, nickname, avatar_url, role)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'student_id',
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'nickname',
    COALESCE(NEW.raw_user_meta_data->>'avatar', 'apple'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'member')
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. 公告表
CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT FALSE
);

-- 3. 帖子表
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('notice', 'lost_found', 'trade', 'study', 'game', 'chat')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  is_reported BOOLEAN DEFAULT FALSE
);

-- 4. 回复表
CREATE TABLE IF NOT EXISTS public.replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL
);

-- 5. 活动照片表
CREATE TABLE IF NOT EXISTS public.activity_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  image_url TEXT NOT NULL,
  title TEXT DEFAULT '',
  alt_text TEXT DEFAULT ''
);

-- 6. 广告表
CREATE TABLE IF NOT EXISTS public.ads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  image_url TEXT NOT NULL,
  link_url TEXT DEFAULT '',
  is_active BOOLEAN DEFAULT TRUE
);

-- 7. 网站设置表
CREATE TABLE IF NOT EXISTS public.site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  logo_url TEXT DEFAULT '',
  slot_1 TEXT[] DEFAULT '{}',
  slot_2 TEXT[] DEFAULT '{}',
  slot_3 TEXT[] DEFAULT '{}',
  slot_4 TEXT[] DEFAULT '{}'
);

-- =============================================
-- Row Level Security (RLS)
-- =============================================

-- 公开可读的表
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 所有人可读
CREATE POLICY "公开可读" ON public.announcements FOR SELECT USING (true);
CREATE POLICY "公开可读" ON public.posts FOR SELECT USING (true);
CREATE POLICY "公开可读" ON public.replies FOR SELECT USING (true);
CREATE POLICY "公开可读" ON public.activity_images FOR SELECT USING (true);
CREATE POLICY "公开可读" ON public.ads FOR SELECT USING (true);
CREATE POLICY "公开可读" ON public.site_settings FOR SELECT USING (true);

-- 用户表：用户可读自己的数据，管理员可读全部
CREATE POLICY "用户可读自己" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "管理员可读全部用户" ON public.users FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);

-- 已登录用户可发帖
CREATE POLICY "已登录可发帖" ON public.posts FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "已登录可回复" ON public.replies FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 用户可删自己的帖子
CREATE POLICY "用户可删自己帖子" ON public.posts FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "管理员可删任何帖子" ON public.posts FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);

-- 用户可删自己的回复
CREATE POLICY "用户可删自己回复" ON public.replies FOR DELETE USING (auth.uid() = user_id);

-- 更新权限
CREATE POLICY "管理员可更新帖子" ON public.posts FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);
CREATE POLICY "管理员可更新用户" ON public.users FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);

-- 管理员可管理所有内容
CREATE POLICY "管理员管理公告" ON public.announcements FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);
CREATE POLICY "管理员管理照片" ON public.activity_images FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);
CREATE POLICY "管理员管理广告" ON public.ads FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);
CREATE POLICY "管理员管理网站设置" ON public.site_settings FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);

-- =============================================
-- Storage buckets（在 Supabase Dashboard 创建）
-- 1. post-images - 帖子图片
-- 2. activity-images - 活动照片
-- 3. ads - 广告图片
-- 4. site-assets - 网站资源（Logo、插槽图片）
-- =============================================

-- 创建 storage buckets 的 SQL（需要在 Supabase Dashboard 操作或在 API 中创建）
-- INSERT INTO storage.buckets (id, name, public) VALUES
--   ('post-images', 'post-images', true),
--   ('activity-images', 'activity-images', true),
--   ('ads', 'ads', true),
--   ('site-assets', 'site-assets', true);
