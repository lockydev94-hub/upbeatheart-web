'use client'

import type { SiteSettings } from '@/types/firestore'

import useScrollProgress from '@/hooks/useScrollProgress'
import DoctorPanel from './hero/DoctorPanel'
import FocusSlider from './hero/FocusSlider'

interface HeroSectionProps {
  settings: SiteSettings
}

/**
 * HeroSection — medical symbols float across the full hero background.
 * Cards are clean glass (no hover-lift, no conic ring, no spotlight aura).
 * All ambient animation lives only in the background layer.
 *
 * Signature scroll effect: the hero is the one section driven by scroll
 * POSITION rather than a reveal transition — it is already on screen when the
 * page loads, so there is nothing to reveal. useScrollProgress feeds a
 * continuous 0 → 1 value into layered parallax: light-fields lag behind, the
 * symbol field and content run ahead and dissolve, and the wave divider swells.
 * The hero therefore separates into planes and recedes as the page moves on.
 * Scroll-linked motion is inherently reversible, so it plays in both
 * directions, and the hook reports a flat 0 under prefers-reduced-motion.
 */
export default function HeroSection({ settings }: HeroSectionProps) {
  const { ref, progress } = useScrollProgress<HTMLElement>()

  // The hero already fills the first screen, so raw progress sits at roughly
  // 0.55 before anyone scrolls. Re-map the outgoing half onto 0 → 1 so every
  // layer starts at rest and hits its full offset as the hero clears the view.
  const p = Math.min(Math.max((progress - 0.55) / 0.45, 0), 1)

  // Positive px = the layer lags behind the scroll and reads as depth;
  // negative px = it runs ahead of the scroll and reads as foreground.
  const drift = (px: number) => `translate3d(0, ${(p * px).toFixed(1)}px, 0)`

  // Content holds full opacity through the first quarter so it stays readable
  // while the hero is still framed, then fades out.
  const dissolve = Math.min(Math.max((p - 0.25) / 0.6, 0), 1)

  return (
    <section
      ref={ref}
      className="hero-shell relative overflow-hidden bg-[linear-gradient(180deg,#FFFFFF_0%,#F3F8FF_55%,#EAF3FF_100%)] text-[#143B7D]"
    >

      {/* ══ Soft light-fields — deepest plane, lags behind the scroll ══ */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div className="absolute -left-40 -top-44 w-[640px] h-[640px] rounded-full"
             style={{
               background: 'radial-gradient(circle, rgba(37,99,235,0.16) 0%, transparent 62%)',
               filter: 'blur(70px)',
               opacity: 0.6 - p * 0.34,
               transform: `${drift(96)} scale(${(1 + p * 0.14).toFixed(4)})`,
               willChange: 'transform, opacity',
             }} />
        <div className="absolute -right-32 -top-20 w-[560px] h-[560px] rounded-full"
             style={{
               background: 'radial-gradient(circle, rgba(24,184,230,0.14) 0%, transparent 62%)',
               filter: 'blur(80px)',
               opacity: 0.5 - p * 0.3,
               transform: drift(146),
               willChange: 'transform, opacity',
             }} />
        {/* Centring lives in the inline transform now, not -translate-x-1/2,
            because an inline transform would otherwise override the class. */}
        <div className="absolute left-1/2 bottom-[-180px] w-[760px] h-[420px] rounded-full"
             style={{
               background: 'radial-gradient(circle, rgba(24,181,90,0.12) 0%, transparent 66%)',
               filter: 'blur(90px)',
               opacity: 0.45 - p * 0.16,
               transform: `translate3d(-50%, ${(p * -64).toFixed(1)}px, 0) scale(${(1 + p * 0.1).toFixed(4)})`,
               willChange: 'transform, opacity',
             }} />
        <div className="absolute right-[6%] bottom-[10%] w-[420px] h-[420px] rounded-full"
             style={{
               background: 'radial-gradient(circle, rgba(249,123,185,0.12) 0%, transparent 64%)',
               filter: 'blur(80px)',
               opacity: 0.4 - p * 0.14,
               transform: drift(-34),
               willChange: 'transform, opacity',
             }} />

        {/* Faint blueprint grid — creeps down and thins out */}
        <div className="absolute inset-0"
             style={{
               backgroundImage: 'linear-gradient(rgba(21,101,216,0.7) 1px, transparent 1px), linear-gradient(90deg, rgba(21,101,216,0.7) 1px, transparent 1px)',
               backgroundSize: '52px 52px',
               maskImage: 'radial-gradient(ellipse 90% 85% at 50% 35%, black 30%, transparent 75%)',
               WebkitMaskImage: 'radial-gradient(ellipse 90% 85% at 50% 35%, black 30%, transparent 75%)',
               opacity: 0.035 - p * 0.02,
               transform: drift(44),
               willChange: 'transform, opacity',
             }} />
      </div>

      {/* ══ Floating medical symbols — foreground plane, runs ahead ══ */}
      <div
        className="absolute inset-0 pointer-events-none overflow-hidden"
        aria-hidden
        style={{
          transform: drift(-78),
          opacity: 1 - dissolve * 0.6,
          willChange: 'transform, opacity',
        }}
      >

        {/* ── Medical Cross ── */}
        <svg className="med-sym sym-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="9" y="2" width="6" height="20" rx="2" fill="rgba(21,101,216,0.55)"/>
          <rect x="2" y="9" width="20" height="6" rx="2" fill="rgba(21,101,216,0.55)"/>
        </svg>

        {/* ── Heart ── */}
        <svg className="med-sym sym-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 21C12 21 3 13.5 3 8.5C3 5.42 5.42 3 8.5 3C10.24 3 11.91 3.81 13 5.09C14.09 3.81 15.76 3 17.5 3C20.58 3 23 5.42 23 8.5C23 13.5 12 21 12 21Z" fill="rgba(249,123,185,0.50)"/>
        </svg>

        {/* ── Stethoscope ── */}
        <svg className="med-sym sym-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4.5 6.375a4.125 4.125 0 118.25 0v3.75a4.125 4.125 0 01-8.25 0v-3.75z" stroke="rgba(24,184,230,0.55)" strokeWidth="1.5" fill="none"/>
          <path d="M8.625 10.5v3.75a5.625 5.625 0 005.625 5.625 5.625 5.625 0 005.625-5.625V10.5" stroke="rgba(24,184,230,0.55)" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
          <circle cx="19.875" cy="10.125" r="1.125" fill="rgba(24,184,230,0.55)"/>
        </svg>

        {/* ── Pulse / ECG wave ── */}
        <svg className="med-sym sym-4" viewBox="0 0 48 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 12 H10 l4 0 l3 -8 l4 14 l3 -10 l3 4 H48" stroke="rgba(24,181,90,0.55)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        </svg>

        {/* ── Pill ── */}
        <svg className="med-sym sym-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="9" width="18" height="6" rx="3" fill="rgba(177,149,255,0.50)"/>
          <line x1="12" y1="9" x2="12" y2="15" stroke="rgba(177,149,255,0.80)" strokeWidth="1.5"/>
        </svg>

        {/* ── DNA helix (simplified) ── */}
        <svg className="med-sym sym-6" viewBox="0 0 16 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2 2 Q8 8 14 14 Q8 20 2 26" stroke="rgba(21,101,216,0.50)" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
          <path d="M14 2 Q8 8 2 14 Q8 20 14 26" stroke="rgba(24,184,230,0.50)" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
          <line x1="5" y1="8" x2="11" y2="8" stroke="rgba(21,101,216,0.40)" strokeWidth="1"/>
          <line x1="3" y1="14" x2="13" y2="14" stroke="rgba(21,101,216,0.40)" strokeWidth="1"/>
          <line x1="5" y1="20" x2="11" y2="20" stroke="rgba(21,101,216,0.40)" strokeWidth="1"/>
        </svg>

        {/* ── Syringe ── */}
        <svg className="med-sym sym-7" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 2l4 4-2 2-4-4 2-2z" fill="rgba(24,181,90,0.50)"/>
          <path d="M14 6l4 4-9 9H5v-4l9-9z" fill="rgba(24,181,90,0.45)"/>
          <line x1="5" y1="19" x2="2" y2="22" stroke="rgba(24,181,90,0.50)" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="9" y1="10" x2="14" y2="15" stroke="rgba(255,255,255,0.60)" strokeWidth="1" strokeDasharray="2 2"/>
        </svg>

        {/* ── Medical Cross (small) ── */}
        <svg className="med-sym sym-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="9" y="2" width="6" height="20" rx="2" fill="rgba(249,123,185,0.45)"/>
          <rect x="2" y="9" width="20" height="6" rx="2" fill="rgba(249,123,185,0.45)"/>
        </svg>

        {/* ── Heartbeat dot ── */}
        <svg className="med-sym sym-9" viewBox="0 0 48 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 12 H8 l3 0 l2 -6 l3 12 l2 -8 l2 2 H48" stroke="rgba(249,123,185,0.55)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        </svg>

        {/* ── Microscope (simplified) ── */}
        <svg className="med-sym sym-10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="8" r="4" stroke="rgba(177,149,255,0.55)" strokeWidth="1.5" fill="none"/>
          <line x1="12" y1="12" x2="12" y2="18" stroke="rgba(177,149,255,0.55)" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="7" y1="20" x2="17" y2="20" stroke="rgba(177,149,255,0.55)" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="14" y1="5" x2="18" y2="2" stroke="rgba(177,149,216,0.50)" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>

        {/* ── Plus sign ── */}
        <svg className="med-sym sym-11" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <line x1="10" y1="2" x2="10" y2="18" stroke="rgba(24,184,230,0.55)" strokeWidth="2.5" strokeLinecap="round"/>
          <line x1="2" y1="10" x2="18" y2="10" stroke="rgba(24,184,230,0.55)" strokeWidth="2.5" strokeLinecap="round"/>
        </svg>

        {/* ── Heart (tiny) ── */}
        <svg className="med-sym sym-12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 21C12 21 3 13.5 3 8.5C3 5.42 5.42 3 8.5 3C10.24 3 11.91 3.81 13 5.09C14.09 3.81 15.76 3 17.5 3C20.58 3 23 5.42 23 8.5C23 13.5 12 21 12 21Z" fill="rgba(21,101,216,0.42)"/>
        </svg>

        {/* ── Pill (tiny) ── */}
        <svg className="med-sym sym-13" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="9" width="18" height="6" rx="3" fill="rgba(24,181,90,0.45)"/>
          <line x1="12" y1="9" x2="12" y2="15" stroke="rgba(24,181,90,0.75)" strokeWidth="1.5"/>
        </svg>

        {/* ── ECG wave tiny ── */}
        <svg className="med-sym sym-14" viewBox="0 0 48 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 12 H10 l4 0 l3 -8 l4 14 l3 -10 l3 4 H48" stroke="rgba(177,149,255,0.50)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        </svg>

        {/* ── Cross tiny ── */}
        <svg className="med-sym sym-15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="9" y="2" width="6" height="20" rx="2" fill="rgba(24,184,230,0.42)"/>
          <rect x="2" y="9" width="20" height="6" rx="2" fill="rgba(24,184,230,0.42)"/>
        </svg>

      </div>

      {/* ══ Content — lifts, shrinks a touch and dissolves on the way out ══ */}
      {/* Transform is applied only once scrolling starts so text stays pixel
          -sharp at rest (a GPU layer at offset 0 can soften it). */}
      <div
        className="container-max px-4 md:px-8 relative z-10"
        style={p > 0 ? {
          transform: `translate3d(0, ${(p * -58).toFixed(1)}px, 0) scale(${(1 - p * 0.045).toFixed(4)})`,
          opacity: 1 - dissolve * 0.75,
          willChange: 'transform, opacity',
        } : undefined}
      >
        <div className="hero-grid grid grid-cols-1 lg:grid-cols-[1.02fr_0.98fr] gap-10 lg:gap-14 items-center pt-8 pb-10 lg:pt-10 lg:pb-12">
          <DoctorPanel settings={settings} />
          <div className="w-full max-w-[560px] mx-auto lg:mx-0 lg:ml-auto">
            <FocusSlider />
          </div>
        </div>
      </div>

      {/* ══ Wave divider — swells upward, anchored to the bottom edge ══ */}
      {/* Scaling (not translating) keeps it flush with the section boundary so
          no seam ever opens between the wave and the next section. */}
      <div
        className="absolute bottom-[-1px] left-0 right-0 z-10 pointer-events-none"
        aria-hidden
        style={{
          transform: `scaleY(${(1 + p * 0.42).toFixed(4)})`,
          transformOrigin: 'bottom',
          willChange: 'transform',
        }}
      >
        <svg viewBox="0 0 1440 70" preserveAspectRatio="none" className="w-full h-[42px] lg:h-[64px] block">
          <path d="M0 70 L0 44 C 240 6 480 6 720 30 C 960 54 1200 54 1440 24 L1440 70 Z" fill="#F8FAFC" />
        </svg>
      </div>

      {/* ══ All hero keyframes ══ */}
      <style jsx global>{`
        /* ── Shell sizing ─────────────────────────────────────────────── */
        .hero-shell { min-height: calc(100dvh - 120px); }
        .hero-grid  { min-height: calc(100dvh - 120px); }
        @media (min-width: 768px) {
          .hero-shell,
          .hero-grid { min-height: calc(100dvh - 152px); }
        }

        /* ══ Medical symbols — base ══ */
        .med-sym {
          position: absolute;
          pointer-events: none;
          will-change: transform, opacity;
        }

        /* ── sym positions & sizes (spread across the full hero area) ─ */
        /* Large cross — top-left area */
        .sym-1  { width: 28px; top: 8%;  left: 4%;   animation: medFloat1  14s ease-in-out infinite; }
        /* Heart — upper-center-left */
        .sym-2  { width: 22px; top: 12%; left: 22%;  animation: medFloat2  18s ease-in-out infinite; }
        /* Stethoscope — mid-left edge */
        .sym-3  { width: 26px; top: 42%; left: 1%;   animation: medFloat3  16s ease-in-out infinite; }
        /* ECG wave — upper band right of center */
        .sym-4  { width: 52px; top: 6%;  left: 54%;  animation: medFloat4  20s ease-in-out infinite; }
        /* Pill — top-right quadrant */
        .sym-5  { width: 30px; top: 14%; left: 78%;  animation: medFloat5  15s ease-in-out infinite; }
        /* DNA — right edge, upper */
        .sym-6  { width: 18px; top: 18%; left: 93%;  animation: medFloat6  22s ease-in-out infinite; }
        /* Syringe — lower-left */
        .sym-7  { width: 24px; top: 68%; left: 6%;   animation: medFloat7  17s ease-in-out infinite; }
        /* Small cross — lower-right */
        .sym-8  { width: 20px; top: 72%; left: 88%;  animation: medFloat8  13s ease-in-out infinite; }
        /* Heartbeat — bottom band */
        .sym-9  { width: 56px; top: 82%; left: 30%;  animation: medFloat9  19s ease-in-out infinite; }
        /* Microscope — mid-right */
        .sym-10 { width: 22px; top: 50%; left: 90%;  animation: medFloat10 21s ease-in-out infinite; }
        /* Plus — center-top */
        .sym-11 { width: 18px; top: 3%;  left: 46%;  animation: medFloat11 12s ease-in-out infinite; }
        /* Heart tiny — lower-center */
        .sym-12 { width: 16px; top: 78%; left: 55%;  animation: medFloat12 16s ease-in-out 3s infinite; }
        /* Pill tiny — left-center */
        .sym-13 { width: 20px; top: 55%; left: 14%;  animation: medFloat13 14s ease-in-out 1s infinite; }
        /* ECG tiny — top-far-left */
        .sym-14 { width: 44px; top: 22%; left: 2%;   animation: medFloat14 23s ease-in-out 2s infinite; }
        /* Cross tiny — above wave */
        .sym-15 { width: 16px; top: 86%; left: 72%;  animation: medFloat15 11s ease-in-out 4s infinite; }

        /* ── 15 independent float paths ──────────────────────────────── */
        /* Each symbol gets a unique drift (translate X/Y) + slight rotate + fade */
        @keyframes medFloat1 {
          0%,100% { transform: translate(0px, 0px) rotate(0deg);   opacity: 0.55; }
          30%      { transform: translate(6px, -14px) rotate(8deg); opacity: 0.85; }
          65%      { transform: translate(-4px, 8px) rotate(-5deg); opacity: 0.45; }
        }
        @keyframes medFloat2 {
          0%,100% { transform: translate(0px, 0px) rotate(-4deg);    opacity: 0.50; }
          40%      { transform: translate(-8px, -18px) rotate(4deg);  opacity: 0.80; }
          70%      { transform: translate(5px, 6px) rotate(-2deg);    opacity: 0.40; }
        }
        @keyframes medFloat3 {
          0%,100% { transform: translate(0px, 0px) rotate(0deg);    opacity: 0.48; }
          25%      { transform: translate(10px, -10px) rotate(6deg); opacity: 0.75; }
          60%      { transform: translate(4px, 12px) rotate(-4deg);  opacity: 0.38; }
        }
        @keyframes medFloat4 {
          0%,100% { transform: translate(0px, 0px);    opacity: 0.50; }
          50%      { transform: translate(-10px, -8px); opacity: 0.82; }
        }
        @keyframes medFloat5 {
          0%,100% { transform: translate(0px, 0px) rotate(12deg);   opacity: 0.52; }
          35%      { transform: translate(-6px, -16px) rotate(20deg); opacity: 0.78; }
          75%      { transform: translate(8px, 4px) rotate(8deg);    opacity: 0.42; }
        }
        @keyframes medFloat6 {
          0%,100% { transform: translate(0px, 0px);    opacity: 0.45; }
          45%      { transform: translate(-8px, -20px); opacity: 0.72; }
          80%      { transform: translate(4px, 10px);   opacity: 0.35; }
        }
        @keyframes medFloat7 {
          0%,100% { transform: translate(0px, 0px) rotate(-10deg);   opacity: 0.50; }
          30%      { transform: translate(12px, -12px) rotate(0deg);  opacity: 0.78; }
          65%      { transform: translate(-5px, 8px) rotate(-14deg);  opacity: 0.38; }
        }
        @keyframes medFloat8 {
          0%,100% { transform: translate(0px, 0px);    opacity: 0.48; }
          50%      { transform: translate(-10px, -14px); opacity: 0.75; }
        }
        @keyframes medFloat9 {
          0%,100% { transform: translate(0px, 0px);   opacity: 0.45; }
          40%      { transform: translate(8px, -10px); opacity: 0.70; }
          75%      { transform: translate(-6px, 6px);  opacity: 0.38; }
        }
        @keyframes medFloat10 {
          0%,100% { transform: translate(0px, 0px) rotate(0deg);    opacity: 0.48; }
          35%      { transform: translate(-12px, -8px) rotate(10deg); opacity: 0.74; }
          70%      { transform: translate(6px, 12px) rotate(-6deg);  opacity: 0.36; }
        }
        @keyframes medFloat11 {
          0%,100% { transform: translate(0px, 0px);    opacity: 0.52; }
          50%      { transform: translate(-6px, -14px); opacity: 0.82; }
        }
        @keyframes medFloat12 {
          0%,100% { transform: translate(0px, 0px) rotate(0deg);    opacity: 0.45; }
          40%      { transform: translate(8px, -12px) rotate(12deg); opacity: 0.72; }
        }
        @keyframes medFloat13 {
          0%,100% { transform: translate(0px, 0px) rotate(0deg);    opacity: 0.50; }
          55%      { transform: translate(-8px, -10px) rotate(8deg); opacity: 0.76; }
        }
        @keyframes medFloat14 {
          0%,100% { transform: translate(0px, 0px);    opacity: 0.40; }
          45%      { transform: translate(10px, -12px); opacity: 0.65; }
        }
        @keyframes medFloat15 {
          0%,100% { transform: translate(0px, 0px);    opacity: 0.42; }
          50%      { transform: translate(-8px, -10px); opacity: 0.68; }
        }

        /* ── Glass card border — static gradient edge (no spin) ──────── */
        .hero-ring {
          background: linear-gradient(135deg,
            rgba(21,101,216,0.55), rgba(24,184,230,0.42),
            rgba(24,181,90,0.45),  rgba(249,123,185,0.38),
            rgba(21,101,216,0.55));
          opacity: 0.35;
        }

        /* ── Portrait halo — static soft glow (no spin) ──────────────── */
        .hero-portrait-halo {
          background: linear-gradient(135deg, #5B9BFF, #41D6FF, #3EE68F, #F97BB9);
          opacity: 0.30;
        }

        /* ── CTA shimmer on hover ─────────────────────────────────────── */
        .hero-cta::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(105deg, transparent 36%, rgba(255,255,255,0.38) 50%, transparent 64%);
          background-size: 260% 100%;
          background-repeat: no-repeat;
          background-position: 190% 0;
          transition: background-position 0.85s ease;
          pointer-events: none;
        }
        .hero-cta:hover::after { background-position: -90% 0; }

        /* ── Animated gradient headline ──────────────────────────────── */
        .hero-title-grad {
          background: linear-gradient(90deg, #143B7D 0%, #1565D8 25%, #18B8E6 50%, #18B55A 75%, #143B7D 100%);
          background-size: 220% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: heroTitleGrad 5.5s ease-in-out infinite;
        }
        @keyframes heroTitleGrad {
          0%, 100% { background-position: 0% 0; }
          50%      { background-position: 100% 0; }
        }

        /* ── Live availability ping ───────────────────────────────────── */
        .hero-live-ping { animation: heroPing 1.9s cubic-bezier(0, 0, 0.2, 1) infinite; }
        @keyframes heroPing {
          0%   { transform: scale(1);   opacity: 0.65; }
          80%  { transform: scale(1.7); opacity: 0; }
          100% { transform: scale(1.7); opacity: 0; }
        }

        /* ── Stage chip / age badge ───────────────────────────────────── */
        .hero-chip-in { animation: heroChipIn 0.4s cubic-bezier(0.22, 1, 0.36, 1) both; }
        @keyframes heroChipIn {
          0%   { opacity: 0; transform: scale(0.8); }
          70%  { transform: scale(1.04); }
          100% { opacity: 1; transform: scale(1); }
        }

        /* ── ECG sweep ────────────────────────────────────────────────── */
        .hero-ecg-sweep {
          stroke-dasharray: 90 910;
          animation: heroEcgSweep 3.4s linear infinite;
        }
        @keyframes heroEcgSweep {
          from { stroke-dashoffset: 1000; }
          to   { stroke-dashoffset: 0; }
        }

        /* ── Autoplay progress ────────────────────────────────────────── */
        @keyframes heroStageProgress {
          from { width: 0%; }
          to   { width: 100%; }
        }

        /* ── Card entrance ────────────────────────────────────────────── */
        .anim-grow-in { animation: heroGrowIn 0.7s cubic-bezier(0.22,1,0.36,1) both; }
        @keyframes heroGrowIn {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ── Reduce motion ────────────────────────────────────────────── */
        @media (prefers-reduced-motion: reduce) {
          .hero-title-grad,
          .hero-ecg-sweep,
          .hero-live-ping,
          .hero-chip-in,
          .med-sym { animation: none !important; }
          .hero-title-grad {
            background: none;
            -webkit-text-fill-color: currentColor;
            color: #143B7D;
          }
          .hero-chip-in { opacity: 1 !important; transform: none !important; }
          .hero-cta::after { transition: none; }
          .med-sym { opacity: 0.35 !important; }
        }
      `}</style>
    </section>
  )
}
