'use client'

import { useEffect, useState, useRef } from 'react'
import { Plus, Trash2, Upload } from 'lucide-react'
import type { ActivityImage } from '@/types'

export default function AdminPhotos() {
  const [photos, setPhotos] = useState<ActivityImage[]>([])
  const [title, setTitle] = useState('')
  const [alt, setAlt] = useState('')
  const [message, setMessage] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const load = async () => {
    const { createClient } = await import('@/lib/supabase')
    const supabase = createClient()
    const { data } = await supabase.from('activity_images').select('*').order('created_at', { ascending: false })
    if (data) setPhotos(data as ActivityImage[])
  }

  useEffect(() => { load() }, [])

  const addPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const { createClient } = await import('@/lib/supabase')
    const supabase = createClient()
    const fileName = `activity-${Date.now()}.${file.name.split('.').pop()}`
    const { error: upErr } = await supabase.storage.from('activity-images').upload(fileName, file)
    if (upErr) { setMessage('上传失败'); return }
    const { data: { publicUrl } } = supabase.storage.from('activity-images').getPublicUrl(fileName)
    const { error } = await supabase.from('activity_images').insert({ image_url: publicUrl, title: title || file.name, alt_text: alt || title || '' })
    if (error) { setMessage('保存失败'); return }
    setTitle(''); setAlt(''); setMessage('添加成功！')
    load()
  }

  const remove = async (id: string) => {
    const { createClient } = await import('@/lib/supabase')
    const supabase = createClient()
    await supabase.from('activity_images').delete().eq('id', id)
    load()
  }

  return (
    <div>
      <h1 className="font-cjk text-2xl font-bold text-[var(--ink-deep)] mb-6">活动照片管理</h1>
      <div className="ink-card p-6 mb-6">
        <h2 className="font-cjk text-lg font-semibold text-[var(--ink-deep)] mb-4">上传新照片</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input type="text" className="ink-input" placeholder="照片标题（可选）" value={title} onChange={(e) => setTitle(e.target.value)} />
            <input type="text" className="ink-input" placeholder="描述文字（可选）" value={alt} onChange={(e) => setAlt(e.target.value)} />
          </div>
          <input type="file" accept="image/*" className="hidden" ref={fileRef} onChange={addPhoto} />
          <button onClick={() => fileRef.current?.click()} className="btn-primary inline-flex items-center gap-2"><Upload size={16} /> 选择并上传</button>
          {message && <p className={`text-sm ${message.includes('成功') ? 'text-green-600' : 'text-red-500'}`}>{message}</p>}
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {photos.map((p) => (
          <div key={p.id} className="ink-card overflow-hidden group">
            <div className="aspect-square overflow-hidden relative">
              <img src={p.image_url} alt={p.alt_text || p.title} className="w-full h-full object-cover" />
              <button onClick={() => remove(p.id)} className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14} /></button>
            </div>
            {p.title && <div className="p-2"><p className="text-xs text-[var(--ink-mid)] truncate">{p.title}</p></div>}
          </div>
        ))}
        {photos.length === 0 && <p className="col-span-full text-center py-8 text-[var(--ink-light)]">暂无照片</p>}
      </div>
    </div>
  )
}
