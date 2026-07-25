'use client'

import { useEffect, useState } from 'react'
import { Trash2, AlertTriangle, Check } from 'lucide-react'
import type { Post } from '@/types'
import { CATEGORIES } from '@/types'

export default function AdminPosts() {
  const [posts, setPosts] = useState<Post[]>([])
  const [filter, setFilter] = useState<'all' | 'reported'>('all')

  const load = async () => {
    const { createClient } = await import('@/lib/supabase')
    const supabase = createClient()
    let query = supabase.from('posts').select('*, user:users(*)').order('created_at', { ascending: false })
    if (filter === 'reported') query = query.eq('is_reported', true)
    const { data } = await query
    if (data) setPosts(data as Post[])
  }

  useEffect(() => { load() }, [filter])

  const del = async (id: string) => {
    const { createClient } = await import('@/lib/supabase')
    const supabase = createClient()
    await supabase.from('posts').delete().eq('id', id)
    load()
  }

  const clearReport = async (id: string) => {
    const { createClient } = await import('@/lib/supabase')
    const supabase = createClient()
    await supabase.from('posts').update({ is_reported: false }).eq('id', id)
    load()
  }

  return (
    <div>
      <h1 className="font-cjk text-2xl font-bold text-[var(--ink-deep)] mb-6">帖子管理</h1>
      <div className="flex gap-2 mb-6">
        <button onClick={() => setFilter('all')} className={`px-4 py-1.5 text-sm rounded-full transition-all ${filter === 'all' ? 'bg-[var(--ink-mid)] text-white' : 'bg-white text-[var(--ink-mid)] border border-[rgba(74,55,40,0.15)]'}`}>全部</button>
        <button onClick={() => setFilter('reported')} className={`px-4 py-1.5 text-sm rounded-full transition-all ${filter === 'reported' ? 'bg-red-500 text-white' : 'bg-white text-[var(--ink-mid)] border border-[rgba(74,55,40,0.15)]'}`}>被举报</button>
      </div>
      <div className="space-y-3">
        {posts.map((post) => (
          <div key={post.id} className="ink-card p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm">{post.user?.nickname || '未知'}</span>
                  <span className="text-xs px-1.5 py-0.5 rounded bg-[rgba(74,55,40,0.08)] text-[var(--ink-light)]">{CATEGORIES[post.category]}</span>
                  {post.is_reported && <span className="text-xs text-red-500 flex items-center gap-1"><AlertTriangle size={12} /> 被举报</span>}
                </div>
                <h3 className="font-semibold text-[var(--ink-deep)]">{post.title}</h3>
                <p className="text-sm text-[var(--ink-mid)] mt-1 line-clamp-2">{post.content}</p>
                <p className="text-xs text-[var(--ink-light)] mt-2">{new Date(post.created_at).toLocaleString('zh-CN')}</p>
              </div>
              <div className="flex items-center gap-2 ml-4 shrink-0">
                {post.is_reported && <button onClick={() => clearReport(post.id)} className="text-green-500 hover:text-green-600 p-1"><Check size={16} /></button>}
                <button onClick={() => del(post.id)} className="text-red-400 hover:text-red-500 p-1"><Trash2 size={16} /></button>
              </div>
            </div>
          </div>
        ))}
        {posts.length === 0 && <p className="text-center py-8 text-[var(--ink-light)]">暂无帖子</p>}
      </div>
    </div>
  )
}
