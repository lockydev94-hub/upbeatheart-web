'use client'

/**
 * LazyVideo — Intersection-Observer lazy loader for <video> elements
 *
 * Features:
 *  - Renders a shimmer placeholder until the container enters viewport
 *  - Sets <source src> only when in view (prevents network request until needed)
 *  - Smooth fade-in animation when video metadata is ready
 *  - Optional poster image (also lazy-loaded via LazyImage if desired)
 *  - Supports Cloudinary MP4 URLs
 *
 * Usage:
 *   <LazyVideo src={cloudinaryVideoUrl} className="w-full h-full object-cover" muted loop playsInline />
 */

import { useEffect, useRef, useState, VideoHTMLAttributes } from 'react'
import { Play } from 'lucide-react'

interface LazyVideoProps extends Omit<VideoHTMLAttributes<HTMLVideoElement>, 'src'> {
  src: string
  rootMargin?: string
  /** Class applied to the outer wrapper div */
  wrapperClassName?: string
  /** Show a centred play icon on the skeleton before loading */
  showPlayIcon?: boolean
}

export default function LazyVideo({
  src,
  className = '',
  rootMargin = '150px',
  wrapperClassName = '',
  showPlayIcon = true,
  style,
  ...rest
}: LazyVideoProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  const [ready,  setReady]  = useState(false)

  useEffect(() => {
    const el = wrapperRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          obs.disconnect()
        }
      },
      { rootMargin },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [rootMargin])

  return (
    <div ref={wrapperRef} className={`relative overflow-hidden ${wrapperClassName}`} style={style}>
      {/* Skeleton shimmer */}
      {!ready && (
        <div
          aria-hidden
          className="absolute inset-0 bg-[#143B7D]/10 flex items-center justify-center"
          style={{
            backgroundImage:
              'linear-gradient(90deg, rgba(20,59,125,0.08) 25%, rgba(20,59,125,0.16) 50%, rgba(20,59,125,0.08) 75%)',
            backgroundSize: '200% 100%',
            animation: 'lazyShimmer 1.5s ease-in-out infinite',
          }}
        >
          {showPlayIcon && (
            <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
              <Play size={22} className="text-white/50 ml-1" fill="currentColor" />
            </div>
          )}
        </div>
      )}

      {/* Video element — src only injected when inView */}
      {inView && (
        <video
          onCanPlay={() => setReady(true)}
          onLoadedData={() => setReady(true)}
          className={className}
          style={{
            opacity: ready ? 1 : 0,
            transition: 'opacity 0.5s ease',
          }}
          {...rest}
        >
          <source src={src} />
        </video>
      )}
    </div>
  )
}
