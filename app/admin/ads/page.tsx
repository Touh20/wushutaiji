'use client'

import { useEffect, useState, useRef } from 'react'
import { Plus, Trash2, Upload, ExternalLink } from 'lucide-react'
import type { Ad } from '@/types'

export default function AdminAds() {
  const [ads, setAds] = useState<Ad[]>([])
  const [imageUrl, setImageUrl] = useState('')
  const [linkUrl, setLinkUrl] = useState('')
  const [message, setMessage] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const load = async () => {
    const { createClient } = await import('@/lib/supabase')
    const supabase = createClient()
    const { data } = await supabase.from('ads').select('*').order('created_at', { ascending: false })
    if (data) setAds(data as Ad[])
  }

  useEffect(() => { load() }, [])

  const uploadImage = async (file: File): Promise<string> => {
    const { createClient } = await import('@/lib/supabase')
    const supabase = createClient()
    const fileName = `ad-${Date.now()}.${file.name.split('.').pop()}`
    await supabase.storage.from('ads').upload(fileName, file)
    const { data: { publicUrl } } = supabase.storage.from('ads').getPublicUrl(fileName)
    return publicUrl
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try { setImageUrl(await uploadImage(file)) } catch { setMessage('上传失败') }
  }

  const add = async () => {
    if (!imageUrl) { setMessage('请上传广告图片'); return }
    const { createClient } = await import('@/lib/supabase')
    const supabase = createClient()
    const { error } = await supabase.from('ads').insert({ image_url: imageUrl, link_url: linkUrl, is_active: true })
    if (error) { setMessage('添加失败'); return }
    setImageUrl(''); setLinkUrl(''); setMessage('添加成功！')
    load()
  }

  const toggleActive = async (id: string, current: boolean) => {
    const { createClient } = await import('@/lib/supabase')
    const supabase = createClient()
    await supabase.from('ads').update({ is_active: !current }).eq('id', id)
    load()
  }

  const remove = async (id: string) => {
    const { createClient } = await import('@/lib/supabase')
    const supabase = createClient()
    await supabase.from('ads').delete().eq('id', id)
    load()
  }

  return (
    <div>
      <h1 className="font-cjk text-2xl font-bold text-[var(--ink-deep)] mb-6">广告管理</h1>
      <div className="ink-card p-6 mb-6">
        <h2 className="font-cjk text-lg font-semibold text-[var(--ink-deep)] mb-4">添加广告</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-[var(--ink-mid)] mb-1">广告图片</label>
            <input type="file" accept="image/*" className="hidden" ref={fileRef} onChange={handleImageUpload} />
            <button onClick={() => fileRef.current?.click()} className="btn-secondary text-sm inline-flex items-center gap-1"><Upload size={14} /> 上传图片</button>
            {imageUrl && <img src={imageUrl} alt="广告预览" className="mt-2 h-16 object-contain rounded" />}
          </div>
          <div>
            <label className="block text-sm text-[var(--ink-mid)] mb-1">跳转链接（可选）</label>
            <input type="text" className="ink-input" placeholder="https://..." value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} />
          </div>
          <button onClick={add} className="btn-primary inline-flex items-center gap-2"><Plus size={16} /> 添加广告</button>
          {message && <p className={`text-sm ${message.includes('成功') ? 'text-green-600' : 'text-red-500'}`}>{message}</p>}
        </div>
      </div>
      <div className="space-y-3">
        {ads.map((ad) => (
          <div key={ad.id} className="ink-card p-4 flex items-center gap-4">
            <img src={ad.image_url} alt="广告" className="w-24 h-16 object-contain rounded bg-gray-50" />
            <div className="flex-1 min-w-0">
              {ad.link_url && <a href={ad.link_url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 hover:underline flex items-center gap-1 truncate"><ExternalLink size={12} /> {ad.link_url}</a>}
              <p className="text-xs text-[var(--ink-light)] mt-1">{new Date(ad.created_at).toLocaleString('zh-CN')}</p>
            </div>
            <button onClick={() => toggleActive(ad.id, ad.is_active)} className={`text-xs px-3 py-1 rounded-md ${ad.is_active ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}>{ad.is_active ? '显示中' : '隐藏'}</button>
            <button onClick={() => remove(ad.id)} className="text-red-400 hover:text-red-500"><Trash2 size={16} /></button>
          </div>
        ))}
        {ads.length === 0 && <p className="text-center py-8 text-[var(--ink-light)]">暂无广告</p>}
      </div>
    </div>
  )
}
