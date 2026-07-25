'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { UserPlus, ArrowLeft } from 'lucide-react'

const FRUIT_AVATARS = [
  { id: 'apple', emoji: '🍎', label: '苹果' },
  { id: 'orange', emoji: '🍊', label: '橙子' },
  { id: 'lemon', emoji: '🍋', label: '柠檬' },
  { id: 'grape', emoji: '🍇', label: '葡萄' },
  { id: 'watermelon', emoji: '🍉', label: '西瓜' },
  { id: 'strawberry', emoji: '🍓', label: '草莓' },
  { id: 'peach', emoji: '🍑', label: '桃子' },
  { id: 'cherry', emoji: '🍒', label: '樱桃' },
  { id: 'pear', emoji: '🍐', label: '梨' },
  { id: 'banana', emoji: '🍌', label: '香蕉' },
  { id: 'kiwi', emoji: '🥝', label: '猕猴桃' },
  { id: 'blueberry', emoji: '🫐', label: '蓝莓' },
]

export default function JoinPage() {
  const router = useRouter()
  const [step, setStep] = useState<'form' | 'avatar'>('form')
  const [form, setForm] = useState({ name: '', student_id: '', nickname: '', password: '', confirm_password: '' })
  const [selectedAvatar, setSelectedAvatar] = useState('apple')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const validateForm = () => {
    if (!form.name.trim()) return '请输入姓名'
    if (!form.student_id.trim()) return '请输入学号'
    if (!/^\d+$/.test(form.student_id)) return '学号必须为数字'
    if (form.student_id.length !== 10) return '学号长度必须为10位'
    if (!form.nickname.trim()) return '请输入昵称'
    if (form.nickname.length > 20) return '昵称不能超过20个字符'
    if (!form.password) return '请输入密码'
    if (form.password.length < 4) return '密码至少4位'
    if (form.password !== form.confirm_password) return '两次密码不一致'
    return ''
  }

  const handleSubmit = async () => {
    const err = validateForm()
    if (err) { setError(err); return }
    setError('')
    setLoading(true)

    try {
      const { createClient } = await import('@/lib/supabase')
      const supabase = createClient()

      const { error: signUpError } = await supabase.auth.signUp({
        email: `${form.student_id}@xaut.edu.cn`,
        password: form.password,
        options: {
          data: {
            name: form.name,
            student_id: form.student_id,
            nickname: form.nickname,
            avatar: selectedAvatar,
            role: 'member',
          },
        },
      })

      if (signUpError) {
        setError(signUpError.message === 'User already registered' ? '该学号已注册' : signUpError.message)
        setLoading(false)
        return
      }

      setSuccess(true)
      setLoading(false)
    } catch {
      setError('注册失败，请稍后重试')
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-5xl mb-4">🎉</div>
          <h1 className="font-cjk text-2xl font-bold text-[var(--ink-deep)] mb-3">注册成功！</h1>
          <p className="text-[var(--ink-light)] mb-6">欢迎加入西安理工大学武术太极社！</p>
          <p className="text-sm text-[var(--ink-light)] mb-8">请查看邮箱完成验证，然后就可以在校园墙发帖了。</p>
          <Link href="/forum" className="btn-primary inline-flex items-center gap-2">
            去校园墙看看 <ArrowLeft size={16} className="rotate-180" />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <UserPlus size={32} className="mx-auto mb-3 text-[var(--accent-gold)]" />
          <h1 className="font-cjk text-2xl font-bold text-[var(--ink-deep)]">加入武术太极社</h1>
          <p className="text-sm text-[var(--ink-light)] mt-1">完成注册后即可在校园墙发帖交流</p>
        </div>

        <div className="ink-card p-6">
          {step === 'form' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[var(--ink-mid)] mb-1">真实姓名</label>
                <input
                  type="text"
                  className="ink-input"
                  placeholder="请输入姓名"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm text-[var(--ink-mid)] mb-1">学号</label>
                <input
                  type="text"
                  className="ink-input"
                  placeholder="3252211019"
                  value={form.student_id}
                  onChange={(e) => setForm({ ...form, student_id: e.target.value })}
                />
                <p className="text-xs text-[var(--ink-light)] mt-1">10位数字学号</p>
              </div>
              <div>
                <label className="block text-sm text-[var(--ink-mid)] mb-1">昵称（校园墙显示用）</label>
                <input
                  type="text"
                  className="ink-input"
                  placeholder="取个名字吧"
                  maxLength={20}
                  value={form.nickname}
                  onChange={(e) => setForm({ ...form, nickname: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm text-[var(--ink-mid)] mb-1">密码</label>
                <input
                  type="password"
                  className="ink-input"
                  placeholder="至少4位"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm text-[var(--ink-mid)] mb-1">确认密码</label>
                <input
                  type="password"
                  className="ink-input"
                  placeholder="再次输入密码"
                  value={form.confirm_password}
                  onChange={(e) => setForm({ ...form, confirm_password: e.target.value })}
                />
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <button
                onClick={() => setStep('avatar')}
                className="btn-primary w-full"
              >
                下一步：选择头像
              </button>
            </div>
          ) : (
            <div>
              <h2 className="font-cjk text-lg font-semibold text-[var(--ink-deep)] mb-4 text-center">
                选择你的头像
              </h2>
              <p className="text-sm text-[var(--ink-light)] text-center mb-4">
                也可以之后在设置中上传自己的图片
              </p>

              <div className="grid grid-cols-4 gap-3 mb-6">
                {FRUIT_AVATARS.map((fruit) => (
                  <button
                    key={fruit.id}
                    onClick={() => setSelectedAvatar(fruit.id)}
                    className={`aspect-square rounded-xl flex flex-col items-center justify-center gap-1 transition-all ${
                      selectedAvatar === fruit.id
                        ? 'bg-[var(--ink-mid)] text-white ring-2 ring-[var(--accent-gold)] ring-offset-2'
                        : 'bg-[rgba(74,55,40,0.06)] hover:bg-[rgba(74,55,40,0.12)] text-[var(--ink-mid)]'
                    }`}
                  >
                    <span className="text-2xl">{fruit.emoji}</span>
                    <span className="text-xs">{fruit.label}</span>
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep('form')} className="btn-secondary flex-1">返回</button>
                <button onClick={handleSubmit} disabled={loading} className="btn-primary flex-1">
                  {loading ? '注册中...' : '完成注册'}
                </button>
              </div>

              {error && <p className="text-sm text-red-500 mt-3 text-center">{error}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
