import {
  HeartPulse, Baby, Blocks, GraduationCap, UserRound,
  Award, CalendarRange, Star,
  type LucideIcon,
} from 'lucide-react'

/* ═══════════════════════════════════════════════════════════════════════════
   HERO CONTENT — single source of truth for all hero copy.

   Reword anything here without touching layout or animation code.
   ═══════════════════════════════════════════════════════════════════════════ */

/* ── Speciality statement (slider header) ─────────────────────────────────── */
export const SPECIALITY = {
  eyebrow: 'Speciality',
  title:   'Paediatric Cardiology',
  lead:    'Focuses on',
  summary: 'One heart specialist for the whole journey — from the first scan to adult life.',
}

/* ── The slides ───────────────────────────────────────────────────────────── */
export interface FocusSlide {
  id:       string
  /** Small label above the headline — "Core Focus" or "Age Group" */
  kicker:   string
  /** Short name used on the dots / progress rail */
  label:    string
  /** Age range; empty on the core-focus slide */
  age:      string
  icon:     LucideIcon
  headline: string
  /** One sentence explaining what is treated */
  detail:   string
  /** Three short "what we look for" chips */
  chips:    string[]
  /** Drives the heart's glow, the icon tile and the chip colours */
  accent:   string
  /** Same colour as rgba, for soft glows */
  glow:     string
  /**
   * How large the heart renders on this slide. The age slides step upward so
   * the heart visibly grows from newborn to adult as the slider advances.
   */
  heartScale: number
  /** Only the first slide runs the "find the defect, repair it" animation */
  showRepair?: boolean
}

export const FOCUS_SLIDES: FocusSlide[] = [
  {
    id:       'congenital',
    kicker:   'Core Focus',
    label:    'Congenital & Structural',
    age:      '',
    icon:     HeartPulse,
    headline: 'Congenital & Structural Heart Problems',
    detail:   'Hearts that formed differently before birth, and valves or vessels that are narrowed, leaking or in the wrong place — diagnosed precisely and repaired at the right time.',
    chips:    ['Holes in the heart', 'Valve & vessel defects', 'Structural repair'],
    accent:   '#1565D8',
    glow:     'rgba(21,101,216,0.30)',
    heartScale: 1,
    showRepair: true,
  },
  {
    id:       'babies',
    kicker:   'Age Group',
    label:    'Babies',
    age:      '0 – 1 yr',
    icon:     Baby,
    headline: 'Babies',
    detail:   'Antenatal diagnosis, newborn screening and early repair for babies born with a heart defect.',
    chips:    ['Blue baby / cyanosis', 'Murmur at birth', 'Feeding difficulty'],
    accent:   '#EC4899',
    glow:     'rgba(236,72,153,0.30)',
    heartScale: 0.76,
  },
  {
    id:       'children',
    kicker:   'Age Group',
    label:    'Children',
    age:      '1 – 12 yrs',
    icon:     Blocks,
    headline: 'Children',
    detail:   'Holes in the heart, narrowed valves and acquired heart disease — caught while the child is still growing.',
    chips:    ['Hole in the heart', 'Poor weight gain', 'Kawasaki & rheumatic'],
    accent:   '#8B5CF6',
    glow:     'rgba(139,92,246,0.30)',
    heartScale: 0.87,
  },
  {
    id:       'adolescents',
    kicker:   'Age Group',
    label:    'Adolescents',
    age:      '13 – 18 yrs',
    icon:     GraduationCap,
    headline: 'Adolescents',
    detail:   'Rhythm problems, blackouts and chest pain in teenagers — plus safe-to-play clearance for sport.',
    chips:    ['Palpitations', 'Fainting in sport', 'Sports clearance'],
    accent:   '#18B8E6',
    glow:     'rgba(24,184,230,0.30)',
    heartScale: 0.96,
  },
  {
    id:       'adults',
    kicker:   'Age Group',
    label:    'Adults with CHD',
    age:      '18+ yrs',
    icon:     UserRound,
    headline: 'Adults with Congenital Heart Disease',
    detail:   'Lifelong follow-up after a childhood repair, pregnancy planning and timely re-intervention.',
    chips:    ['Post-repair follow-up', 'Pregnancy planning', 'Re-intervention'],
    accent:   '#18B55A',
    glow:     'rgba(24,181,90,0.30)',
    heartScale: 1.04,
  },
]

/** How long each slide stays on screen before advancing (ms). */
export const SLIDE_DURATION = 5000

/* ── Doctor credibility stats (left panel) ────────────────────────────────── */
export interface HeroStat {
  icon:  LucideIcon
  value: string
  label: string
}

/**
 * `doctorExperience` in Firestore is free text ("15+ years", "15 years", "15").
 * The stat tile is ~70px wide, so reduce it to just the number.
 */
function yearsOnly(raw: string | undefined): string {
  const m = raw?.match(/\d+/)
  return m ? `${m[0]}+` : '15+'
}

export function buildDoctorStats(doctorExperience?: string): HeroStat[] {
  return [
    { icon: Award,         value: yearsOnly(doctorExperience), label: 'Years Exp.'   },
    { icon: CalendarRange, value: '0–40',                      label: 'Yrs Age Span' },
    { icon: HeartPulse,    value: '10K+',                      label: 'CHD Cases'    },
    { icon: Star,          value: '4.9★',                      label: 'Rating'       },
  ]
}

/* ── Trust line under the CTAs ────────────────────────────────────────────── */
export const TRUST_SIGNALS = [
  'No registration needed',
  'Instant confirmation',
  'Free first consultation',
]
