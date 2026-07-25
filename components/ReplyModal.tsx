'use client'

import { useState } from 'react'
import { X } from 'lucide-react'

interface Props {
  postId: string
  onClose: () => void
  onReplied: () => void
}

export default function ReplyModal({ postId, onClose, onReplied }: Props) {
  const [content, setContent] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!content.trim()) { setError('请输入回复内容'); return }
    setLoading(true); setError('')
    try {
      const { createClient } = await import('@/lib/supabase')
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setError('请先登录'); setLoading(false); return }
      const { error: replyError } = await supabase.from('replies').insert({
        post_id: postId,
        user_id: user.id,
        content: content.trim(),
      })
      if (replyError) { setError('回复失败'); setLoading(false); return }
      onReplied()
    } catch { setError('回复失败'); setLoading(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl w-full max-w-md p-6 relative animate-fade-in">
        <button onClick={onClose} className="absolute top-4 right-4 text-[var(--ink-light)] hover:text-[var(--ink-mid)]">
          <X size={20} />
        </button>
        <h2 className="font-cjk text-xl font-bold text-[var(--ink-deep)] mb-6">回复</h2>
        <div className="space-y-4">
          <textarea className="ink-textarea" placeholder="写下你的回复..." value={content} onChange={(e) => setContent(e.target.value)} rows={4} />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button onClick={handleSubmit} disabled={loading} className="btn-primary w-full">{loading ? '回复中...' : '回复'}</button>
        </div>
      </div>
    </div>
  )
}
