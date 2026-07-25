'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  var router = useRouter()
  var [studentId, setStudentId] = useState('')
  var [password, setPassword] = useState('')
  var [error, setError] = useState('')
  var [loading, setLoading] = useState(false)

  async function handleLogin() {
    if (!studentId || !password) { setError('请输入学号和密码'); return }
    setLoading(true); setError('')
    try {
      var m = await import('@/lib/supabase')
      var supabase = m.createClient()
      var r = await supabase.auth.signInWithPassword({ email: studentId + '@xaut.edu.cn', password })
      if (r.error) { setError('学号或密码错误'); setLoading(false); return }
      router.push('/admin')
    } catch(e) { setError('登录失败'); setLoading(false) }
  }

  return (
    <div style={{minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', background: 'linear-gradient(135deg, #0a0806, #1a1410, #2d221c)'}}>
      <div style={{background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', width: '100%', maxWidth: '400px', padding: '32px'}}>
        <div style={{textAlign: 'center', marginBottom: '24px'}}>
          <h1 style={{fontFamily: 'serif', fontSize: '24px', fontWeight: 'bold', color: '#fff', marginBottom: '4px'}}>登录</h1>
          <p style={{color: 'rgba(255,255,255,0.4)', fontSize: '14px'}}>请输入学号和密码</p>
        </div>
        <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
          <div>
            <label style={{display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: '14px', marginBottom: '4px'}}>学号</label>
            <input type='text' value={studentId} onChange={function(e) { setStudentId(e.target.value) }} placeholder='输入学号'
              style={{width: '100%', padding: '10px 16px', borderRadius: '8px', color: '#fff', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', outline: 'none', fontSize: '14px'}}
              onFocus={function(e) { e.target.style.borderColor = 'rgba(255,255,255,0.3)' }}
              onBlur={function(e) { e.target.style.borderColor = 'rgba(255,255,255,0.1)' }} />
          </div>
          <div>
            <label style={{display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: '14px', marginBottom: '4px'}}>密码</label>
            <input type='password' value={password} onChange={function(e) { setPassword(e.target.value) }} placeholder='输入密码'
              onKeyDown={function(e) { if (e.key === 'Enter') handleLogin() }}
              style={{width: '100%', padding: '10px 16px', borderRadius: '8px', color: '#fff', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', outline: 'none', fontSize: '14px'}}
              onFocus={function(e) { e.target.style.borderColor = 'rgba(255,255,255,0.3)' }}
              onBlur={function(e) { e.target.style.borderColor = 'rgba(255,255,255,0.1)' }} />
          </div>
          {error && <p style={{color: '#ef4444', fontSize: '14px', textAlign: 'center'}}>{error}</p>}
          <button onClick={handleLogin} disabled={loading}
            style={{width: '100%', padding: '10px', borderRadius: '8px', fontWeight: '500', cursor: 'pointer', border: 'none',
            background: 'linear-gradient(135deg, rgba(91,140,122,0.4), rgba(74,124,140,0.4))', color: '#fff', fontSize: '14px'}}
            onMouseEnter={function(e) { (e.target as HTMLElement).style.opacity = '0.8' }}
            onMouseLeave={function(e) { (e.target as HTMLElement).style.opacity = '1' }}>
            {loading ? '登录中...' : '登录'}
          </button>
          <p style={{textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '12px'}}>
            还没有账号？<a href='/join' style={{color: '#6ba3a0', textDecoration: 'underline'}}>立即注册</a>
          </p>
        </div>
      </div>
    </div>
  )
}