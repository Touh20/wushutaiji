'use client'

import { useState, useRef } from 'react'
import { X, Image as ImageIcon } from 'lucide-react'
import { CATEGORIES, type CategoryKey } from '@/types'

interface Props {
  onClose: () => void
  onPosted: () => void
}

export default function PostModal({ onClose, onPosted }: Props) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState<CategoryKey>('chat')
  const [images, setImages] = useState<string[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const { createClient } = await import('@/lib/supabase')
      const supabase = createClient()
      const fileName = `${Date.now()}-${file.name}`
      const { data, error: uploadError } = await supabase.storage.from('post-images').upload(fileName, file)
      if (uploadError) { setError('上传失败'); return }
      const { data: { publicUrl } } = supabase.storage.from('post-images').getPublicUrl(fileName)
      setImages([...images, publicUrl])
    } catch { setError('上传失败') }
  }

  const handleSubmit = async () => {
    if (!title.trim()) { setError('请输入标题'); return }
    if (!content.trim()) { setError('请输入内容'); return }
    setLoading(true); setError('')
    try {
      var m2 = await import('@/lib/supabase');
      var sb = m2.createClient();
      var sess = await sb.auth.getSession();
      var uid = sess.data?.session?.user?.id || '';
      var res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), content: content.trim(), category, images, userId: uid })
      })
      var data = await res.json()
      if (data.error) { setError(data.error); setLoading(false); return }
      onPosted()
    } catch { setError('发帖失败'); setLoading(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl w-full max-w-lg p-6 relative animate-fade-in max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-[var(--ink-light)] hover:text-[var(--ink-mid)]">
          <X size={20} />
        </button>
        <h2 className="font-cjk text-xl font-bold text-[var(--ink-deep)] mb-6">发布新帖</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-[var(--ink-mid)] mb-1">板块</label>
            <select className="ink-select" value={category} onChange={(e) => setCategory(e.target.value as CategoryKey)}>
              {Object.entries(CATEGORIES).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-[var(--ink-mid)] mb-1">标题</label>
            <input type="text" className="ink-input" placeholder="给帖子起个标题" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm text-[var(--ink-mid)] mb-1">内容</label>
            <textarea className="ink-textarea" placeholder="写点什么..." value={content} onChange={(e) => setContent(e.target.value)} rows={5} />
          </div>
          <div>
            <label className="block text-sm text-[var(--ink-mid)] mb-1">图片（可选）</label>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            <button onClick={() => fileInputRef.current?.click()} className="btn-secondary text-sm inline-flex items-center gap-1">
              <ImageIcon size={16} /> 上传图片
            </button>
            {images.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {images.map((img, i) => (
                  <div key={i} className="relative">
                    <img src={img} alt="" className="w-16 h-16 object-cover rounded" />
                    <button onClick={() => setImages(images.filter((_, j) => j !== i))} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">×</button>
                  </div>
                ))}
              </div>
            )}
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button onClick={handleSubmit} disabled={loading} className="btn-primary w-full">{loading ? '发布中...' : '发布'}</button>
        </div>
      </div>
    </div>
  )
}
