'use client'

import { useEffect, useState, useCallback } from 'react'
import { MessageSquare, Plus, AlertTriangle, Flag } from 'lucide-react'
import type { Post, CategoryKey } from '@/types'
import { CATEGORIES } from '@/types'
import PostModal from '@/components/PostModal'
import ReplyModal from '@/components/ReplyModal'
import LoginModal from '@/components/LoginModal'

export default function ForumPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [activeCategory, setActiveCategory] = useState<CategoryKey | 'all'>('all')
  const [showPostModal, setShowPostModal] = useState(false)
  const [replyToPost, setReplyToPost] = useState<string | null>(null)
  const [showLogin, setShowLogin] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const refreshPosts = useCallback(async () => {
    const { createClient } = await import('@/lib/supabase')
    const supabase = createClient()
    setLoading(true)
    let query = supabase
      .from('posts')
      .select('*, user:users(*), replies:replies(*)')
      .order('created_at', { ascending: false })
    if (activeCategory !== 'all') {
      query = query.eq('category', activeCategory)
    }
    const { data } = await query
    if (data) setPosts(data as Post[])
    setLoading(false)
  }, [activeCategory])

  useEffect(() => {
    async function init() {
      const { createClient } = await import('@/lib/supabase')
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      refreshPosts()
    }
    init()
  }, [refreshPosts])

  const CATEGORY_LIST: { key: CategoryKey | 'all'; label: string }[] = [
    { key: 'all', label: '全部' },
    ...Object.entries(CATEGORIES).map(([key, label]) => ({ key: key as CategoryKey, label })),
  ]

  const handleReport = async (postId: string) => {
    if (!user) { setShowLogin(true); return }
    const { createClient } = await import('@/lib/supabase')
    const supabase = createClient()
    await supabase.from('posts').update({ is_reported: true }).eq('id', postId)
    refreshPosts()
  }

  const handleDelete = async (postId: string) => {
    const { createClient } = await import('@/lib/supabase')
    const supabase = createClient()
    await supabase.from('posts').delete().eq('id', postId)
    refreshPosts()
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-cjk text-2xl font-bold text-[var(--ink-deep)]">校园墙</h1>
          <p className="text-sm text-[var(--ink-light)] mt-1">分享校园生活的点点滴滴</p>
        </div>
        <button
          onClick={() => user ? setShowPostModal(true) : setShowLogin(true)}
          className="btn-primary inline-flex items-center gap-2"
        >
          <Plus size={16} /> 发帖
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {CATEGORY_LIST.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key)}
            className={`px-3 py-1.5 text-sm rounded-full transition-all ${
              activeCategory === cat.key
                ? 'bg-[var(--ink-mid)] text-white'
                : 'bg-white text-[var(--ink-mid)] border border-[rgba(74,55,40,0.15)] hover:border-[var(--ink-mid)]'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-[var(--ink-light)]">加载中...</div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12 text-[var(--ink-light)]">
          <MessageSquare size={40} className="mx-auto mb-3 opacity-40" />
          <p>暂无帖子</p>
          <button onClick={() => user ? setShowPostModal(true) : setShowLogin(true)} className="text-[var(--accent-gold)] hover:underline mt-2 text-sm">
            成为第一个发帖的人
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div key={post.id} className="ink-card p-6">
              <div className="flex items-start gap-3">
                <div className="shrink-0">
                  {post.user?.avatar_url ? (
                    post.user.avatar_url.startsWith('http') ? (
                      <img src={post.user.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-[var(--ink-mid)] flex items-center justify-center text-xl">
                        {getFruitEmoji(post.user.avatar_url)}
                      </div>
                    )
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[var(--ink-light)] flex items-center justify-center text-white text-sm">?</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm text-[var(--ink-deep)]">
                      {post.user?.nickname || '未知用户'}
                    </span>
                    <span className="text-xs px-1.5 py-0.5 rounded bg-[rgba(74,55,40,0.08)] text-[var(--ink-light)]">
                      {CATEGORIES[post.category]}
                    </span>
                    {post.is_reported && (
                      <span className="text-xs text-red-500 flex items-center gap-1"><AlertTriangle size={12} /> 已举报</span>
                    )}
                    <span className="text-xs text-[var(--ink-light)] ml-auto">
                      {new Date(post.created_at).toLocaleDateString('zh-CN')}
                    </span>
                  </div>
                  <h3 className="font-semibold text-[var(--ink-deep)] mb-1">{post.title}</h3>
                  <p className="text-sm text-[var(--ink-mid)] whitespace-pre-wrap mb-3">{post.content}</p>

                  {post.images && post.images.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {post.images.map((img, i) => (
                        <img key={i} src={img} alt="" className="w-24 h-24 object-cover rounded-lg" />
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleReport(post.id)}
                      className="text-xs text-[var(--ink-light)] hover:text-red-400 flex items-center gap-1"
                      title="举报"
                    >
                      <Flag size={14} /> 举报
                    </button>
                    <button
                      onClick={() => user ? setReplyToPost(post.id) : setShowLogin(true)}
                      className="text-xs text-[var(--ink-light)] hover:text-[var(--ink-mid)] flex items-center gap-1"
                    >
                      <MessageSquare size={14} /> 回复 ({(post as any).replies?.length || 0})
                    </button>
                    {post.user_id === user?.id && (
                      <button onClick={() => handleDelete(post.id)} className="text-xs text-red-400 hover:text-red-500">
                        删除
                      </button>
                    )}
                  </div>

                  {(post as any).replies && (post as any).replies.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-[rgba(74,55,40,0.08)] space-y-2">
                      {(post as any).replies.slice(0, 3).map((reply: any) => (
                        <div key={reply.id} className="text-sm">
                          <span className="font-medium text-[var(--ink-mid)]">
                            {reply.user?.nickname || '未知用户'}
                          </span>
                          <span className="text-[var(--ink-light)] ml-2">{reply.content}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showPostModal && (
        <PostModal onClose={() => setShowPostModal(false)} onPosted={() => { setShowPostModal(false); window.location.reload() }} />
      )}
      {replyToPost && (
        <ReplyModal postId={replyToPost} onClose={() => setReplyToPost(null)} onReplied={() => { setReplyToPost(null); window.location.reload() }} />
      )}
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} onLogin={() => { setShowLogin(false); window.location.reload() }} />}
    </div>
  )
}

function getFruitEmoji(id: string): string {
  const map: Record<string, string> = {
    apple: '\U0001F34E', orange: '\U0001F34A', lemon: '\U0001F34B', grape: '\U0001F347',
    watermelon: '\U0001F349', strawberry: '\U0001F353', peach: '\U0001F351', cherry: '\U0001F352',
    pear: '\U0001F350', banana: '\U0001F34C', kiwi: '\U0001F95D', blueberry: '\U0001FAD0',
  }
  return map[id] || '\U0001F34E'
}
