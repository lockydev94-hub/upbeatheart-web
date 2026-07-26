'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Activity, Heart, Zap, Wind, Stethoscope, Microscope, Shield, TrendingUp, ArrowRight } from 'lucide-react'

const SERVICES = [
  {
    icon: Heart,
    title: 'Coronary Artery Disease',
    desc: 'Diagnosis and management of blocked arteries, angina, and heart attacks.',
    slug: 'coronary-artery-disease',
    color: 'text-red-500',
    bg: 'bg-red-50',
    border: 'border-red-100',
  },
  {
    icon: Zap,
    title: 'Heart Rhythm Disorders',
    desc: 'Specialised care for arrhythmias including atrial fibrillation and palpitations.',
    slug: 'arrhythmia',
    color: 'text-purple-500',
    bg: 'bg-purple-50',
    border: 'border-purple-100',
  },
  {
    icon: Activity,
    title: 'Heart Failure Management',
    desc: 'Comprehensive treatment plans to improve cardiac function and quality of life.',
    slug: 'heart-failure',
    color: 'text-primary',
    bg: 'bg-primary/6',
    border: 'border-primary/12',
  },
  {
    icon: Wind,
    title: 'Valvular Heart Disease',
    desc: 'Expert evaluation and treatment of diseased or damaged heart valves.',
    slug: 'valvular-heart-disease',
    color: 'text-orange-500',
    bg: 'bg-orange-50',
    border: 'border-orange-100',
  },
  {
    icon: TrendingUp,
    title: 'Hypertension & Cholesterol',
    desc: 'Evidence-based management of high blood pressure and lipid disorders.',
    slug: 'hypertension',
    color: 'text-cyan-500',
    bg: 'bg-cyan-50',
    border: 'border-cyan-100',
  },
  {
    icon: Microscope,
    title: 'Cardiac Investigations',
    desc: 'ECG, Echo, Stress Test, Holter monitoring and advanced diagnostic workup.',
    slug: 'cardiac-investigations',
    color: 'text-green',
    bg: 'bg-green/6',
    border: 'border-green/12',
  },
  {
    icon: Shield,
    title: 'Preventive Cardiology',
    desc: 'Proactive heart health screening and risk assessment for all ages.',
    slug: 'preventive-cardiology',
    color: 'text-blue-500',
    bg: 'bg-blue-50',
    border: 'border-blue-100',
  },
  {
    icon: Stethoscope,
    title: 'Congenital Heart Disease',
    desc: 'Diagnosis and ongoing management of structural heart conditions from birth.',
    slug: 'congenital-heart-disease',
    color: 'text-pink-500',
    bg: 'bg-pink-50',
    border: 'border-pink-100',
  },
]

function useScrollReveal(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, visible }
}

export default function ServicesGrid() {
  const { ref, visible } = useScrollReveal()

  return (
    <section className="py-16 md:py-24 bg-bg">
      <div className="container-max px-4 md:px-8">
        {/* Header — reveal from bottom */}
        <div
          className="text-center mb-12 transition-all duration-700"
          style={{
            opacity:   visible ? 1 : 0,
            transform: visible ? 'none' : 'translateY(28px)',
          }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/6 border border-primary/15 text-primary text-[11px] font-bold uppercase tracking-widest mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            Our Specialities
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-navy leading-tight tracking-tight mb-3 whitespace-nowrap">
            Conditions We Diagnose & Treat
          </h2>
          <p className="text-text-secondary text-base leading-relaxed">
            Comprehensive cardiology care under one roof — from routine check-ups to advanced cardiac interventions.
          </p>
        </div>

        {/* Grid — each card staggered */}
        <div ref={ref} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SERVICES.map(({ icon: Icon, title, desc, slug, color, bg, border }, i) => (
            <Link
              key={slug}
              href={`/treatments/${slug}`}
              className="group relative flex flex-col p-5 rounded-2xl bg-white border border-border hover:border-primary/30 hover:shadow-[0_8px_32px_rgba(21,101,216,0.12)] hover:-translate-y-1 transition-all duration-200"
              style={{
                opacity:         visible ? 1 : 0,
                transform:       visible ? 'none' : 'translateY(24px)',
                transition:      `opacity 0.5s cubic-bezier(0.22,1,0.36,1) ${i * 60}ms, transform 0.5s cubic-bezier(0.22,1,0.36,1) ${i * 60}ms, box-shadow 0.2s ease, border-color 0.2s ease`,
              }}
            >
              {/* Hover gradient top strip */}
              <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl gradient-primary opacity-0 group-hover:opacity-100 transition-opacity duration-200" aria-hidden />

              {/* Icon — scale on hover */}
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 border ${bg} ${border} group-hover:scale-110 transition-transform duration-200`}>
                <Icon size={20} className={color} />
              </div>

              {/* Title */}
              <h3 className="text-sm font-extrabold text-navy leading-tight mb-2 group-hover:text-primary transition-colors duration-200">
                {title}
              </h3>

              {/* Desc */}
              <p className="text-[12px] text-text-secondary leading-relaxed flex-1">{desc}</p>

              {/* CTA — slides in on hover */}
              <div className="flex items-center gap-1 mt-4 text-[11px] font-bold text-primary translate-y-1 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200">
                Learn more <ArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform duration-150" />
              </div>
            </Link>
          ))}
        </div>

        {/* See all */}
        <div
          className="text-center mt-8 transition-all duration-700 delay-500"
          style={{ opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(16px)' }}
        >
          <Link
            href="/treatments"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm border-2 border-primary/25 text-primary hover:bg-primary hover:text-white hover:shadow-[0_4px_20px_rgba(21,101,216,0.25)] transition-all duration-200"
          >
            View All Treatments
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </section>
  )
}
