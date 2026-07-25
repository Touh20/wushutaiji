'use client'

import { useState } from 'react'
import { X } from 'lucide-react'

interface Props {
  onClose: () => void
  onLogin: () => void
}

export default function LoginModal({ onClose, onLogin }: Props) {
  const [studentId, setStudentId] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    if (!studentId || !password) { setError('\u8bf7\u586b\u5199\u5b8c\u6574\u4fe1\u606f'); return }
    setLoading(true); setError('')
    try {
      const { createClient } = await import('@/lib/supabase')
      const supabase = createClient()
      const { error: err } = await supabase.auth.signInWithPassword({
        email: studentId + '@xaut.edu.cn',
        password,
      })
      if (err) { setError('\u5b66\u53f7\u6216\u5bc6\u7801\u9519\u8bef'); setLoading(false); return }
      onLogin()
    } catch { setError('\u767b\u5f55\u5931\u8d25'); setLoading(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl w-full max-w-sm p-6 relative animate-fade-in">
        <button onClick={onClose} className="absolute top-4 right-4 text-[var(--ink-light)] hover:text-[var(--ink-mid)]">
          <X size={20} />
        </button>
        <h2 className="font-cjk text-xl font-bold text-[var(--ink-deep)] mb-6">\u767b\u5f55</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-[var(--ink-mid)] mb-1">\u5b66\u53f7</label>
            <input type="text" className="ink-input" placeholder="\u8f93\u5165\u5b66\u53f7" value={studentId} onChange={(e) => setStudentId(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm text-[var(--ink-mid)] mb-1">\u5bc6\u7801</label>
            <input type="password" className="ink-input" placeholder="\u8f93\u5165\u5bc6\u7801" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleLogin()} />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button onClick={handleLogin} disabled={loading} className="btn-primary w-full">{loading ? '\u767b\u5f55\u4e2d...' : '\u767b\u5f55'}</button>
          <p className="text-xs text-center text-[var(--ink-light)]">
            \u8fd8\u6ca1\u6709\u8d26\u53f7\uff1f<a href="/join" className="text-[var(--accent-gold)] hover:underline">\u7acb\u5373\u6ce8\u518c</a>
          </p>
          <p className="text-xs text-center text-[var(--ink-light)]">
            \u5fd8\u8bb0\u5bc6\u7801\u8bf7\u8054\u7cfb\u7ba1\u7406\u5458\uff1a13109570357
          </p>
        </div>
      </div>
    </div>
  )
}
