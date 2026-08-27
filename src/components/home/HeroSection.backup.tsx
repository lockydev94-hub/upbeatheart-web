'use client'

import type { SiteSettings } from '@/types/firestore'

import DoctorPanel from './hero/DoctorPanel'
import FocusSlider from './hero/FocusSlider'

interface HeroSectionProps {
  settings: SiteSettings
}

/**
 * HeroSection — premium light-glass redesign.
 *
 * The hero answers, in one glance and one loop of animation:
 *   left  · WHO  — the doctor: portrait, credentials, proof, how to book
 *   right · WHAT — the five focus areas the doctor treats, told as one
 *           continuous journey around a living heart:
 *           Congenital & Structural → Babies → Children → Adolescents →
 *           Adults with congenital heart disease.
 *
 * Atmosphere: a soft white-to-blue field with pastel light-fields and a faint
 * clinical grid — all static (no running ambient animation). The doctor card
 * and focus card are frosted-glass surfaces so every element reads crisply on
 * the light background.
 *
 * Every hero-specific keyframe lives in the single global style block at the
 * bottom of this file; child components only reference class names. Shared
 * entrance utilities (`.anim-*`, `.delay-*`) come from globals.css.
 */
export default function HeroSection({ settings }: HeroSectionProps) {
  return (
    <section className="hero-shell relative overflow-hidden bg-[linear-gradient(180deg,#FFFFFF_0%,#F3F8FF_55%,#EAF3FF_100%)] text-[#143B7D]">

      {/* ══ Ambient background ══ */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        {/* Soft pastel light-fields — static, no drift */}
        <div className="absolute -left-40 -top-44 w-[640px] h-[640px] rounded-full opacity-60"
             style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.16) 0%, transparent 62%)', filter: 'blur(70px)' }} />
        <div className="absolute -right-32 -top-20 w-[560px] h-[560px] rounded-full opacity-50"
             style={{ background: 'radial-gradient(circle, rgba(24,184,230,0.14) 0%, transparent 62%)', filter: 'blur(80px)' }} />
        <div className="absolute left-1/2 bottom-[-180px] -translate-x-1/2 w-[760px] h-[420px] rounded-full opacity-45"
             style={{ background: 'radial-gradient(circle, rgba(24,181,90,0.12) 0%, transparent 66%)', filter: 'blur(90px)' }} />
        <div className="absolute right-[6%] bottom-[10%] w-[420px] h-[420px] rounded-full opacity-40"
             style={{ background: 'radial-gradient(circle, rgba(249,123,185,0.12) 0%, transparent 64%)', filter: 'blur(80px)' }} />

        {/* Faint blueprint grid — static texture, masked to the top */}
        <div className="absolute inset-0 opacity-[0.035]"
             style={{
               backgroundImage:
                 'linear-gradient(rgba(21,101,216,0.7) 1px, transparent 1px), linear-gradient(90deg, rgba(21,101,216,0.7) 1px, transparent 1px)',
               backgroundSize: '52px 52px',
               maskImage: 'radial-gradient(ellipse 90% 85% at 50% 35%, black 30%, transparent 75%)',
               WebkitMaskImage: 'radial-gradient(ellipse 90% 85% at 50% 35%, black 30%, transparent 75%)',
             }} />
      </div>

      {/* ══ Content ══ */}
      <div className="container-max px-4 md:px-8 relative z-10">
        <div className="hero-grid grid grid-cols-1 lg:grid-cols-[1.02fr_0.98fr] gap-10 lg:gap-14 items-center pt-10 pb-16 lg:pt-12 lg:pb-20">

          <DoctorPanel settings={settings} />

          <div className="w-full max-w-[560px] mx-auto lg:mx-0 lg:ml-auto">
            <FocusSlider />
          </div>
        </div>
      </div>

      {/* ══ Wave divider into the light page below ══ */}
      <div className="absolute bottom-[-1px] left-0 right-0 z-10 pointer-events-none" aria-hidden>
        <svg viewBox="0 0 1440 70" preserveAspectRatio="none" className="w-full h-[42px] lg:h-[64px] block">
          <path d="M0 70 L0 44 C 240 6 480 6 720 30 C 960 54 1200 54 1440 24 L1440 70 Z" fill="#F8FAFC" />
        </svg>
      </div>

      {/* ══ Hero-only keyframes and classes ══ */}
      <style jsx global>{`
        /* Header + hero fills exactly 100vh.
           Mobile:  header ≈ 120px (main bar 76px + ECG strip 44px)
           Desktop: header ≈ 152px (+ top bar 32px on md+)            */
        .hero-shell { min-height: calc(100dvh - 120px); }
        .hero-grid  { min-height: calc(100dvh - 120px); }
        @media (min-width: 768px) {
          .hero-shell,
          .hero-grid { min-height: calc(100dvh - 152px); }
        }

        /* ── Glass card border — static gradient edge, no motion ────────── */
        .hero-ring {
          background: linear-gradient(135deg,
            rgba(21,101,216,0.55), rgba(24,184,230,0.42),
            rgba(24,181,90,0.45), rgba(249,123,185,0.38),
            rgba(21,101,216,0.55));
          opacity: 0.35;
        }

        /* ── Portrait halo — static soft glow (no spin) ─────────────────── */
        .hero-portrait-halo {
          background: linear-gradient(135deg, #5B9BFF, #41D6FF, #3EE68F, #F97BB9);
          opacity: 0.30;
        }

        /* ── CTA shimmer on hover ───────────────────────────────────────── */
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

        /* ── Animated gradient headline ─────────────────────────────────── */
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

        /* ── Live availability dot ──────────────────────────────────────── */
        .hero-live-ping { animation: heroPing 1.9s cubic-bezier(0, 0, 0.2, 1) infinite; }
        @keyframes heroPing {
          0%   { transform: scale(1);   opacity: 0.65; }
          80%  { transform: scale(1.7); opacity: 0; }
          100% { transform: scale(1.7); opacity: 0; }
        }

        /* ── Stage chip / age badge popping in ──────────────────────────── */
        .hero-chip-in { animation: heroChipIn 0.4s cubic-bezier(0.22, 1, 0.36, 1) both; }
        @keyframes heroChipIn {
          0%   { opacity: 0; transform: scale(0.8); }
          70%  { transform: scale(1.04); }
          100% { opacity: 1; transform: scale(1); }
        }

        /* ── ECG: one bright pulse travelling the resting trace ─────────── */
        .hero-ecg-sweep {
          stroke-dasharray: 90 910;
          animation: heroEcgSweep 3.4s linear infinite;
        }
        @keyframes heroEcgSweep {
          from { stroke-dashoffset: 1000; }
          to   { stroke-dashoffset: 0; }
        }

        /* ── Autoplay progress under the journey ────────────────────────── */
        @keyframes heroStageProgress {
          from { width: 0%; }
          to   { width: 100%; }
        }

        /* ── Respect the visitor's motion preference ────────────────────── */
        @media (prefers-reduced-motion: reduce) {
          .hero-title-grad,
          .hero-ecg-sweep,
          .hero-live-ping,
          .hero-chip-in {
            animation: none !important;
          }
          .hero-title-grad {
            background: none;
            -webkit-text-fill-color: currentColor;
            color: #143B7D;
          }
          .hero-chip-in { opacity: 1 !important; transform: none !important; }
          .hero-cta::after { transition: none; }
        }
      `}</style>
    </section>
  )
}