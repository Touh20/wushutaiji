'use client'

import { useEffect, useState } from 'react'
import { Megaphone, MessageSquare, Users, Image as ImageIcon, Newspaper } from 'lucide-react'
import Link from 'next/link'

export default function AdminDashboard() {
  const [stats, setStats] = useState({ posts: 0, users: 0, announcements: 0, reports: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { createClient } = await import('@/lib/supabase')
      const supabase = createClient()
      const [p, u, a, r] = await Promise.all([
        supabase.from('posts').select('*', { count: 'exact', head: true }),
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('announcements').select('*', { count: 'exact', head: true }),
        supabase.from('posts').select('*', { count: 'exact', head: true }).eq('is_reported', true),
      ])
      setStats({
        posts: p.count || 0,
        users: u.count || 0,
        announcements: a.count || 0,
        reports: r.count || 0,
      })
      setLoading(false)
    }
    load()
  }, [])

  const cards = [
    { label: '帖子总数', value: stats.posts, icon: MessageSquare, href: '/admin/posts', color: 'text-blue-500' },
    { label: '注册用户', value: stats.users, icon: Users, href: '/admin/users', color: 'text-green-500' },
    { label: '公告数量', value: stats.announcements, icon: Megaphone, href: '/admin/announcements', color: 'text-purple-500' },
    { label: '待处理举报', value: stats.reports, icon: Newspaper, href: '/admin/posts', color: 'text-red-500', urgent: stats.reports > 0 },
  ]

  return (
    <div>
      <h1 className="font-cjk text-2xl font-bold text-[var(--ink-deep)] mb-6">控制台</h1>
      {loading ? (
        <div className="text-center py-12 text-[var(--ink-light)]">加载中...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {cards.map((card) => {
            const Icon = card.icon
            return (
              <Link key={card.label} href={card.href} className="ink-card p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <Icon size={24} className={card.color} />
                  {card.urgent && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full animate-pulse">有举报</span>}
                </div>
                <p className="text-2xl font-bold text-[var(--ink-deep)]">{card.value}</p>
                <p className="text-sm text-[var(--ink-light)] mt-1">{card.label}</p>
              </Link>
            )
          })}
        </div>
      )}

      <div className="ink-card p-6">
        <h2 className="font-cjk text-lg font-semibold text-[var(--ink-deep)] mb-3">快捷操作</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <Link href="/admin/announcements" className="btn-secondary text-center text-sm">发布公告</Link>
          <Link href="/admin/posts" className="btn-secondary text-center text-sm">管理帖子</Link>
          <Link href="/admin/users" className="btn-secondary text-center text-sm">管理用户</Link>
          <Link href="/admin/settings" className="btn-secondary text-center text-sm">修改网站设置</Link>
          <Link href="/admin/photos" className="btn-secondary text-center text-sm">上传活动照片</Link>
          <Link href="/admin/ads" className="btn-secondary text-center text-sm">管理广告</Link>
        </div>
      </div>
    </div>
  )
}
