'use client'

import { useEffect, useRef, useState } from 'react'
import { Users, CalendarCheck, Heart, Handshake } from 'lucide-react'
import useScrollReveal from '@/hooks/useScrollReveal'
import Reveal from '@/components/ui/Reveal'

interface StatItem {
  icon: React.ElementType
  value: number
  suffix: string
  label: string
  desc: string
  accent: string   // icon bg tint
  iconColor: string
  border: string
}

const STATS: StatItem[] = [
  {
    icon: Users,
    value: 1000, suffix: '+',
    label: 'Patients Treated',
    desc: 'Lives touched through expert cardiology care',
    accent: 'bg-primary/8', iconColor: 'text-primary', border: 'border-primary/15',
  },
  {
    icon: CalendarCheck,
    value: 10, suffix: '+',
    label: 'Years Experience',
    desc: 'Over a decade of dedicated cardiac specialisation',
    accent: 'bg-cyan/8', iconColor: 'text-cyan', border: 'border-cyan/20',
  },
  {
    icon: Heart,
    value: 150, suffix: '+',
    label: 'Campaigns Funded',
    desc: 'Patient assistance cases successfully supported',
    accent: 'bg-green/8', iconColor: 'text-green', border: 'border-green/20',
  },
  {
    icon: Handshake,
    value: 5, suffix: '+',
    label: 'NGO Partners',
    desc: 'Trusted organisations in our care network',
    accent: 'bg-navy/6', iconColor: 'text-navy', border: 'border-navy/15',
  },
]

function AnimatedCounter({ value, suffix, active, color }: { value: number; suffix: string; active: boolean; color: string }) {
  const [display, setDisplay] = useState(0)
  const frameRef = useRef<number | null>(null)

  useEffect(() => {
    if (!active) return
    const duration = 1800
    const start = performance.now()
    const run = (now: number) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(eased * value))
      if (progress < 1) frameRef.current = requestAnimationFrame(run)
    }
    frameRef.current = requestAnimationFrame(run)
    return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current) }
  }, [active, value])

  return (
    <span className={`tabular-nums ${color}`}>
      {display.toLocaleString('en-IN')}{suffix}
    </span>
  )
}

export default function StatsStrip() {
  // Signature effect: cards pop in from the centre, counters re-run on every pass.
  const { ref, visible, direction, cycle } = useScrollReveal<HTMLElement>({ offset: 0.1 })

  return (
    <section ref={ref} className="relative overflow-hidden bg-bg py-8 md:py-10">

      {/* Subtle top border accent */}
      <div
        className="absolute top-0 left-0 right-0 h-[3px]"
        style={{ background: 'linear-gradient(90deg, #1565D8 0%, #18B8E6 45%, #18B55A 100%)' }}
        aria-hidden
      />

      {/* Very faint radial glow in centre */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(21,101,216,0.04) 0%, transparent 80%)' }}
        aria-hidden
      />

      <div className="container-max px-4 md:px-8 relative z-10">

        {/* Section label */}
        <Reveal
          as="p"
          effect="fade-down"
          visible={visible}
          direction={direction}
          className="text-center text-[11px] font-bold uppercase tracking-[0.18em] text-text-secondary mb-6"
        >
          Trusted by thousands across the region
        </Reveal>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
          {STATS.map(({ icon: Icon, value, suffix, label, desc, accent, iconColor, border }, i) => (
            <Reveal
              key={label}
              effect="pop-center"
              delay={i * 110}
              visible={visible}
              direction={direction}
              className="h-full"
            >
              <div className="group relative h-full flex flex-col items-center text-center bg-white rounded-2xl border border-border px-5 py-7 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_4px_16px_rgba(21,101,216,0.05)] hover:shadow-[0_4px_24px_rgba(21,101,216,0.12)] hover:-translate-y-0.5 transition-all duration-300">
                {/* Top gradient bar per card */}
                <div
                  className="absolute top-0 left-6 right-6 h-[2px] rounded-b-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: 'linear-gradient(90deg, #1565D8, #18B8E6, #18B55A)' }}
                  aria-hidden
                />

                {/* Icon */}
                <div className={`w-11 h-11 rounded-xl ${accent} border ${border} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}>
                  <Icon size={20} className={iconColor} />
                </div>

                {/* Counter */}
                <p className="text-3xl md:text-4xl font-extrabold text-navy leading-none tracking-tight mb-1.5">
                  <AnimatedCounter key={cycle} value={value} suffix={suffix} active={visible} color={iconColor} />
                </p>

                {/* Label */}
                <p className="text-[13px] font-bold text-navy mb-1">{label}</p>

                {/* Divider */}
                <div className={`w-8 h-[2px] rounded-full ${accent} mb-2`} />

                {/* Desc */}
                <p className="text-[11px] text-text-secondary leading-snug">{desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
