'use client'

import { useEffect, useState } from 'react'
import { Ban, CheckCircle } from 'lucide-react'
import type { User } from '@/types'

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [message, setMessage] = useState('')

  const load = async () => {
    const { createClient } = await import('@/lib/supabase')
    const supabase = createClient()
    const { data } = await supabase.from('users').select('*').order('created_at', { ascending: false })
    if (data) setUsers(data as User[])
  }

  useEffect(() => { load() }, [])

  const toggleBan = async (userId: string, currentlyBanned: boolean) => {
    const { createClient } = await import('@/lib/supabase')
    const supabase = createClient()
    const { error } = await supabase.from('users').update({ is_banned: !currentlyBanned }).eq('id', userId)
    if (error) { setMessage('操作失败'); return }
    setMessage(currentlyBanned ? '已解封' : '已封号')
    load()
  }

  return (
    <div>
      <h1 className="font-cjk text-2xl font-bold text-[var(--ink-deep)] mb-6">用户管理</h1>
      {message && <p className="text-sm text-green-600 mb-4">{message}</p>}
      <div className="space-y-3">
        {users.map((u) => (
          <div key={u.id} className="ink-card p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[var(--ink-mid)] flex items-center justify-center text-xl shrink-0">
                {getFruitEmoji(u.avatar_url)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[var(--ink-deep)]">{u.nickname}</span>
                  <span className={`text-xs px-2 py-0.5 rounded ${u.role === 'super_admin' ? 'bg-yellow-100 text-yellow-700' : u.role === 'admin' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                    {u.role === 'super_admin' ? '超级管理员' : u.role === 'admin' ? '管理员' : '成员'}
                  </span>
                  {u.is_banned && <span className="text-xs text-red-500 bg-red-50 px-2 py-0.5 rounded">已封禁</span>}
                </div>
                <p className="text-xs text-[var(--ink-light)]">
                  姓名: {u.name} | 学号: {u.student_id}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {u.role === 'member' && (
                <button onClick={() => toggleBan(u.id, u.is_banned)} className={`text-sm inline-flex items-center gap-1 px-3 py-1.5 rounded-md transition-all ${
                  u.is_banned ? 'text-green-600 bg-green-50 hover:bg-green-100' : 'text-red-500 bg-red-50 hover:bg-red-100'
                }`}>
                  {u.is_banned ? <CheckCircle size={14} /> : <Ban size={14} />}
                  {u.is_banned ? '解封' : '封号'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function getFruitEmoji(id: string): string {
  const map: Record<string, string> = {
    apple: '\u{1F34E}', orange: '\u{1F34A}', lemon: '\u{1F34B}', grape: '\u{1F347}',
    watermelon: '\u{1F349}', strawberry: '\u{1F353}', peach: '\u{1F351}', cherry: '\u{1F352}',
    pear: '\u{1F350}', banana: '\u{1F34C}', kiwi: '\u{1F95D}', blueberry: '\u{1FAD0}',
  }
  return map[id] || '\u{1F34E}'
}
