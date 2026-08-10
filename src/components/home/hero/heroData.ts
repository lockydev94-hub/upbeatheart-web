import {
  HeartPulse, Baby, Blocks, GraduationCap, UserRound,
  Award, CalendarRange, Star,
  type LucideIcon,
} from 'lucide-react'

/* ═══════════════════════════════════════════════════════════════════════════
   HERO CONTENT — single source of truth for all hero copy.

   The hero tells one story in two beats:
     left  · WHO the doctor is   (identity, proof, how to book)
     right · WHAT the doctor does (the five focus areas, animated as one
             continuous patient journey around a living heart)

   Reword anything here without touching layout or animation code.
   ═══════════════════════════════════════════════════════════════════════════ */

/* ── Speciality statement (journey header) ────────────────────────────────── */
export const SPECIALITY = {
  eyebrow: 'Speciality',
  title:   'Paediatric Cardiology',
  lead:    'Focuses on',
  summary: 'One heart specialist for the whole journey — from the first scan to adult life.',
}

/* ── The focus stages ─────────────────────────────────────────────────────── */
export interface FocusSlide {
  id:       string
  /** Small label above the headline — "Core Focus" or "Age Group" */
  kicker:   string
  /** Short name used on the orbit nodes / navigation */
  label:    string
  /** Age range; empty on the core-focus slide */
  age:      string
  icon:     LucideIcon
  headline: string
  /** One sentence explaining what is treated */
  detail:   string
  /** Three short "what we look for" chips */
  chips:    string[]
  /** Drives the heart's glow, the orbit node and the chip colours.
      Tuned bright enough to read on the deep-navy background. */
  accent:   string
  /** Same colour as rgba, for soft glows */
  glow:     string
  /**
   * How large the heart renders on this stage. The age stages step upward so
   * the heart visibly grows from newborn to adult as the journey advances.
   */
  heartScale: number
  /** Only the core-focus stage runs the "find the defect, repair it" story */
  showRepair?: boolean
  /** Path to the disease image */
  diseaseImage?: string
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
    accent:   '#5B9BFF',
    glow:     'rgba(91,155,255,0.38)',
    heartScale: 1,
    showRepair: true,
    diseaseImage: '/images/heart-diseases/Congenital and structure heart problems.png',
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
    accent:   '#F97BB9',
    glow:     'rgba(249,123,185,0.38)',
    heartScale: 0.76,
    diseaseImage: '/images/heart-diseases/Babies heart issue.png',
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
    accent:   '#B195FF',
    glow:     'rgba(177,149,255,0.38)',
    heartScale: 0.87,
    diseaseImage: '/images/heart-diseases/Children heart issue.png',
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
    accent:   '#41D6FF',
    glow:     'rgba(65,214,255,0.38)',
    heartScale: 0.96,
    diseaseImage: '/images/heart-diseases/Adolescents.png',
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
    accent:   '#3EE68F',
    glow:     'rgba(62,230,143,0.38)',
    heartScale: 1.04,
    diseaseImage: '/images/heart-diseases/Adults with congenital heart disease.png',
  },
]

/** How long each stage stays on screen before advancing (ms). */
export const SLIDE_DURATION = 5200

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
