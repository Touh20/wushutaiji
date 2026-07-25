'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { Phone, ArrowRight, ChevronDown } from 'lucide-react'
import type { ActivityImage, Ad } from '@/types'
import InkTree from '@/components/InkTree'

function Particle(p: any) { return <div className='ink-particle' style={p.style} />; }

export default function HomePage() {
  var [images, setImages] = useState<any[]>([]);
  var [ads, setAds] = useState<any[]>([]);
  var [mounted, setMounted] = useState(false);

  useEffect(function() {
    setMounted(true);
    async function load() {
      try {
        var m = await import('@/lib/supabase');
        var sb = m.createClient();
        var [ir, ar] = await Promise.all([
          sb.from('activity_images').select('*').order('created_at', { ascending: false }).limit(5),
          sb.from('ads').select('*').eq('is_active', true).limit(1).single(),
        ]);
        if (ir.data) setImages(ir.data);
        if (ar.data && !ar.error) setAds([ar.data]);
      } catch(e) {}
    }
    load();
  }, []);

  var ps = useMemo(function() {
    var d = [[5,8,3,0],[15,20,5,1],[25,35,4,2],[35,50,6,3],[55,12,2,0.5],[65,30,7,1.5],[75,45,4,2.5],[85,60,5,3.5]];
    return d.map(function(r) { return {left: r[0]+'%', top: r[1]+'%', width: r[2]+'px', height: r[2]+'px', animationDelay: r[3]+'s', animationDuration: '8s'}; });
  }, []);

  var tp = images.slice(0,5).map(function(img) { return {url: img.image_url, title: img.title || ''}; });
  while (tp.length < 5) tp.push({url: '', title: ''});

  return (
    <div className='relative min-h-screen overflow-x-hidden'>
      {mounted && ps.map(function(s,i) { return <Particle key={i} style={s} />; })}
      {ads.length > 0 && ads[0] && <div className='relative z-20 px-4 pt-4 text-center'><a href={ads[0].link_url} target='_blank' rel='noopener noreferrer'><img src={ads[0].image_url} alt='' className='h-10 md:h-12 object-contain mx-auto opacity-60 hover:opacity-80 transition-opacity' /></a></div>}
      <div className='relative z-10 flex flex-col items-center justify-start min-h-screen px-4 pt-12 md:pt-20'>

        <div className='text-center mb-6 md:mb-8 mt-4 md:mt-8 animate-fade-in'>
          <h1 className='ink-title text-5xl md:text-7xl lg:text-8xl xl:text-9xl font-bold tracking-wider leading-[1.1] select-none'>武术太极社</h1>
          <div className='mt-4 md:mt-6 flex items-center justify-center gap-4 md:gap-8 flex-wrap'>
            <Link href='/join' className='btn-jade text-sm md:text-base inline-flex items-center gap-2 group'>加入我们 <ArrowRight size={16} className='group-hover:translate-x-1 transition-transform' /></Link>
            <a href='tel:13109570357' className='ink-glow-text text-sm md:text-base flex items-center gap-2 hover:text-white/90 transition-colors'><Phone size={16} /> 13109570357</a>
            <Link href='/forum' className='ink-glow-text text-sm md:text-base hover:text-white/90 transition-colors'>校园墙</Link>
          </div>
        </div>

        <div className='w-32 md:w-48 ink-divider mb-8 md:mb-12' />
        <div className='w-full max-w-5xl mx-auto relative flex-1'>
          <div className='w-full' style={{height: 'min(55vh, 500px)'}}><InkTree photos={tp} /></div>
          <div className='text-center mt-6 pb-8'><div className='ink-glow-text text-xs md:text-sm opacity-50'>西安理工大学 · 武术太极社 · 2024</div></div>
        </div>

      </div>
      <div className='fixed bottom-6 left-1/2 -translate-x-1/2 animate-bounce z-20'><ChevronDown size={20} className='text-white/20' /></div>
    </div>
  );
}