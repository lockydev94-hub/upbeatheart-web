'use client'

/**
 * VideoSection — Patient Education
 *
 * Behaviour:
 *  - Cloudinary video: <video> element, autoplay (muted) when section enters
 *    viewport, pauses when it leaves.
 *  - YouTube URL: iframe embed. YouTube's JS API is used to play/pause via
 *    postMessage (enablejsapi=1). Autoplay starts muted when in view; pauses
 *    when out of view.
 *  - No video configured: shows the existing decorative placeholder.
 *
 * Props come from settings/site Firestore doc via getSiteSettings().
 */

import { useEffect, useRef, useState } from 'react'
import { Play } from 'lucide-react'
import LazyVideo from '@/components/ui/LazyVideo'
import type { SiteSettings } from '@/types/firestore'

interface Props {
  settings: Pick<SiteSettings,
    'educationVideoUrl' |
    'educationVideoTitle' |
    'educationVideoDesc'
  >
}

// Extract YouTube video ID from any common YouTube URL format
function extractYtId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([A-Za-z0-9_-]{11})/)
  return m?.[1] ?? null
}

// ─── YouTube player (postMessage autoplay / pause) ────────────────────────────
function YouTubePlayer({ videoId, title }: { videoId: string; title: string }) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const playedRef = useRef(false)

  const sendCommand = (cmd: 'playVideo' | 'pauseVideo' | 'mute') => {
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: 'command', func: cmd, args: [] }),
      '*'
    )
  }

  useEffect(() => {
    const el = iframeRef.current?.closest('section') ?? iframeRef.current
    if (!el) return

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Mute first (required for autoplay policy), then play
          sendCommand('mute')
          sendCommand('playVideo')
          playedRef.current = true
        } else if (playedRef.current) {
          sendCommand('pauseVideo')
        }
      },
      { threshold: 0.4 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <div className="aspect-video">
      <iframe
        ref={iframeRef}
        src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1&rel=0&modestbranding=1&mute=1`}
        title={title}
        className="w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  )
}

// ─── Cloudinary / native video player ────────────────────────────────────────
function CloudinaryPlayer({ src, title }: { src: string; title: string }) {
  return (
    <div className="aspect-video">
      <LazyVideo
        src={src}
        muted
        loop
        playsInline
        controls
        showPlayIcon
        className="w-full h-full object-cover"
        wrapperClassName="w-full h-full"
      />
    </div>
  )
}

// ─── Main section ─────────────────────────────────────────────────────────────
export default function VideoSection({ settings }: Props) {
  const sectionRef = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold: 0.08 },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const {
    educationVideoUrl:   videoUrl   = '',
    educationVideoTitle: videoTitle = '',
    educationVideoDesc:  videoDesc  = '',
  } = settings

  const ytId      = videoUrl ? extractYtId(videoUrl) : null
  const isCloud   = videoUrl?.includes('cloudinary.com')
  const hasVideo  = !!ytId || isCloud

  const displayTitle = videoTitle || 'Understanding Your Heart Health'
  const displayDesc  = videoDesc  || 'Watch expert-led videos on cardiology topics — from understanding heart disease risk factors to post-procedure care. Knowledge is the first step towards a healthier heart.'

  return (
    <section
      ref={sectionRef as React.RefObject<HTMLElement>}
      className="relative py-16 md:py-24 overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #143B7D 0%, #1565D8 60%, #18B55A 100%)' }}
    >
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.04]" aria-hidden>
        <svg width="100%" height="100%">
          <defs>
            <pattern id="videoGrid" width="48" height="48" patternUnits="userSpaceOnUse">
              <path d="M48 0L0 0 0 48" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#videoGrid)" />
        </svg>
      </div>
      <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/5 blur-3xl pointer-events-none" aria-hidden />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-green/10 blur-3xl pointer-events-none" aria-hidden />

      <div className="container-max px-4 md:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

          {/* Left: text */}
          <div
            className="space-y-5 text-white"
            style={{
              opacity:    visible ? 1 : 0,
              transform:  visible ? 'none' : 'translateX(-40px)',
              transition: 'opacity 0.7s cubic-bezier(0.22,1,0.36,1), transform 0.7s cubic-bezier(0.22,1,0.36,1)',
            }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-white text-[11px] font-bold uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-300 animate-pulse" />
              Patient Education
            </div>

            <h2 className="text-3xl md:text-4xl font-extrabold leading-tight tracking-tight">
              {displayTitle}
            </h2>

            <p className="text-white/70 text-base leading-relaxed">
              {displayDesc}
            </p>

            {[
              'ECG interpretation explained simply',
              'When to see a cardiologist',
              'Heart-healthy lifestyle tips',
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-300 shrink-0" />
                <span className="text-[13px] text-white/80 font-medium">{item}</span>
              </div>
            ))}

            {/* Static info cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              {[
                { emoji: '🫀', title: 'Know Your Heart', desc: 'Learn how your heart works and what keeps it healthy.' },
                { emoji: '📋', title: 'Understand Tests', desc: 'Decode ECG, Echo & stress test reports with ease.' },
                { emoji: '💊', title: 'Medication Guide', desc: 'Stay informed about common cardiac medications.' },
              ].map(({ emoji, title, desc }) => (
                <div
                  key={title}
                  className="flex flex-col gap-1.5 rounded-2xl bg-white/8 border border-white/12 px-4 py-3.5 hover:bg-white/14 transition-colors"
                >
                  <span className="text-xl leading-none">{emoji}</span>
                  <p className="text-[13px] font-bold text-white leading-tight">{title}</p>
                  <p className="text-[11px] text-white/60 leading-snug">{desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: video player */}
          <div
            className="relative"
            style={{
              opacity:    visible ? 1 : 0,
              transform:  visible ? 'none' : 'translateX(40px) scale(0.96)',
              transition: 'opacity 0.7s cubic-bezier(0.22,1,0.36,1) 0.15s, transform 0.7s cubic-bezier(0.22,1,0.36,1) 0.15s',
            }}
          >
            <div className="relative rounded-3xl overflow-hidden shadow-[0_16px_64px_rgba(0,0,0,0.35)] border border-white/10">
              {hasVideo ? (
                ytId ? (
                  <YouTubePlayer videoId={ytId} title={displayTitle} />
                ) : (
                  <CloudinaryPlayer src={videoUrl} title={displayTitle} />
                )
              ) : (
                /* Placeholder when no video configured */
                <div
                  className="aspect-video flex flex-col items-center justify-center gap-4"
                  style={{ background: 'rgba(255,255,255,0.06)' }}
                >
                  <div className="w-16 h-16 rounded-full bg-white/15 border border-white/25 flex items-center justify-center">
                    <Play size={26} className="text-white ml-1" fill="white" />
                  </div>
                  <p className="text-white/50 text-[13px] font-medium">Video coming soon</p>
                </div>
              )}
            </div>

            {/* Floating label */}
            <div className="absolute -bottom-4 left-6 bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.15)] px-4 py-2.5 flex items-center gap-2.5">
              <div className="w-2 h-2 rounded-full bg-green animate-pulse" />
              <span className="text-[12px] font-bold text-navy">Doctor-Curated Content</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
