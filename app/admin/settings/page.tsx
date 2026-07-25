'use client'

import { useEffect, useState, useRef } from 'react'
import { Save, Upload, Trash2 } from 'lucide-react'

const SLOTS = [
  { key: 'slot_1', label: '插槽 1 — 首页大图', desc: '首页 Hero 区域背景图（轮播展示）；最多5张' },
  { key: 'slot_2', label: '插槽 2 — 社团介绍配图', desc: '关于我们区域的配图轮播；最多5张' },
  { key: 'slot_3', label: '插槽 3 — 荣誉墙上方', desc: '荣誉展示区域上方装饰图轮播；最多5张' },
  { key: 'slot_4', label: '插槽 4 — 底部装饰图', desc: '页面底部装饰图片轮播；最多5张' },
]

const MAX_IMAGES = 5

export default function AdminSettings() {
  const [logo, setLogo] = useState('')
  const [slots, setSlots] = useState<Record<string, string[]>>({})
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [uploadingSlot, setUploadingSlot] = useState<string | null>(null)
  const logoRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    async function load() {
      const { createClient } = await import('@/lib/supabase')
      const supabase = createClient()
      const { data } = await supabase.from('site_settings').select('*').single()
      if (data) {
        setLogo(data.logo_url || '')
        const slotData: Record<string, string[]> = {}
        SLOTS.forEach(s => {
          const val = (data as any)[s.key]
          slotData[s.key] = Array.isArray(val) ? val.filter(Boolean) : (val ? [val] : [])
        })
        setSlots(slotData)
      }
      setLoading(false)
    }
    load()
  }, [])

  const uploadFile = async (file: File, prefix: string): Promise<string> => {
    const { createClient } = await import('@/lib/supabase')
    const supabase = createClient()
    const fileName = `${prefix}-${Date.now()}.${file.name.split('.').pop()}`;
    const { error } = await supabase.storage.from('site-assets').upload(fileName, file)
    if (error) throw error
    const { data: { publicUrl } } = supabase.storage.from('site-assets').getPublicUrl(fileName)
    return publicUrl
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const url = await uploadFile(file, 'logo')
      setLogo(url)
      setMessage('Logo 上传成功，记得保存')
    } catch { setMessage('上传失败') }
  }

  const handleSlotImageUpload = async (slotKey: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const currentImages = slots[slotKey] || []
    if (currentImages.length >= MAX_IMAGES) {
      setMessage(`每个插槽最多 ${MAX_IMAGES} 张图片`);
      return
    }
    setUploadingSlot(slotKey)
    try {
      const url = await uploadFile(file, slotKey)
      setSlots(prev => ({ ...prev, [slotKey]: [...(prev[slotKey] || []), url] }))
      setMessage('图片上传成功，记得保存')
    } catch { setMessage('上传失败') }
    setUploadingSlot(null)
  }

  const removeSlotImage = (slotKey: string, index: number) => {
    setSlots(prev => ({
      ...prev,
      [slotKey]: (prev[slotKey] || []).filter((_, i) => i !== index)
    }))
  }

  const save = async () => {
    setMessage('')
    const { createClient } = await import('@/lib/supabase')
    const supabase = createClient()
    const payload: Record<string, any> = { logo_url: logo }
    SLOTS.forEach(s => { payload[s.key] = slots[s.key] || [] })

    const { data: existing } = await supabase.from('site_settings').select('id').single()
    const { error } = existing
      ? await supabase.from('site_settings').update(payload).eq('id', existing.id)
      : await supabase.from('site_settings').insert(payload)

    if (error) { setMessage('保存失败: ' + error.message); return }
    setMessage('保存成功！')
    setTimeout(() => setMessage(''), 3000)
  }

  if (loading) return <div className="text-center py-12 text-[var(--ink-light)]">加载中...</div>

  return (
    <div>
      <h1 className="font-cjk text-2xl font-bold text-[var(--ink-deep)] mb-6">网站设置</h1>
      <p className="text-sm text-[var(--ink-light)] mb-6">管理社团 Logo 和各位置的图片轮播</p>

      <div className="space-y-6">

        {/* Logo */}
        <div className="ink-card p-6">
          <h2 className="font-cjk text-lg font-semibold text-[var(--ink-deep)] mb-4">社团标志（Logo）</h2>
          <p className="text-sm text-[var(--ink-light)] mb-4">显示在网站顶部导航栏，建议使用圆形图片</p>
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-[rgba(74,55,40,0.06)] flex items-center justify-center shrink-0 border-2 border-dashed border-[rgba(74,55,40,0.15)]">
              {logo ? (
                <img src={logo} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl text-[var(--ink-light)]">武</span>
              )}
            </div>
            <div>
              <input type="file" accept="image/*" className="hidden" ref={logoRef} onChange={handleLogoUpload} />
              <button onClick={() => logoRef.current?.click()} className="btn-secondary text-sm inline-flex items-center gap-1">
                <Upload size={14} /> 上传 Logo
              </button>
              {logo && (
                <button onClick={() => setLogo('')} className="text-xs text-red-400 ml-2 hover:text-red-500">移除</button>
              )}
            </div>
          </div>
        </div>

        {/* Image Slots */}
        {SLOTS.map((slot) => {
          const images = slots[slot.key] || []
          return (
            <div key={slot.key} className="ink-card p-6">
              <h2 className="font-cjk text-lg font-semibold text-[var(--ink-deep)] mb-1">{slot.label}</h2>
              <p className="text-sm text-[var(--ink-light)] mb-4">{slot.desc}</p>

              {/* Image list */}
              <div className="flex flex-wrap gap-3 mb-4">
                {images.map((url, i) => (
                  <div key={i} className="relative group/image">
                    <div className="w-28 h-20 rounded-lg overflow-hidden bg-[rgba(74,55,40,0.06)] border border-[rgba(74,55,40,0.12)]">
                      <img src={url} alt={`${slot.label} 图 ${i+1}`} className="w-full h-full object-cover" />
                    </div>
                    <button
                      onClick={() => removeSlotImage(slot.key, i)}
                      className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover/image:opacity-100 transition-opacity"
                    >
                      <Trash2 size={10} />
                    </button>
                    <span className="block text-xs text-center text-[var(--ink-light)] mt-1">图 {i+1}</span>
                  </div>
                ))}

                {/* Add button */}
                {images.length < MAX_IMAGES && (
                  <label className="w-28 h-20 rounded-lg border-2 border-dashed border-[rgba(74,55,40,0.15)] flex flex-col items-center justify-center cursor-pointer hover:border-[var(--ink-mid)] hover:bg-[rgba(74,55,40,0.04)] transition-all">
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleSlotImageUpload(slot.key, e)} />
                    <Upload size={16} className="text-[var(--ink-light)]" />
                    <span className="text-xs text-[var(--ink-light)] mt-1">添加图片</span>
                  </label>
                )}
              </div>

              <div className="text-xs text-[var(--ink-light)]">
                {images.length} / {MAX_IMAGES} 张
              </div>
            </div>
          )
        })}

        {/* Save */}
        <div className="flex items-center gap-3">
          <button onClick={save} className="btn-primary inline-flex items-center gap-2">
            <Save size={16} /> 保存全部设置
          </button>
          {message && <span className={`text-sm`}>{message}</span>}
        </div>
      </div>
    </div>
  )
}