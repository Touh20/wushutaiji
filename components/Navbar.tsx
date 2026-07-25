'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'

var NAV = [{l:'首页',h:'/'},{l:'公告',h:'/#announcements'},{l:'风采',h:'/#gallery'},{l:'加入我们',h:'/join'}];

export default function Navbar() {
  var [open, setOpen] = useState(false);
  var [logo, setLogo] = useState('');
  var [user, setUser] = useState<any>(null);

  useEffect(function() {
    async function load() {
      try {
        var m = await import('@/lib/supabase');
        var sb = m.createClient();
        var s = await sb.auth.getSession();
        if (s.data?.session?.user) setUser(s.data.session.user);
        var r = await sb.from('site_settings').select('logo_url').single();
        if (r.data?.logo_url) setLogo(r.data.logo_url);
      } catch(e) {}
    }
    load();
  }, []);

  return (
    <nav className='sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b'>
      <div className='max-w-6xl mx-auto px-4 h-16 flex items-center justify-between'>
        <Link href='/' className='flex items-center gap-3 group'>
          {logo ? <img src={logo} alt='' className='w-9 h-9 rounded-full object-cover' /> : <div className='w-9 h-9 rounded-full bg-gradient-to-br from-[var(--ink-mid)] to-[var(--ink-deep)] flex items-center justify-center text-white text-sm font-bold shrink-0'>武</div>}
          <span className='font-semibold text-lg text-[var(--ink-deep)] hidden sm:block'>武术太极社</span>
        </Link>
        <div className='hidden md:flex items-center gap-1'>
          {NAV.map(function(n) { return <Link key={n.h} href={n.h} className='px-4 py-2 text-sm text-[var(--ink-mid)] hover:text-[var(--ink-deep)] hover:bg-[rgba(74,55,40,0.06)] rounded-md'>{n.l}</Link>; })}
        </div>
        <div className='flex items-center gap-2'>
          {!user && <Link href='/login' className='px-3 py-1.5 text-sm text-[var(--ink-mid)] hover:bg-[rgba(74,55,40,0.06)] rounded-md'>登录</Link>}
          {user && <><Link href='/admin' className='px-3 py-1.5 text-xs font-medium text-white rounded-md' style={{background:'linear-gradient(135deg,#5b8c7a,#4a7c8c)'}}>管理后台</Link>
          <Link href='/login' className='px-3 py-1.5 text-sm text-red-400 hover:bg-red-50 rounded-md' onClick={function(){try{document.cookie.split(';').forEach(function(c){document.cookie=c.replace(/^ +/,'').replace(/=.*/,'=;expires=Thu, 01 Jan 1970;path=/')})}catch(e){}}}>退出</Link></>}
          <button onClick={function(){setOpen(!open)}} className='md:hidden p-2 text-[var(--ink-mid)]'>{open ? <X size={22} /> : <Menu size={22} />}</button>
        </div>
      </div>
      {open && <div className='md:hidden border-t bg-white px-4 py-3 space-y-1'>
        {NAV.map(function(n) { return <Link key={n.h} href={n.h} onClick={function(){setOpen(false)}} className='block px-4 py-2.5 text-sm text-[var(--ink-mid)] hover:bg-[rgba(74,55,40,0.06)] rounded-md'>{n.l}</Link>; })}
        {user && <Link href='/admin' onClick={function(){setOpen(false)}} className='block px-4 py-2.5 text-sm text-white rounded-md' style={{background:'linear-gradient(135deg,#5b8c7a,#4a7c8c)'}}>管理后台</Link>}
      </div>}
    </nav>
  );
}