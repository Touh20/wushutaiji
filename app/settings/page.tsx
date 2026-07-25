'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save, AlertCircle, CheckCircle } from 'lucide-react'

const FRUIT_AVATARS = [
  { id: 'apple', emoji: '\u{1F34E}', label: '\u82f9\u679c' },
  { id: 'orange', emoji: '\u{1F34A}', label: '\u6a59\u5b50' },
  { id: 'lemon', emoji: '\u{1F34B}', label: '\u6e20\u6aac' },
  { id: 'grape', emoji: '\u{1F347}', label: '\u8461\u8404' },
  { id: 'watermelon', emoji: '\u{1F349}', label: '\u897f\u74dc' },
  { id: 'strawberry', emoji: '\u{1F353}', label: '\u8349\u8393' },
  { id: 'peach', emoji: '\u{1F351}', label: '\u6843\u5b50' },
  { id: 'cherry', emoji: '\u{1F352}', label: '\u6a31\u6843' },
  { id: 'pear', emoji: '\u{1F350}', label: '\u68a8' },
  { id: 'banana', emoji: '\u{1F34C}', label: '\u9999\u8549' },
  { id: 'kiwi', emoji: '\u{1F95D}', label: '\u7315\u7334\u68bf' },
  { id: 'blueberry', emoji: '\u{1FAD0}', label: '\u84dd\u8393' },
]

export default function SettingsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [nickname, setNickname] = useState('')
  const [avatar, setAvatar] = useState('apple')
  const [customAvatar, setCustomAvatar] = useState('')
  const [message, setMessage] = useState('')
  const [msgType, setMsgType] = useState<'success' | 'error'>('success')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [changesLeft, setChangesLeft] = useState(5)

  useEffect(() => {
    async function load() {
      const { createClient } = await import('@/lib/supabase')
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/'); return }

      setUser(session.user)

      const { data: profileData } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (profileData) {
        setProfile(profileData)
        setNickname(profileData.nickname || '')
        setAvatar(profileData.avatar_url || 'apple')

        // Calculate changes left this month
        const currentMonth = new Date().toISOString().slice(0, 7)
        if (profileData.profile_change_month === currentMonth) {
          setChangesLeft(Math.max(0, 5 - (profileData.profile_change_count || 0)))
        } else {
          setChangesLeft(5)
        }
      }
      setLoading(false)
    }
    load()
  }, [router])

  const handleSave = async () => {
    if (!nickname.trim()) { setMessage('\u6635\u79f0\u4e0d\u80fd\u4e3a\u7a7a'); setMsgType('error'); return }
    if (nickname.length > 20) { setMessage('\u6635\u79f0\u4e0d\u80fd\u8d85\u8fc720\u4e2a\u5b57\u7b26'); setMsgType('error'); return }

    if (changesLeft <= 0) {
      setMessage('\u672c\u6708\u4fee\u6539\u6b21\u6570\u5df2\u7528\u5c3d\uff085\u6b21/\u6708\uff09\uff0c\u8bf7\u4e0b\u6708\u518d\u6765'); setMsgType('error'); return
    }

    setSaving(true); setMessage('')

    try {
      const { createClient } = await import('@/lib/supabase')
      const supabase = createClient()
      const currentMonth = new Date().toISOString().slice(0, 7)

      const finalAvatar = customAvatar || avatar

      const { error } = await supabase.from('users').update({
        nickname: nickname.trim(),
        avatar_url: finalAvatar,
        profile_change_month: currentMonth,
        profile_change_count: (profile?.profile_change_month === currentMonth
          ? (profile?.profile_change_count || 0) + 1
          : 1),
      }).eq('id', user.id)

      if (error) { setMessage('\u4fdd\u5b58\u5931\u8d25: ' + error.message); setMsgType('error'); setSaving(false); return }

      setChangesLeft(changesLeft - 1)
      setProfile({ ...profile, nickname: nickname.trim(), avatar_url: finalAvatar, profile_change_month: currentMonth })
      setMessage('\u4fdd\u5b58\u6210\u529f\uff01\u672c\u6708\u8fd8\u5269 ' + (changesLeft - 1) + ' \u6b21\u4fee\u6539\u673a\u4f1a')
      setMsgType('success')
    } catch { setMessage('\u4fdd\u5b58\u5931\u8d25'); setMsgType('error') }
    setSaving(false)
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-[var(--ink-light)]">{'\u52a0\u8f7d\u4e2d...'}</div>

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-lg mx-auto">
        <h1 className="font-cjk text-2xl font-bold text-[var(--ink-deep)] mb-6 text-center">{'\u4e2a\u4eba\u8bbe\u7f6e'}</h1>

        <div className="ink-card p-6 space-y-6">
          {/* Current avatar preview */}
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-[var(--ink-mid)] flex items-center justify-center text-4xl mx-auto mb-2">
              {customAvatar ? (
                <img src={customAvatar} alt="" className="w-full h-full rounded-full object-cover" />
              ) : (
                <span>{FRUIT_AVATARS.find(a => a.id === avatar)?.emoji || '\u{1F34E}'}</span>
              )}
            </div>
            <p className="text-sm text-[var(--ink-light)]">{'\u5f53\u524d\u5934\u50cf'}</p>
          </div>

          {/* Nickname */}
          <div>
            <label className="block text-sm text-[var(--ink-mid)] mb-1">{'\u6635\u79f0'}</label>
            <input type="text" className="ink-input" maxLength={20}
              value={nickname} onChange={(e) => setNickname(e.target.value)}
              placeholder={'\u8f93\u5165\u6635\u79f0'} />
            <p className="text-xs text-[var(--ink-light)] mt-1">{'\u6700\u591a20\u4e2a\u5b57\u7b26'}</p>
          </div>

          {/* Fruit avatars */}
          <div>
            <label className="block text-sm text-[var(--ink-mid)] mb-2">{'\u9009\u62e9\u6c34\u679c\u5934\u50cf'}</label>
            <div className="grid grid-cols-6 gap-2">
              {FRUIT_AVATARS.map((f) => (
                <button key={f.id}
                  onClick={() => { setAvatar(f.id); setCustomAvatar('') }}
                  className={`aspect-square rounded-lg flex items-center justify-center text-xl transition-all ${
                    avatar === f.id && !customAvatar
                      ? 'bg-[var(--ink-mid)] text-white ring-2 ring-[var(--accent-gold)] ring-offset-2'
                      : 'bg-[rgba(74,55,40,0.06)] hover:bg-[rgba(74,55,40,0.12)]'
                  }`}
                  title={f.label}
                >
                  {f.emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Custom avatar upload */}
          <div>
            <label className="block text-sm text-[var(--ink-mid)] mb-2">{'\u6216\u4e0a\u4f20\u81ea\u5df1\u7684\u5934\u50cf'}</label>
            <input type="file" accept="image/*" className="ink-input text-sm py-2"
              onChange={async (e) => {
                const file = e.target.files?.[0]
                if (!file) return
                const { createClient } = await import('@/lib/supabase')
                const supabase = createClient()
                const fileName = `avatar-${user.id}-${Date.now()}.${file.name.split('.').pop()}`
                const { error } = await supabase.storage.from('avatars').upload(fileName, file)
                if (error) { setMessage('\u4e0a\u4f20\u5931\u8d25'); setMsgType('error'); return }
                const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName)
                setCustomAvatar(publicUrl)
                setAvatar('')
                setMessage('\u5934\u50cf\u4e0a\u4f20\u6210\u529f\uff0c\u8bb0\u5f97\u4fdd\u5b58')
                setMsgType('success')
              }} />
          </div>

          {/* Changes left */}
          <div className="text-center text-sm">
            <span className="text-[var(--ink-light)]">{'\u672c\u6708\u5269\u4f59\u4fee\u6539\u6b21\u6570\uff1a'}</span>
            <span className={`font-bold ${changesLeft > 0 ? 'text-[var(--accent-jade)]' : 'text-red-500'}`}>
              {changesLeft} / 5
            </span>
          </div>

          {message && (
            <div className={`flex items-center gap-2 text-sm p-3 rounded-lg ${
              msgType === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
            }`}>
              {msgType === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
              {message}
            </div>
          )}

          <button onClick={handleSave} disabled={saving} className="btn-primary w-full flex items-center justify-center gap-2">
            <Save size={16} /> {saving ? '\u4fdd\u5b58\u4e2d...' : '\u4fdd\u5b58\u8bbe\u7f6e'}
          </button>
        </div>
      </div>
    </div>
  )
}
