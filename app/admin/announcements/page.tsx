'use client'

import { useEffect, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import type { Announcement } from '@/types'

export default function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isPinned, setIsPinned] = useState(false)
  const [message, setMessage] = useState('')

  const load = async () => {
    const { createClient } = await import('@/lib/supabase')
    const supabase = createClient()
    const { data } = await supabase.from('announcements').select('*').order('created_at', { ascending: false })
    if (data) setAnnouncements(data as Announcement[])
  }

  useEffect(() => { load() }, [])

  const add = async () => {
    if (!title.trim() || !content.trim()) { setMessage('请填写标题和内容'); return }
    const { createClient } = await import('@/lib/supabase')
    const supabase = createClient()
    const { error } = await supabase.from('announcements').insert({ title: title.trim(), content: content.trim(), is_pinned: isPinned })
    if (error) { setMessage('发布失败'); return }
    setTitle(''); setContent(''); setIsPinned(false); setMessage('发布成功！')
    load()
  }

  const remove = async (id: string) => {
    const { createClient } = await import('@/lib/supabase')
    const supabase = createClient()
    await supabase.from('announcements').delete().eq('id', id)
    load()
  }

  return (
    <div>
      <h1 className="font-cjk text-2xl font-bold text-[var(--ink-deep)] mb-6">公告管理</h1>
      <div className="ink-card p-6 mb-6">
        <h2 className="font-cjk text-lg font-semibold text-[var(--ink-deep)] mb-4">发布新公告</h2>
        <div className="space-y-4">
          <input type="text" className="ink-input" placeholder="公告标题" value={title} onChange={(e) => setTitle(e.target.value)} />
          <textarea className="ink-textarea" placeholder="公告内容" value={content} onChange={(e) => setContent(e.target.value)} rows={4} />
          <label className="flex items-center gap-2 text-sm text-[var(--ink-mid)]">
            <input type="checkbox" checked={isPinned} onChange={(e) => setIsPinned(e.target.checked)} className="rounded" />
            设为置顶
          </label>
          <button onClick={add} className="btn-primary inline-flex items-center gap-2"><Plus size={16} /> 发布公告</button>
          {message && <p className={`text-sm ${message.includes('成功') ? 'text-green-600' : 'text-red-500'}`}>{message}</p>}
        </div>
      </div>
      <div className="space-y-3">
        {announcements.map((ann) => (
          <div key={ann.id} className="ink-card p-4 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                {ann.is_pinned && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded">置顶</span>}
                <h3 className="font-semibold text-[var(--ink-deep)]">{ann.title}</h3>
              </div>
              <p className="text-sm text-[var(--ink-light)] mt-1">{ann.content}</p>
              <p className="text-xs text-[var(--ink-light)] mt-2 opacity-60">{new Date(ann.created_at).toLocaleString('zh-CN')}</p>
            </div>
            <button onClick={() => remove(ann.id)} className="text-red-400 hover:text-red-500 shrink-0"><Trash2 size={16} /></button>
          </div>
        ))}
      </div>
    </div>
  )
}
