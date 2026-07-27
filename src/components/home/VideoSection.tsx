'use client'

/**
 * VideoSection — Patient Education
 *
 * Behaviour:
 *  - Cloudinary video: <video> element.
 *      * Scrolled IN  (>=40% visible) -> unmute + play with audio
 *      * Scrolled OUT               -> pause + mute
 *  - YouTube URL: iframe with YouTube IFrame API (enablejsapi=1).
 *      * Scrolled IN  (>=40% visible) -> unMute() + playVideo()
 *      * Scrolled OUT               -> pauseVideo() + mute()
 *  - Browsers block autoplay-with-sound unless the user has previously
 *    interacted with the page. Handled gracefully:
 *      1. On scroll-in, attempt unmuted play.
 *      2. If blocked (NotAllowedError), fall back to muted play and show
 *         a one-tap "Tap to enable sound" overlay.
 */

import { useEffect, useRef, useState, useCallback } from 'react'
import { Play, Volume2, VolumeX } from 'lucide-react'
import type { SiteSettings } from '@/types/firestore'

interface Props {
  settings: Pick<SiteSettings,
    'educationVideoUrl' |
    'educationVideoTitle' |
    'educationVideoDesc'
  >
}

function extractYtId(url: string): string | null {
  const m = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([A-Za-z0-9_-]{11})/
  )
  return m?.[1] ?? null
}

// ---- Sound-blocked overlay --------------------------------------------------
function SoundBlockedOverlay({ onUnlock }: { onUnlock: () => void }) {
  return (
    <button
      onClick={onUnlock}
      className="absolute bottom-3 right-3 z-20 flex items-center gap-2 px-3 py-2 rounded-xl bg-black/70 backdrop-blur-sm text-white text-xs font-semibold hover:bg-black/85 transition-all animate-pulse"
      aria-label="Enable sound"
    >
      <Volume2 size={14} />
      Tap to enable sound
    </button>
  )
}

// ---- YouTube player ---------------------------------------------------------
function YouTubePlayer({ videoId, title }: { videoId: string; title: string }) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const hasPlayed = useRef(false)
  const [soundBlocked, setSoundBlocked] = useState(false)

  const send = useCallback((func: string, args: unknown[] = []) => {
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: 'command', func, args }),
      '*'
    )
  }, [])

  useEffect(() => {
    const section = iframeRef.current?.closest('section') as Element | null
    const target  = section ?? iframeRef.current
    if (!target) return

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          send('playVideo')
          send('unMute')
          send('setVolume', [80])
          hasPlayed.current = true
          setSoundBlocked(false)
          // Re-send after player finishes loading in case it was not ready
          setTimeout(() => { send('unMute'); send('setVolume', [80]) }, 1000)
        } else if (hasPlayed.current) {
          send('pauseVideo')
          send('mute')
          setSoundBlocked(false)
        }
      },
      { threshold: 0.4 }
    )
    obs.observe(target)
    return () => obs.disconnect()
  }, [send])

  const handleUnlockSound = () => {
    send('unMute')
    send('setVolume', [80])
    send('playVideo')
    setSoundBlocked(false)
  }

  const origin = typeof window !== 'undefined' ? encodeURIComponent(window.location.origin) : ''

  return (
    <div className="relative aspect-video">
      <iframe
        ref={iframeRef}
        src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1&rel=0&modestbranding=1&playsinline=1&origin=${origin}`}
        title={title}
        className="w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
      {soundBlocked && <SoundBlockedOverlay onUnlock={handleUnlockSound} />}
    </div>
  )
}

// ---- Cloudinary / native video player --------------------------------------
function CloudinaryPlayer({ src, title }: { src: string; title: string }) {
  const videoRef   = useRef<HTMLVideoElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const hasPlayed  = useRef(false)
  const [ready, setReady]               = useState(false)
  const [soundBlocked, setSoundBlocked] = useState(false)
  const [manualMuted, setManualMuted]   = useState(false)

  const tryPlay = useCallback(async () => {
    const v = videoRef.current
    if (!v) return
    v.muted  = false
    v.volume = 0.8
    try {
      await v.play()
      hasPlayed.current = true
      setSoundBlocked(false)
    } catch {
      // Unmuted autoplay blocked — fall back to muted
      v.muted = true
      try {
        await v.play()
        hasPlayed.current = true
        setSoundBlocked(true)
      } catch { /* completely blocked */ }
    }
  }, [])

  useEffect(() => {
    const target = wrapperRef.current
    if (!target) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        const v = videoRef.current
        if (!v) return
        if (entry.isIntersecting) {
          tryPlay()
        } else if (hasPlayed.current) {
          v.pause()
          v.muted = true
          setSoundBlocked(false)
          setManualMuted(false)
        }
      },
      { threshold: 0.4 }
    )
    obs.observe(target)
    return () => obs.disconnect()
  }, [tryPlay])

  const handleUnlockSound = () => {
    const v = videoRef.current
    if (!v) return
    v.muted  = false
    v.volume = 0.8
    if (v.paused) v.play()
    setSoundBlocked(false)
  }

  const toggleMute = () => {
    const v = videoRef.current
    if (!v) return
    v.muted = !v.muted
    setManualMuted(v.muted)
  }

  return (
    <div ref={wrapperRef} className="relative aspect-video bg-black">
      {!ready && (
        <div
          aria-hidden
          className="absolute inset-0 bg-[#143B7D]/20 flex items-center justify-center"
          style={{
            backgroundImage:
              'linear-gradient(90deg, rgba(20,59,125,0.08) 25%, rgba(20,59,125,0.18) 50%, rgba(20,59,125,0.08) 75%)',
            backgroundSize: '200% 100%',
            animation: 'lazyShimmer 1.5s ease-in-out infinite',
          }}
        >
          <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
            <Play size={22} className="text-white/50 ml-1" fill="currentColor" />
          </div>
        </div>
      )}
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        style={{ opacity: ready ? 1 : 0, transition: 'opacity 0.4s ease' }}
        playsInline
        loop
        preload="metadata"
        title={title}
        onCanPlay={() => setReady(true)}
        onLoadedData={() => setReady(true)}
      >
        <source src={src} />
      </video>

      {/* Mute toggle — visible while playing */}
      {ready && (
        <button
          onClick={toggleMute}
          className="absolute bottom-3 left-3 z-20 w-9 h-9 flex items-center justify-center rounded-xl bg-black/60 backdrop-blur-sm text-white hover:bg-black/80 transition"
          aria-label={manualMuted ? 'Unmute' : 'Mute'}
        >
          {manualMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
        </button>
      )}
      {soundBlocked && <SoundBlockedOverlay onUnlock={handleUnlockSound} />}
    </div>
  )
}

// ---- Main section -----------------------------------------------------------
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

  const ytId    = videoUrl ? extractYtId(videoUrl) : null
  const isCloud = !!(videoUrl && !ytId && videoUrl.includes('cloudinary.com'))
  const hasVideo = !!(ytId || isCloud)

  const displayTitle = videoTitle || 'Understanding Your Heart Health'
  const displayDesc  = videoDesc  || 'Watch expert-led videos on cardiology topics — from understanding heart disease risk factors to post-procedure care. Knowledge is the first step towards a healthier heart.'

  return (
    <section
      ref={sectionRef as React.RefObject<HTMLElement>}
      className="relative py-16 md:py-24 overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #143B7D 0%, #1565D8 60%, #18B55A 100%)' }}
    >
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
            <p className="text-white/70 text-base leading-relaxed">{displayDesc}</p>
            {['ECG interpretation explained simply', 'When to see a cardiologist', 'Heart-healthy lifestyle tips'].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-300 shrink-0" />
                <span className="text-[13px] text-white/80 font-medium">{item}</span>
              </div>
            ))}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              {[
                { emoji: '🫀', title: 'Know Your Heart', desc: 'Learn how your heart works and what keeps it healthy.' },
                { emoji: '📋', title: 'Understand Tests', desc: 'Decode ECG, Echo & stress test reports with ease.' },
                { emoji: '💊', title: 'Medication Guide', desc: 'Stay informed about common cardiac medications.' },
              ].map(({ emoji, title, desc }) => (
                <div key={title} className="flex flex-col gap-1.5 rounded-2xl bg-white/8 border border-white/12 px-4 py-3.5 hover:bg-white/14 transition-colors">
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
                <div className="aspect-video flex flex-col items-center justify-center gap-4" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <div className="w-16 h-16 rounded-full bg-white/15 border border-white/25 flex items-center justify-center">
                    <Play size={26} className="text-white ml-1" fill="white" />
                  </div>
                  <p className="text-white/50 text-[13px] font-medium">Video coming soon</p>
                </div>
              )}
            </div>
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
