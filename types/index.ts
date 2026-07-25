export interface User {
  id: string
  created_at: string
  student_id: string
  name: string
  nickname: string
  avatar_url: string
  role: 'super_admin' | 'admin' | 'member'
  is_banned: boolean
}

export interface Post {
  id: string
  created_at: string
  user_id: string
  category: 'notice' | 'lost_found' | 'trade' | 'study' | 'game' | 'chat'
  title: string
  content: string
  images: string[]
  is_reported: boolean
  user?: User
  replies?: Reply[]
}

export interface Reply {
  id: string
  created_at: string
  post_id: string
  user_id: string
  content: string
  user?: User
}

export interface Announcement {
  id: string
  created_at: string
  title: string
  content: string
  is_pinned: boolean
}

export interface ActivityImage {
  id: string
  created_at: string
  image_url: string
  title: string
  alt_text: string
}

export interface Ad {
  id: string
  created_at: string
  image_url: string
  link_url: string
  is_active: boolean
}

export type CategoryKey = Post['category']

export const CATEGORIES: Record<CategoryKey, string> = {
  notice: '📢 社团公告',
  lost_found: '🔍 失物招领',
  trade: '🛒 闲置交易',
  study: '📚 考研交流',
  game: '🎮 游戏娱乐',
  chat: '💬 吐槽灌水',
}
