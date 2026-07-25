'use client'

import { useState, useEffect } from 'react'

interface BranchPhoto {
  url: string
  title: string
}

interface Props {
  photos: BranchPhoto[]
}

export default function InkTree({ photos }: Props) {
  const [sway, setSway] = useState(0)
  const defaultPhotos = Array(5).fill(null).map(function(_, i) {
    return { url: '', title: '\u7167\u7247 ' + (i + 1) }
  })
  const branches = photos.length >= 5
    ? photos.slice(0, 5)
    : [...photos, ...defaultPhotos.slice(photos.length)]

  useEffect(function() {
    var frame: number
    var time = 0
    function animate() {
      time += 0.015
      setSway(Math.sin(time * 0.6) * 0.6)
      frame = requestAnimationFrame(animate)
    }
    frame = requestAnimationFrame(animate)
    return function() { cancelAnimationFrame(frame) }
  }, [])

  var branchDefs = [
    { side: 'left', angle: -55, length: 38, yOffset: 10 },
    { side: 'left', angle: -45, length: 32, yOffset: 22 },
    { side: 'left', angle: -35, length: 25, yOffset: 34 },
    { side: 'right', angle: 50, length: 30, yOffset: 15 },
    { side: 'right', angle: 40, length: 22, yOffset: 28 },
  ]

  return (
    <div className="w-full h-full relative" style={{ transform: 'rotate(' + (sway * 0.3) + 'deg)' }}>
      <svg viewBox="0 0 1000 600" className="w-full h-full" preserveAspectRatio="xMidYMax meet">
        <defs>
          <linearGradient id="trunkGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#1a1410" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#3d3325" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#1a1410" stopOpacity="0.9" />
          </linearGradient>
          <filter id="inkBlur"><feGaussianBlur stdDeviation="1.5" /></filter>
        </defs>

        <path d="M480 600 Q485 550 490 480 Q492 450 488 420 Q485 390 490 360 Q493 340 495 320" stroke="url(#trunkGrad)" strokeWidth="14" fill="none" strokeLinecap="round" opacity="0.8" filter="url(#inkBlur)" />
        <path d="M482 600 Q487 550 492 480 Q494 450 490 420 Q487 390 492 360 Q495 340 497 320" stroke="#2d221c" strokeWidth="6" fill="none" strokeLinecap="round" opacity="0.5" />
        <path d="M470 600 Q460 580 455 565 Q450 555 445 550" stroke="#1a1410" strokeWidth="8" fill="none" strokeLinecap="round" opacity="0.6" />
        <path d="M510 600 Q520 580 525 570 Q530 560 535 555" stroke="#1a1410" strokeWidth="7" fill="none" strokeLinecap="round" opacity="0.5" />

        {branchDefs.map(function(branch: any, i: number) {
          var angleRad = (branch.angle * Math.PI) / 180
          var totalAngle = angleRad + sway * (branch.side === 'left' ? 1 : -1) * 0.01
          var bl = branch.length * 9
          var sy = branch.yOffset * 8
          var endX = 500 + Math.sin(totalAngle) * bl
          var endY = 320 - sy - Math.cos(totalAngle) * bl * 0.6
          var midX = 500 + Math.sin(totalAngle * 0.7) * bl * 0.6
          var midY = 320 - sy - Math.cos(totalAngle * 0.7) * bl * 0.4
          var photoX = endX
          var photoY = Math.min(endY, 250)
          var photo = branches[i]
          var isLeft = branch.side === 'left'

          return (
            <g key={i}>
              <path d={'M500 ' + (320 - sy) + ' Q' + midX + ' ' + midY + ' ' + endX + ' ' + endY} stroke="#2d221c" strokeWidth={6 - i * 0.6} fill="none" strokeLinecap="round" opacity="0.7" filter="url(#inkBlur)" />
              <path d={'M500 ' + (320 - sy) + ' Q' + midX + ' ' + midY + ' ' + endX + ' ' + endY} stroke="#4a3728" strokeWidth={3 - i * 0.3} fill="none" strokeLinecap="round" opacity="0.4" />

              <g transform={'translate(' + photoX + ', ' + photoY + ') rotate(' + (isLeft ? -8 : 8) + ')'}>
                <rect x="-38" y="-33" width="76" height="66" rx="4" fill="rgba(0,0,0,0.2)" />
                <rect x="-36" y="-31" width="72" height="62" rx="3" fill="white" stroke="#8b7355" strokeWidth="1.5" />
                {photo.url ? (
                  <image href={photo.url} x="-32" y="-27" width="64" height="54" preserveAspectRatio="xMidYMid slice" />
                ) : (
                  <rect x="-32" y="-27" width="64" height="54" rx="2" fill="rgba(74,55,40,0.06)" />
                )}
              </g>
            </g>
          )
        })}

      </svg>
    </div>
  )
}
