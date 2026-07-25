'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Megaphone, MessageSquare, Users,
  Image as ImageIcon, Settings, LogOut, Newspaper, Shield
} from 'lucide-react'

const SIDEBAR_ITEMS = [
  { label: '控制台', href: '/admin', icon: LayoutDashboard },
  { label: '公告管理', href: '/admin/announcements', icon: Megaphone },
  { label: '帖子管理', href: '/admin/posts', icon: MessageSquare },
  { label: '用户管理', href: '/admin/users', icon: Users },
  { label: '广告管理', href: '/admin/ads', icon: Newspaper },
  { label: '活动照片', href: '/admin/photos', icon: ImageIcon },
  { label: '网站设置', href: '/admin/settings', icon: Settings },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null)
  const [role, setRole] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    async function checkAuth() {
      const { createClient } = await import('@/lib/supabase')
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/'); return }
      try {
        var tok = (await supabase.auth.getSession()).data?.session?.access_token || '';
        var res = await fetch('/api/my-role', { headers: { 'Authorization': 'Bearer ' + tok } });
        var data = await res.json();
        if (data.role === 'super_admin' || data.role === 'admin') {
          setUser(session.user);
          setRole(data.role);
          setLoading(false);
        } else {
          setErrorMsg('你不是管理员，无法访问后台 (role: ' + data.role + ')');
          setLoading(false);
        }
      } catch(e: any) {
        setErrorMsg('查询失败: ' + e.message);
        setLoading(false);
      }
    }
    checkAuth()
  }, [router])

  const handleLogout = async () => {
    const { createClient } = await import('@/lib/supabase')
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-[var(--ink-light)]">{errorMsg || '加载中...'}</div>
  }

  // Login page doesn't need sidebar
  if (false && pathname === '/admin/login') {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-56 bg-[var(--ink-deep)] text-white shrink-0 hidden md:flex flex-col">
        <div className="p-4 border-b border-white/10">
          <Link href="/admin" className="flex items-center gap-2">
            <Shield size={20} />
            <span className="font-cjk font-semibold">管理后台</span>
          </Link>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {SIDEBAR_ITEMS.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive ? 'bg-white/15 text-white' : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon size={16} />
                {item.label}
              </Link>
            )
          })}
        </nav>
        <div className="p-3 border-t border-white/10">
          <div className="flex items-center gap-3 px-3 py-2 text-sm text-white/50">
            <span>{role === 'super_admin' ? '超级管理员' : '管理员'}</span>
            <button onClick={handleLogout} className="ml-auto text-white/40 hover:text-white/80">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-[var(--ink-deep)] text-white p-3 flex items-center justify-between">
        <Link href="/admin" className="flex items-center gap-2 text-sm">
          <Shield size={16} />
          <span className="font-cjk">管理后台</span>
        </Link>
        <button onClick={handleLogout} className="text-white/50">
          <LogOut size={16} />
        </button>
      </div>

      {/* Main content */}
      <div className="flex-1 bg-[var(--paper)] md:pt-0 pt-12">
        <div className="max-w-5xl mx-auto p-4 md:p-8">
          {children}
        </div>
      </div>
    </div>
  )
}
