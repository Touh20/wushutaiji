'use client'

import { useState, useEffect } from 'react'

interface Props {
  images: string[]
  className?: string
  aspectRatio?: string
  overlay?: boolean
  objectFit?: 'cover' | 'contain'
}

export default function SlotCarousel({ images, className = '', aspectRatio = '', overlay = false, objectFit = 'cover' }: Props) {
  const [current, setCurrent] = useState(0)
  const validImages = images.filter(Boolean)

  useEffect(() => {
    if (validImages.length <= 1) return
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % validImages.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [validImages.length])

  if (validImages.length === 0) return null
  if (validImages.length === 1) {
    return (
      <div className={`overflow-hidden ${className}`} style={aspectRatio ? { aspectRatio } : {}}>
        <img src={validImages[0]} alt="" className={`w-full h-full object-${objectFit}`} />
      </div>
    )
  }

  return (
    <div className={`relative overflow-hidden group ${className}`} style={aspectRatio ? { aspectRatio } : {}}>
      {/* Images */}
      <div className="relative w-full h-full">
        {validImages.map((url, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              i === current ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img src={url} alt="" className={`w-full h-full object-${objectFit}`} />
            {overlay && (
              <div className="absolute inset-0 bg-gradient-to-b from-[#1a1410]/80 via-[#2d221c]/60 to-[var(--ink-deep)]" />
            )}
          </div>
        ))}
      </div>

      {/* Dot indicators */}
      {validImages.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          {validImages.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-2 h-2 rounded-full transition-all ${
                i === current ? 'bg-white w-4' : 'bg-white/40 hover:bg-white/60'
              }`}
            />
          ))}
        </div>
      )}

      {/* Arrow controls (show on hover) */}
      {validImages.length > 1 && (
        <>
          <button
            onClick={() => setCurrent((prev) => (prev - 1 + validImages.length) % validImages.length)}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/30"
          >
            ‹
          </button>
          <button
            onClick={() => setCurrent((prev) => (prev + 1) % validImages.length)}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/30"
          >
            ›
          </button>
        </>
      )}
    </div>
  )
}
