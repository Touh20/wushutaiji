'use client'

import { useState } from 'react'
import { CheckCircle, AlertCircle, ExternalLink, Loader } from 'lucide-react'

const SUPABASE_URL = 'https://grqfcmjhcknnqgrfyqjq.supabase.co'
const PROJECT_ID = 'grqfcmjhcknnqgrfyqjq'

export default function SetupPage() {
  const [step, setStep] = useState(0)
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const handleSignup = async () => {
    setStatus('loading')
    setMessage('正在注册管理员账号...')
    try {
      const res = await fetch(SUPABASE_URL + '/auth/v1/signup', {
        method: 'POST',
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdycWZjbWpoY2tubnFncmZ5cWpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ5NTQwODQsImV4cCI6MjEwMDUzMDA4NH0.r1AcMNiKI88mEhJgufeDycXu8EhfLP4tCHvKfgd3sNE',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: '3242211016@xaut.edu.cn',
          password: 'qbz1395555',
          data: {
            name: 'qbz1395555',
            student_id: '3242211016',
            nickname: '\u6478\u624b\u7684\u9c7c',
            avatar: 'apple',
            role: 'member'
          }
        })
      })
      const data = await res.json()
      if (res.ok || data.msg?.includes('already')) {
        setMessage('\u2713 管理员账号就绪！（学号 3242211016 / 密码 qbz1395555）')
        setStatus('success')
        setStep(1)
      } else {
        setMessage('\u00d7 ' + (data.msg || JSON.stringify(data)))
        setStatus('error')
      }
    } catch (e: any) {
      setMessage('\u00d7 ' + e.message)
      setStatus('error')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-[#1a1410] to-[#0a0806]">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <h1 className="ink-title text-3xl md:text-4xl font-bold mb-2">一键设置</h1>
          <p className="text-white/50 text-sm">西安理工大学武术太极社网站初始化</p>
        </div>

        <div className="space-y-4">
          {/* Step 0: Sign up */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className={'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ' +
                (step > 0 ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-white/60')}>
                {step > 0 ? '\u2713' : '1'}
              </div>
              <h2 className="text-white font-semibold">注册管理员账号</h2>
            </div>
            <p className="text-white/50 text-sm mb-4">学号 3242211016 / 昵称 摸手的鱼 / 密码 qbz1395555</p>
            {step === 0 && (
              <button onClick={handleSignup} disabled={status === 'loading'}
                className="bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-lg text-sm transition-all disabled:opacity-50">
                {status === 'loading' ? '\u6b63\u5728\u6ce8\u518c...' : '\u6ce8\u518c\u7ba1\u7406\u5458'}
              </button>
            )}
            {step > 0 && <p className="text-green-400 text-sm">\u2713 \u5df2\u5b8c\u6210</p>}
          </div>

          {/* Step 1: SQL */}
          <div className={'bg-white/5 backdrop-blur-sm border rounded-xl p-6 ' +
            (step >= 1 ? 'border-white/10' : 'border-white/5 opacity-50')}>
            <div className="flex items-center gap-3 mb-4">
              <div className={'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ' +
                (step > 1 ? 'bg-green-500/20 text-green-400' : step === 1 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-white/10 text-white/60')}>
                {step > 1 ? '\u2713' : '2'}
              </div>
              <h2 className="text-white font-semibold">执行数据库 SQL</h2>
            </div>
            <p className="text-white/50 text-sm mb-3">点击下方按钮，在 SQL Editor 中粘贴执行 supabase-schema.sql</p>
            <a href={'https://supabase.com/dashboard/project/' + PROJECT_ID + '/sql/new'}
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-6 py-2 rounded-lg text-sm transition-all">
              打开 SQL Editor <ExternalLink size={14} />
            </a>
            <details className="mt-3">
              <summary className="text-white/40 text-xs cursor-pointer hover:text-white/60">点击查看 SQL 内容</summary>
              <pre className="mt-2 p-3 bg-black/30 rounded-lg text-xs text-white/50 overflow-x-auto max-h-60 overflow-y-auto">
                {`-- 复制下面全部SQL到编辑器中执行

-- Users table
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

-- Trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS \$\$
BEGIN
  INSERT INTO public.users (id, student_id, name, nickname, avatar_url, role)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'student_id', NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'nickname', COALESCE(NEW.raw_user_meta_data->>'avatar', 'apple'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'member'));
  RETURN NEW;
END; \$\$;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Other tables
CREATE TABLE IF NOT EXISTS public.announcements (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), created_at TIMESTAMPTZ DEFAULT NOW(), title TEXT NOT NULL, content TEXT NOT NULL, is_pinned BOOLEAN DEFAULT FALSE);
CREATE TABLE IF NOT EXISTS public.posts (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), created_at TIMESTAMPTZ DEFAULT NOW(), user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE, category TEXT NOT NULL, title TEXT NOT NULL, content TEXT NOT NULL, images TEXT[] DEFAULT '{}', is_reported BOOLEAN DEFAULT FALSE);
CREATE TABLE IF NOT EXISTS public.replies (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), created_at TIMESTAMPTZ DEFAULT NOW(), post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE, user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE, content TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS public.activity_images (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), created_at TIMESTAMPTZ DEFAULT NOW(), image_url TEXT NOT NULL, title TEXT DEFAULT '', alt_text TEXT DEFAULT '');
CREATE TABLE IF NOT EXISTS public.ads (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), created_at TIMESTAMPTZ DEFAULT NOW(), image_url TEXT NOT NULL, link_url TEXT DEFAULT '', is_active BOOLEAN DEFAULT TRUE);
CREATE TABLE IF NOT EXISTS public.site_settings (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), created_at TIMESTAMPTZ DEFAULT NOW(), logo_url TEXT DEFAULT '', slot_1 TEXT[] DEFAULT '{}', slot_2 TEXT[] DEFAULT '{}', slot_3 TEXT[] DEFAULT '{}', slot_4 TEXT[] DEFAULT '{}');

-- RLS Policies (simplified - full in supabase-schema.sql)
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "\u516c\u5f00\u53ef\u8bfb" ON public.announcements FOR SELECT USING (true);
CREATE POLICY "\u516c\u5f00\u53ef\u8bfb" ON public.posts FOR SELECT USING (true);
CREATE POLICY "\u516c\u5f00\u53ef\u8bfb" ON public.replies FOR SELECT USING (true);
CREATE POLICY "\u516c\u5f00\u53ef\u8bfb" ON public.activity_images FOR SELECT USING (true);
CREATE POLICY "\u516c\u5f00\u53ef\u8bfb" ON public.ads FOR SELECT USING (true);
CREATE POLICY "\u516c\u5f00\u53ef\u8bfb" ON public.site_settings FOR SELECT USING (true);
`}
              </pre>
            </details>
            {step === 1 && (
              <button onClick={() => setStep(2)} className="mt-4 bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-lg text-sm transition-all">
                \u6211\u5df2\u6267\u884c SQL
              </button>
            )}
          </div>

          {/* Step 2: Storage */}
          <div className={'bg-white/5 backdrop-blur-sm border rounded-xl p-6 ' +
            (step >= 2 ? 'border-white/10' : 'border-white/5 opacity-50')}>
            <div className="flex items-center gap-3 mb-4">
              <div className={'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ' +
                (step > 2 ? 'bg-green-500/20 text-green-400' : step === 2 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-white/10 text-white/60')}>
                {step > 2 ? '\u2713' : '3'}
              </div>
              <h2 className="text-white font-semibold">创建存储桶</h2>
            </div>
            <p className="text-white/50 text-sm mb-3">在 Storage 中创建 5 个公开 bucket</p>
            <a href={'https://supabase.com/dashboard/project/' + PROJECT_ID + '/storage/buckets'}
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-6 py-2 rounded-lg text-sm">
              打开 Storage <ExternalLink size={14} />
            </a>
            <div className="mt-3 flex flex-wrap gap-2">
              {['post-images', 'activity-images', 'ads', 'site-assets', 'avatars'].map(b => (
                <span key={b} className="px-3 py-1 bg-white/5 rounded text-xs text-white/50">{b}</span>
              ))}
            </div>
            {step === 2 && (
              <button onClick={() => setStep(3)} className="mt-4 bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-lg text-sm">
                \u5df2\u521b\u5efa
              </button>
            )}
          </div>

          {/* Step 3: Admin role */}
          <div className={'bg-white/5 backdrop-blur-sm border rounded-xl p-6 ' +
            (step >= 3 ? 'border-white/10' : 'border-white/5 opacity-50')}>
            <div className="flex items-center gap-3 mb-4">
              <div className={'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ' +
                (step > 3 ? 'bg-green-500/20 text-green-400' : step === 3 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-white/10 text-white/60')}>
                {step > 3 ? '\u2713' : '4'}
              </div>
              <h2 className="text-white font-semibold">设置超级管理员</h2>
            </div>
            <p className="text-white/50 text-sm mb-3">运行下面这行 SQL 把你的账号设为超级管理员</p>
            <a href={'https://supabase.com/dashboard/project/' + PROJECT_ID + '/sql/new'}
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-6 py-2 rounded-lg text-sm">
              打开 SQL Editor <ExternalLink size={14} />
            </a>
            <pre className="mt-3 p-3 bg-black/30 rounded-lg text-sm text-green-400">UPDATE public.users SET role = 'super_admin' WHERE student_id = '3242211016';</pre>
            {step === 3 && (
              <button onClick={() => setStep(4)} className="mt-4 bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-lg text-sm">
                \u5df2\u8bbe\u7f6e
              </button>
            )}
          </div>

          {/* Complete */}
          {step === 4 && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6 text-center">
              <CheckCircle size={40} className="mx-auto mb-3 text-green-400" />
              <h2 className="text-white font-semibold text-lg mb-2">设置完成！</h2>
              <p className="text-white/50 text-sm mb-4">
                管理员：学号 3242211016 / 密码 qbz1395555
              </p>
              <div className="flex justify-center gap-3">
                <a href="/" className="bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-lg text-sm">回到首页</a>
                <a href="/admin" className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-6 py-2 rounded-lg text-sm">进入后台</a>
              </div>
            </div>
          )}

          {message && (
            <div className={'flex items-center gap-2 text-sm p-3 rounded-lg ' +
              (status === 'success' ? 'bg-green-500/10 text-green-400' :
               status === 'error' ? 'bg-red-500/10 text-red-400' : 'bg-white/5 text-white/60')}>
              {status === 'loading' && <Loader size={16} className="animate-spin" />}
              {status === 'success' && <CheckCircle size={16} />}
              {status === 'error' && <AlertCircle size={16} />}
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
