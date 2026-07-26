'use client'

/**
 * Smart Appointment Booking — Website
 *
 * Flow:
 *   Step 0 — PHONE: user enters 10-digit number → silent Firestore lookup fires
 *              • Continue button is DISABLED until lookup resolves (spinner shown)
 *              • On error: "Could not verify number" disappears; Continue is still
 *                enabled so the user can proceed as a new patient
 *   Step 1 — PATIENT DETAILS:
 *              • EXISTING → show "Welcome back, [FirstName]" banner ONLY
 *                           (no address, no visit history, no medical data)
 *              • NEW      → full registration form
 *   Step 2 — SCHEDULE: date / time / doctor / reason
 *   Step 3 — SUCCESS: booking reference card
 *
 * Privacy rules (WEBSITE_PLAN.md §3):
 *   - Returning patient: show first name only, hide ALL other PII
 *   - Never query/display: address, bloodGroup, conditions, meds, emergency contact
 *   - Public can only CREATE appointments (Firestore rules enforced server-side)
 */

import Image from 'next/image'
import { useState, useRef, useCallback } from 'react'
import {
  checkPatientByPhone,
  createAppointment,
  generateBookingRef,
  APPOINTMENT_REASONS,
  TIME_SLOTS,
} from '@/lib/firestore/appointments'
import type { SiteSettings } from '@/types/firestore'
import type { DoctorOption } from './page'
import {
  Calendar, Clock, Phone, User, Mail, ChevronRight,
  ChevronLeft, Heart, Stethoscope, CheckCircle2, AlertCircle,
  Loader2, MapPin, Shield, ArrowRight, Sparkles,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

type Step = 'phone' | 'patient' | 'schedule' | 'success'
type VisitType = 'first' | 'followup'

/** null  = lookup not yet run
 *  false = lookup running
 *  object = lookup done  */
type LookupState =
  | null
  | false
  | { exists: boolean; firstName?: string; visitCount?: number }

interface FormState {
  patientPhone:  string
  patientEmail:  string
  patientName:   string
  age:           string
  gender:        'male' | 'female' | 'other' | ''
  preferredDate: string
  preferredTime: string
  doctorId:      string
  doctorName:    string
  reason:        string
  customReason:  string
  referredBy:    string
  visitType:     VisitType
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function todayString() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}
function maxDateString() {
  const d = new Date(); d.setDate(d.getDate() + 60)
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}
function formatDisplayDate(dateStr: string) {
  if (!dateStr) return ''
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
}

// ─── Shared UI primitives ─────────────────────────────────────────────────────

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
      {children}{required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
  )
}

function Input({ icon: Icon, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { icon?: React.ElementType }) {
  return (
    <div className="relative">
      {Icon && <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />}
      <input
        {...props}
        className={`w-full border border-gray-200 rounded-2xl py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition bg-white placeholder:text-gray-300 disabled:bg-gray-50 disabled:text-gray-400
          ${Icon ? 'pl-10 pr-4' : 'px-4'} ${props.className ?? ''}`}
      />
    </div>
  )
}

function ErrorMsg({ msg }: { msg: string }) {
  if (!msg) return null
  return (
    <p className="flex items-center gap-1.5 text-xs text-red-500 mt-1.5">
      <AlertCircle className="w-3.5 h-3.5 shrink-0" />{msg}
    </p>
  )
}

// ─── Step Indicator ───────────────────────────────────────────────────────────

const STEPS: { id: Step; label: string }[] = [
  { id: 'phone',    label: 'Your Number'  },
  { id: 'patient',  label: 'Your Details' },
  { id: 'schedule', label: 'Schedule'     },
  { id: 'success',  label: 'Confirmed'    },
]

function StepBar({ current }: { current: Step }) {
  const idx = STEPS.findIndex(s => s.id === current)
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {STEPS.map((s, i) => {
        const done   = i < idx
        const active = i === idx
        const last   = i === STEPS.length - 1
        return (
          <div key={s.id} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300
                ${done   ? 'bg-green border-green text-white' :
                  active ? 'bg-primary border-primary text-white shadow-md shadow-primary/30' :
                           'bg-white border-gray-200 text-gray-400'}`}>
                {done ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
              </div>
              <span className={`text-[10px] font-semibold uppercase tracking-wide whitespace-nowrap
                ${active ? 'text-primary' : done ? 'text-green' : 'text-gray-400'}`}>
                {s.label}
              </span>
            </div>
            {!last && (
              <div className={`w-12 md:w-20 h-0.5 mb-4 mx-1 transition-all duration-300
                ${i < idx ? 'bg-green' : 'bg-gray-200'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface Props {
  settings: Pick<SiteSettings,
    'doctorName' | 'doctorTitle' | 'doctorPhotoUrl' | 'doctorQuals' |
    'appointmentsOpen' | 'appointmentNote' | 'hospitalName' | 'hospitalAddress' |
    'phone' | 'whatsapp' | 'siteTitle'
  >
  doctors: DoctorOption[]
}

export default function AppointmentClient({ settings, doctors }: Props) {
  const [step, setStep]           = useState<Step>('phone')
  const [lookup, setLookup]       = useState<LookupState>(null)
  const [lookupErr, setLookupErr] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [bookingRef, setBookingRef] = useState('')
  const [formErr, setFormErr]     = useState('')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [form, setForm] = useState<FormState>({
    patientPhone:  '',
    patientEmail:  '',
    patientName:   '',
    age:           '',
    gender:        '',
    preferredDate: '',
    preferredTime: '',
    doctorId:   doctors.length === 1 ? doctors[0].uid  : '',
    doctorName: doctors.length === 1 ? doctors[0].name : '',
    reason:        '',
    customReason:  '',
    referredBy:    '',
    visitType:     'first',
  })

  const set = useCallback((patch: Partial<FormState>) =>
    setForm(prev => ({ ...prev, ...patch })), [])

  // ── Derived state ─────────────────────────────────────────────────────────

  const isLookingUp = lookup === false
  const lookupDone  = lookup !== null && lookup !== false

  // Continue is enabled only when:
  //   • phone has 10 digits AND
  //   • lookup has completed (not null, not false/loading)
  const phoneDigits    = form.patientPhone.replace(/\D/g, '')
  const continueEnabled = phoneDigits.length >= 10 && lookupDone && !isLookingUp

  // ── Phone lookup ──────────────────────────────────────────────────────────

  const doLookup = useCallback(async (phone: string) => {
    if (phone.replace(/\D/g, '').length < 10) return
    setLookup(false)   // mark as loading
    setLookupErr('')
    try {
      const result = await checkPatientByPhone(phone)
      setLookup(result)
      set({ visitType: result.exists ? 'followup' : 'first' })
    } catch {
      // On Firestore error: show brief message but still allow proceeding as new patient
      setLookup({ exists: false })
      setLookupErr('Could not verify number — continuing as new patient.')
      set({ visitType: 'first' })
    }
  }, [set])

  const onPhoneChange = (val: string) => {
    set({ patientPhone: val })
    setLookup(null)       // reset: lookup not run yet
    setLookupErr('')
    clearTimeout(debounceRef.current!)
    if (val.replace(/\D/g, '').length >= 10) {
      debounceRef.current = setTimeout(() => doLookup(val), 600)
    }
  }

  // ── Navigation ────────────────────────────────────────────────────────────

  function goToPatient() {
    if (!continueEnabled) return
    setLookupErr('')
    setStep('patient')
  }

  function goToSchedule() {
    const isExisting = lookup !== null && lookup !== false && (lookup as { exists: boolean }).exists
    if (!isExisting && !form.patientName.trim()) {
      setFormErr('Please enter your full name'); return
    }
    setFormErr('')
    setStep('schedule')
  }

  function goBack(to: Step) { setFormErr(''); setStep(to) }

  // ── Submit ────────────────────────────────────────────────────────────────

  async function handleSubmit() {
    if (!form.preferredDate) { setFormErr('Please select a date'); return }
    if (!form.preferredTime) { setFormErr('Please select a time slot'); return }
    if (!form.reason)        { setFormErr('Please select a reason for your visit'); return }
    setFormErr(''); setSubmitting(true)
    try {
      const isExisting = lookup !== null && lookup !== false && (lookup as { exists: boolean }).exists
      const finalReason = form.reason === 'Other'
        ? (form.customReason.trim() || 'Other') : form.reason

      const payload = {
        patientPhone:  form.patientPhone.trim(),
        patientEmail:  form.patientEmail.trim() || null,
        patientName:   isExisting ? (lookup.firstName ?? 'Patient') : form.patientName.trim(),
        preferredDate: form.preferredDate,
        preferredTime: form.preferredTime,
        reason:        finalReason,
        visitType:     form.visitType,
        doctorId:      form.doctorId   || null,
        doctorName:    form.doctorName || null,
        referredBy:    form.referredBy.trim() || null,
        status:        'pending'  as const,
        paymentStatus: 'unpaid'   as const,
        reports:       [] as string[],
        ...(form.age    ? { age:    Number(form.age) } : {}),
        ...(form.gender ? { gender: form.gender }      : {}),
      }

      const docId = await createAppointment(payload as any)
      setBookingRef(generateBookingRef(docId))
      setStep('success')
    } catch {
      setFormErr('Booking failed. Please try again or call us directly.')
    } finally { setSubmitting(false) }
  }

  // ── Appointments closed ───────────────────────────────────────────────────

  if (!settings.appointmentsOpen) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center px-4 py-20">
        <div className="max-w-lg w-full text-center">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Calendar className="w-8 h-8 text-amber-500" />
          </div>
          <h1 className="text-2xl font-bold text-navy mb-3">Online Booking Temporarily Paused</h1>
          <p className="text-gray-500 leading-relaxed mb-6">
            {settings.appointmentNote || 'Online appointments are temporarily unavailable.'}
          </p>
          {settings.phone && (
            <a href={`tel:${settings.phone}`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-semibold hover:bg-primary/90 transition">
              <Phone className="w-4 h-4" /> Call Us Now
            </a>
          )}
        </div>
      </div>
    )
  }

  // ─── Lookup result helpers ────────────────────────────────────────────────
  const isExistingPatient =
    lookup !== null && lookup !== false && (lookup as { exists: boolean }).exists
  const isNewPatient =
    lookup !== null && lookup !== false && !(lookup as { exists: boolean }).exists

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-bg">

      {/* ── Hero Banner ── */}
      <div className="relative overflow-hidden py-14 md:py-20"
        style={{ background: 'linear-gradient(135deg, #143B7D 0%, #1565D8 60%, #18B55A 100%)' }}>
        <div className="absolute inset-0 pointer-events-none opacity-[0.04]" aria-hidden>
          <svg width="100%" height="100%">
            <defs><pattern id="apptGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M40 0L0 0 0 40" fill="none" stroke="white" strokeWidth="0.5"/>
            </pattern></defs>
            <rect width="100%" height="100%" fill="url(#apptGrid)"/>
          </svg>
        </div>
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/5 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-green/10 blur-3xl pointer-events-none" />

        <div className="container-max px-4 md:px-8 relative z-10 text-center text-white">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-[11px] font-bold uppercase tracking-widest mb-5">
            <Heart className="w-3.5 h-3.5 text-pink-300" fill="currentColor" />
            UpBeat Heart · Cardiology
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold leading-tight tracking-tight mb-4">
            Book Your Appointment
          </h1>
          <p className="text-white/70 text-base md:text-lg max-w-xl mx-auto leading-relaxed">
            Expert cardiac care, just a few clicks away. We&apos;ll confirm your slot within the hour.
          </p>

          {settings.doctorName && (
            <div className="inline-flex items-center gap-3 mt-7 bg-white/10 border border-white/20 rounded-2xl px-5 py-3 backdrop-blur-sm">
              {settings.doctorPhotoUrl ? (
                <Image src={settings.doctorPhotoUrl} alt={settings.doctorName || 'Doctor'}
                  width={40} height={40}
                  className="w-10 h-10 rounded-full object-cover border-2 border-white/40" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Stethoscope className="w-5 h-5 text-white" />
                </div>
              )}
              <div className="text-left">
                <p className="text-sm font-bold text-white">{settings.doctorName}</p>
                <p className="text-xs text-white/60">{settings.doctorTitle} · {settings.hospitalName}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Trust Strip ── */}
      <div className="bg-white border-b border-gray-100">
        <div className="container-max px-4 md:px-8 py-4">
          <div className="flex items-center justify-center gap-6 md:gap-12 flex-wrap text-xs text-gray-500">
            {[
              { icon: Shield,       text: 'Secure & Confidential' },
              { icon: Clock,        text: 'Confirmation within 1 hour' },
              { icon: Heart,        text: 'No login required' },
              { icon: CheckCircle2, text: 'Instant booking reference' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-1.5">
                <Icon className="w-3.5 h-3.5 text-primary" />
                <span className="font-medium">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main Form ── */}
      <div className="container-max px-4 md:px-8 py-12 md:py-16">
        <div className="max-w-2xl mx-auto">

          {step !== 'success' && <StepBar current={step} />}

          {/* ─── STEP: PHONE ──────────────────────────────────────────────── */}
          {step === 'phone' && (
            <div className="bg-white rounded-3xl shadow-card border border-gray-100 p-7 md:p-10">
              <div className="text-center mb-8">
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-7 h-7 text-primary" />
                </div>
                <h2 className="text-xl font-bold text-navy mb-1.5">Enter Your Mobile Number</h2>
                <p className="text-sm text-gray-500">
                  We&apos;ll check if you&apos;ve visited us before so we can make booking faster.
                </p>
              </div>

              <div className="space-y-5">
                {/* Phone input */}
                <div>
                  <FieldLabel required>Mobile Number</FieldLabel>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                      <span className="text-sm font-semibold text-gray-700">🇮🇳 +91</span>
                      <div className="w-px h-5 bg-gray-200" />
                    </div>
                    <input
                      type="tel"
                      value={form.patientPhone}
                      onChange={e => onPhoneChange(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && continueEnabled && goToPatient()}
                      placeholder="98765 43210"
                      maxLength={15}
                      autoFocus
                      className="w-full border border-gray-200 rounded-2xl pl-24 pr-12 py-4 text-base font-semibold tracking-wide focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition"
                    />
                    {/* Spinner while looking up */}
                    {isLookingUp && (
                      <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary animate-spin" />
                    )}
                    {/* Green tick when lookup done & existing */}
                    {isExistingPatient && !isLookingUp && (
                      <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green" />
                    )}
                  </div>

                  {/* Status messages under input */}
                  {isLookingUp && (
                    <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1.5">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Checking your number…
                    </p>
                  )}
                  {lookupErr && <ErrorMsg msg={lookupErr} />}
                </div>

                {/* ── EXISTING patient banner ── */}
                {isExistingPatient && (
                  <div className="flex items-start gap-3 p-4 bg-green/10 border border-green/30 rounded-2xl">
                    <CheckCircle2 className="w-5 h-5 text-green shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-green-800">
                        Welcome back, {(lookup as any).firstName}! 👋
                      </p>
                      <p className="text-xs text-green-700 mt-0.5">
                        You have {(lookup as any).visitCount} previous{' '}
                        {(lookup as any).visitCount === 1 ? 'visit' : 'visits'} with us.
                        Your booking will be registered as a follow-up.
                      </p>
                    </div>
                  </div>
                )}

                {/* ── NEW patient info ── */}
                {isNewPatient && (
                  <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-100 rounded-2xl">
                    <Sparkles className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-blue-800">First visit? Welcome!</p>
                      <p className="text-xs text-blue-600 mt-0.5">
                        We&apos;ll collect a few quick details on the next screen.
                        Our team completes your full profile at the clinic.
                      </p>
                    </div>
                  </div>
                )}

                {/* ── Continue button — disabled until lookup is done ── */}
                <div className="relative group">
                  <button
                    onClick={goToPatient}
                    disabled={!continueEnabled}
                    className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-sm transition mt-2
                      ${continueEnabled
                        ? 'bg-primary text-white hover:bg-primary/90 active:scale-[0.98] shadow-lg shadow-primary/30 cursor-pointer'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}>
                    {isLookingUp
                      ? <><Loader2 className="w-4 h-4 animate-spin" /> Verifying…</>
                      : <>Continue <ArrowRight className="w-4 h-4" /></>
                    }
                  </button>
                  {/* Tooltip when disabled and phone is typed but lookup not done */}
                  {!continueEnabled && phoneDigits.length >= 10 && !isLookingUp && !lookupDone && (
                    <p className="text-xs text-center text-gray-400 mt-2">
                      Verifying your number, please wait…
                    </p>
                  )}
                  {!continueEnabled && phoneDigits.length < 10 && (
                    <p className="text-xs text-center text-gray-400 mt-2">
                      Enter your 10-digit mobile number to continue
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ─── STEP: PATIENT DETAILS ────────────────────────────────────── */}
          {step === 'patient' && (
            <div className="bg-white rounded-3xl shadow-card border border-gray-100 p-7 md:p-10">
              <button onClick={() => goBack('phone')}
                className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition mb-6">
                <ChevronLeft className="w-4 h-4" /> Back
              </button>

              {isExistingPatient ? (
                /* ── RETURNING PATIENT — show first name only, nothing else ── */
                <div className="space-y-6">
                  <div>
                    <div className="w-14 h-14 bg-green/10 rounded-2xl flex items-center justify-center mb-4">
                      <User className="w-7 h-7 text-green" />
                    </div>
                    <h2 className="text-xl font-bold text-navy mb-1.5">Welcome Back!</h2>
                    <p className="text-sm text-gray-500">
                      We recognised your number. Your clinic profile is managed securely by our team —
                      we only need your preferred contact email for this booking.
                    </p>
                  </div>

                  {/* Name display — first name + masked surname, read-only, no form field */}
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-xl font-bold text-primary">
                        {((lookup as any).firstName ?? 'P')[0].toUpperCase()}
                      </span>
                    </div>
                    <div>
                      {/* Show first name only — full name, address, history are NEVER shown */}
                      <p className="font-bold text-gray-900">
                        {(lookup as any).firstName} ···
                      </p>
                      <p className="text-xs text-gray-400">
                        {(lookup as any).visitCount} previous{' '}
                        {(lookup as any).visitCount === 1 ? 'visit' : 'visits'} ·
                        Follow-up appointment
                      </p>
                    </div>
                    <span className="ml-auto text-xs bg-green/10 text-green font-semibold px-2.5 py-1 rounded-full border border-green/20 shrink-0">
                      Returning Patient
                    </span>
                  </div>

                  {/* Privacy notice */}
                  <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl">
                    <div className="flex items-start gap-2">
                      <Shield className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                      <p className="text-xs text-blue-700 leading-relaxed">
                        <strong>Your privacy is protected.</strong> We never display your address,
                        medical history, or previous visit details on this website.
                        Your full profile is accessible only to our medical team.
                      </p>
                    </div>
                  </div>

                  {/* Optional email for confirmation only */}
                  <div>
                    <FieldLabel>Email for confirmation (optional)</FieldLabel>
                    <Input icon={Mail} type="email" value={form.patientEmail}
                      onChange={e => set({ patientEmail: e.target.value })}
                      placeholder="your@email.com" />
                    <p className="text-xs text-gray-400 mt-1.5">Used only to send your booking confirmation</p>
                  </div>

                  {formErr && <ErrorMsg msg={formErr} />}

                  <button onClick={goToSchedule}
                    className="w-full flex items-center justify-center gap-2 py-4 bg-primary text-white rounded-2xl font-bold text-sm hover:bg-primary/90 transition shadow-lg shadow-primary/30">
                    Select Date & Time <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

              ) : (
                /* ── NEW PATIENT — full registration form ── */
                <div className="space-y-6">
                  <div>
                    <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                      <User className="w-7 h-7 text-primary" />
                    </div>
                    <h2 className="text-xl font-bold text-navy mb-1.5">Tell Us About Yourself</h2>
                    <p className="text-sm text-gray-500">
                      Quick details to help us prepare for your first visit.
                      Our team completes your full health profile at the clinic.
                    </p>
                  </div>

                  <div>
                    <FieldLabel required>Full Name</FieldLabel>
                    <Input icon={User} type="text" value={form.patientName}
                      onChange={e => set({ patientName: e.target.value })}
                      placeholder="Your full name" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <FieldLabel>Age</FieldLabel>
                      <Input type="number" value={form.age} min={1} max={120}
                        onChange={e => set({ age: e.target.value })}
                        placeholder="e.g. 52" />
                    </div>
                    <div>
                      <FieldLabel>Email</FieldLabel>
                      <Input icon={Mail} type="email" value={form.patientEmail}
                        onChange={e => set({ patientEmail: e.target.value })}
                        placeholder="Optional" />
                    </div>
                  </div>

                  <div>
                    <FieldLabel>Gender</FieldLabel>
                    <div className="grid grid-cols-3 gap-3">
                      {(['male', 'female', 'other'] as const).map(g => (
                        <button key={g} type="button"
                          onClick={() => set({ gender: g })}
                          className={`py-3 rounded-2xl text-sm font-semibold border-2 transition capitalize
                            ${form.gender === g
                              ? 'border-primary bg-primary/5 text-primary'
                              : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                          {g === 'male' ? '♂ Male' : g === 'female' ? '♀ Female' : '○ Other'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <FieldLabel>Referred By</FieldLabel>
                    <Input type="text" value={form.referredBy}
                      onChange={e => set({ referredBy: e.target.value })}
                      placeholder="e.g. Dr. Arjun Mehta / Self / Online" />
                  </div>

                  {formErr && <ErrorMsg msg={formErr} />}

                  <button onClick={goToSchedule}
                    className="w-full flex items-center justify-center gap-2 py-4 bg-primary text-white rounded-2xl font-bold text-sm hover:bg-primary/90 transition shadow-lg shadow-primary/30">
                    Select Date & Time <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ─── STEP: SCHEDULE ───────────────────────────────────────────── */}
          {step === 'schedule' && (
            <div className="bg-white rounded-3xl shadow-card border border-gray-100 p-7 md:p-10">
              <button onClick={() => goBack('patient')}
                className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition mb-6">
                <ChevronLeft className="w-4 h-4" /> Back
              </button>

              <div className="mb-7">
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                  <Calendar className="w-7 h-7 text-primary" />
                </div>
                <h2 className="text-xl font-bold text-navy mb-1.5">Choose Your Slot</h2>
                <p className="text-sm text-gray-500">
                  Pick your preferred date, time, and tell us your reason for visiting.
                </p>
              </div>

              <div className="space-y-7">

                {/* Doctor selector */}
                {doctors.length > 1 && (
                  <div>
                    <FieldLabel>Select Doctor</FieldLabel>
                    <div className="space-y-2">
                      {doctors.map(doc => (
                        <button key={doc.uid} type="button"
                          onClick={() => set({ doctorId: doc.uid, doctorName: doc.name })}
                          className={`w-full flex items-center gap-3 p-4 rounded-2xl border-2 transition text-left
                            ${form.doctorId === doc.uid
                              ? 'border-primary bg-primary/5'
                              : 'border-gray-200 hover:border-gray-300'}`}>
                          {doc.photoURL ? (
                            <Image src={doc.photoURL} alt={doc.name || 'Doctor'}
                              width={40} height={40}
                              className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <Stethoscope className="w-5 h-5 text-primary" />
                            </div>
                          )}
                          <div>
                            <p className={`font-semibold text-sm ${form.doctorId === doc.uid ? 'text-primary' : 'text-gray-800'}`}>
                              {doc.name}
                            </p>
                            {doc.designation && (
                              <p className="text-xs text-gray-400 mt-0.5">{doc.designation}</p>
                            )}
                          </div>
                          {form.doctorId === doc.uid && (
                            <CheckCircle2 className="w-5 h-5 text-primary ml-auto" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Date */}
                <div>
                  <FieldLabel required>Preferred Date</FieldLabel>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <input type="date"
                      value={form.preferredDate}
                      onChange={e => set({ preferredDate: e.target.value, preferredTime: '' })}
                      min={todayString()} max={maxDateString()}
                      className="w-full border border-gray-200 rounded-2xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition" />
                  </div>
                  {form.preferredDate && (
                    <p className="text-xs text-primary font-medium mt-1.5">
                      📅 {formatDisplayDate(form.preferredDate)}
                    </p>
                  )}
                </div>

                {/* Time slots */}
                {form.preferredDate && (
                  <div>
                    <FieldLabel required>Preferred Time</FieldLabel>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {TIME_SLOTS.map(slot => (
                        <button key={slot} type="button"
                          onClick={() => set({ preferredTime: slot })}
                          className={`py-2.5 px-3 rounded-xl text-xs font-semibold border-2 transition
                            ${form.preferredTime === slot
                              ? 'border-primary bg-primary text-white shadow-md shadow-primary/20'
                              : 'border-gray-200 text-gray-600 hover:border-primary/40 hover:bg-primary/5'}`}>
                          {slot}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      * Final time confirmation will be shared by our clinic team
                    </p>
                  </div>
                )}

                {/* Reason */}
                <div>
                  <FieldLabel required>Reason for Visit</FieldLabel>
                  <div className="flex flex-wrap gap-2">
                    {APPOINTMENT_REASONS.map(r => (
                      <button key={r} type="button"
                        onClick={() => set({ reason: r, customReason: '' })}
                        className={`px-3.5 py-2 rounded-full text-xs font-semibold border transition
                          ${form.reason === r
                            ? 'bg-primary text-white border-primary'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-primary/40 hover:bg-primary/5'}`}>
                        {r}
                      </button>
                    ))}
                  </div>
                  {form.reason === 'Other' && (
                    <div className="mt-3">
                      <Input type="text" value={form.customReason}
                        onChange={e => set({ customReason: e.target.value })}
                        placeholder="Please describe your concern…" />
                    </div>
                  )}
                </div>

                {/* Summary card */}
                {form.preferredDate && form.preferredTime && form.reason && (
                  <div className="bg-gradient-to-br from-primary/5 to-green/5 border border-primary/20 rounded-2xl p-5 space-y-3">
                    <p className="text-xs font-bold text-primary uppercase tracking-wider">Booking Summary</p>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-xs text-gray-400 mb-0.5">Patient</p>
                        <p className="font-semibold text-gray-800">
                          {isExistingPatient ? (lookup as any).firstName : form.patientName || '—'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-0.5">Phone</p>
                        <p className="font-semibold text-gray-800">{form.patientPhone}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-0.5">Date</p>
                        <p className="font-semibold text-gray-800">{formatDisplayDate(form.preferredDate)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-0.5">Time</p>
                        <p className="font-semibold text-gray-800">{form.preferredTime}</p>
                      </div>
                      {form.doctorName && (
                        <div className="col-span-2">
                          <p className="text-xs text-gray-400 mb-0.5">Doctor</p>
                          <p className="font-semibold text-gray-800">{form.doctorName}</p>
                        </div>
                      )}
                      <div className="col-span-2">
                        <p className="text-xs text-gray-400 mb-0.5">Reason</p>
                        <p className="font-semibold text-gray-800">
                          {form.reason === 'Other' ? (form.customReason || 'Other') : form.reason}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-0.5">Visit Type</p>
                        <p className="font-semibold text-gray-800 capitalize">
                          {form.visitType === 'first' ? 'First Consultation' : 'Follow-up Visit'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {formErr && <ErrorMsg msg={formErr} />}

                <button onClick={handleSubmit} disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 py-4 bg-green text-white rounded-2xl font-bold text-sm hover:bg-green/90 active:scale-[0.98] transition disabled:opacity-50 shadow-lg shadow-green/30">
                  {submitting
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Confirming…</>
                    : <><CheckCircle2 className="w-4 h-4" /> Confirm Appointment</>
                  }
                </button>

                <p className="text-xs text-center text-gray-400">
                  By booking, you agree that the clinic team may contact you to confirm your appointment.
                </p>
              </div>
            </div>
          )}

          {/* ─── STEP: SUCCESS ────────────────────────────────────────────── */}
          {step === 'success' && (
            <div className="text-center">
              <div className="relative w-24 h-24 mx-auto mb-6">
                <div className="absolute inset-0 rounded-full bg-green/10 animate-ping" />
                <div className="relative w-24 h-24 rounded-full bg-green flex items-center justify-center shadow-xl shadow-green/30">
                  <CheckCircle2 className="w-12 h-12 text-white" />
                </div>
              </div>

              <h2 className="text-2xl font-extrabold text-navy mb-2">Appointment Requested!</h2>
              <p className="text-gray-500 text-sm mb-7 max-w-md mx-auto">
                Your appointment has been submitted. Our team will call you within 1 hour to confirm your slot.
              </p>

              <div className="bg-white rounded-3xl shadow-card border border-gray-100 p-7 mb-6 text-left max-w-sm mx-auto">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest text-center mb-4">Booking Reference</p>
                <div className="text-center mb-5">
                  <p className="text-3xl font-extrabold text-primary tracking-widest font-mono">{bookingRef}</p>
                  <p className="text-xs text-gray-400 mt-1">Save this for your records</p>
                </div>
                <div className="space-y-2.5 text-sm">
                  {[
                    { label: 'Date',     value: formatDisplayDate(form.preferredDate) },
                    { label: 'Time',     value: form.preferredTime },
                    { label: 'Reason',   value: form.reason === 'Other' ? (form.customReason || 'Other') : form.reason },
                    ...(form.doctorName ? [{ label: 'Doctor', value: form.doctorName }] : []),
                    { label: 'Hospital', value: settings.hospitalName },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between items-start gap-4">
                      <span className="text-gray-400 text-xs shrink-0">{label}</span>
                      <span className="font-semibold text-gray-800 text-xs text-right">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 mb-6 text-left max-w-sm mx-auto">
                <p className="text-xs font-bold text-amber-700 uppercase tracking-wide mb-3">Please remember</p>
                <div className="space-y-2 text-xs text-amber-800">
                  {[
                    'Arrive 10 minutes before your scheduled time',
                    'Bring all previous medical reports & prescriptions',
                    'A valid government ID for new patients',
                    `Call ${settings.phone || 'us'} if you don't hear back within 1 hour`,
                  ].map(item => (
                    <div key={item} className="flex items-start gap-2">
                      <span className="text-amber-500 mt-0.5">•</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 max-w-sm mx-auto">
                {settings.phone && (
                  <a href={`tel:${settings.phone}`}
                    className="flex-1 flex items-center justify-center gap-2 py-3.5 border-2 border-primary text-primary rounded-2xl font-semibold text-sm hover:bg-primary/5 transition">
                    <Phone className="w-4 h-4" /> Call Clinic
                  </a>
                )}
                {settings.whatsapp && (
                  <a href={`https://wa.me/${settings.whatsapp.replace(/\D/g,'')}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-green text-white rounded-2xl font-semibold text-sm hover:bg-green/90 transition">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.556 4.123 1.527 5.858L.057 23.887a.5.5 0 00.609.678l6.214-1.438A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.903 0-3.68-.528-5.2-1.443l-.373-.222-3.868.896.924-3.768-.242-.386A9.958 9.958 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
                    </svg>
                    WhatsApp Us
                  </a>
                )}
              </div>

              <button onClick={() => {
                setStep('phone'); setLookup(null); setBookingRef(''); setLookupErr('')
                setForm(prev => ({
                  ...prev,
                  patientPhone: '', patientEmail: '', patientName: '',
                  age: '', gender: '', preferredDate: '', preferredTime: '',
                  reason: '', customReason: '', referredBy: '', visitType: 'first',
                }))
              }} className="mt-6 text-sm text-gray-400 hover:text-gray-600 transition underline underline-offset-2">
                Book another appointment
              </button>
            </div>
          )}

          {/* ── Bottom info strip (below form) ── */}
          {step !== 'success' && (
            <div className="mt-8 grid grid-cols-1 gap-4">
              {settings.hospitalAddress && (
                <div className="flex items-start gap-3 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                  <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-gray-700 mb-0.5">{settings.hospitalName}</p>
                    <p className="text-xs text-gray-500 leading-relaxed">{settings.hospitalAddress}</p>
                  </div>
                </div>
              )}
              {settings.phone && (
                <a href={`tel:${settings.phone}`}
                  className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:border-primary/30 transition">
                  <Phone className="w-5 h-5 text-green shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-gray-700 mb-0.5">Prefer to call?</p>
                    <p className="text-sm font-semibold text-primary">{settings.phone}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 ml-auto" />
                </a>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
