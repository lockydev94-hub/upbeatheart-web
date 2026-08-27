'use client'

/**
 * UpBeat Heart — AI Virtual Assistant Chatbot Widget
 *
 * Features:
 * - Premium floating chat button (bottom-right)
 * - Menu-driven navigation: Appointments, Diseases, Blogs, Contact, About
 * - Free-text query: smart-matches against diseases + blogs fetched from /api/chatbot/search
 * - Appointment flow → links to /appointment
 * - Contact info pulled from SiteSettings passed as props
 * - Professional medical branding using UpBeat Heart design tokens
 */

import { useState, useRef, useEffect, useCallback } from 'react'

/* ─── Helpers ───────────────────────────────────────── */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

/* ─── NLU — Intent Detection ────────────────────────── */

/** Levenshtein distance for typo tolerance */
function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (__, j) => (i === 0 ? j : j === 0 ? i : 0))
  )
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i-1] === b[j-1]
        ? dp[i-1][j-1]
        : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1])
  return dp[m][n]
}

/** Return true if word fuzzy-matches any keyword (edit distance ≤ threshold) */
function fuzzyMatch(word: string, keywords: string[], threshold = 2): boolean {
  if (word.length <= 3) threshold = 0          // short words must match exactly
  return keywords.some(kw => {
    if (word.includes(kw) || kw.includes(word)) return true
    return levenshtein(word, kw) <= threshold
  })
}

type Intent =
  | 'appointment'
  | 'diseases'
  | 'blogs'
  | 'contact'
  | 'about'
  | 'assistance'
  | 'greeting'
  | 'thanks'
  | 'none'

interface IntentMatch {
  intent: Intent
  confidence: number   // 0–1
  suggestCorrection?: string   // e.g. "book appointment"
}

const INTENT_KEYWORDS: Record<Intent, string[]> = {
  appointment: [
    'appointment', 'apointment', 'appoinment', 'appointement', 'appt', 'apoint',
    'book', 'booking', 'bookng', 'bookin', 'schedule', 'schedual', 'schedul',
    'consult', 'consultation', 'visit', 'meet', 'meeting', 'checkup', 'check up',
    'see doctor', 'see the doctor', 'reserve', 'slot', 'timing', 'time slot',
    'fix appointment', 'make appointment', 'get appointment',
  ],
  diseases: [
    'disease', 'diseases', 'diseas', 'deasease', 'desease',
    'condition', 'conditions', 'illness', 'illnes', 'ilness',
    'heart', 'cardiac', 'cardio', 'cardiology',
    'treatment', 'treatments', 'treatement', 'symptom', 'symptoms', 'sympotm',
    'diagnosis', 'diagnose', 'problem', 'disorder', 'syndrome',
    'coronary', 'artery', 'failure', 'hypertension', 'angina', 'valve',
    'arrhythmia', 'cholesterol', 'bypass', 'stent', 'ecg', 'echo',
  ],
  blogs: [
    'blog', 'blogs', 'blg', 'article', 'articles', 'articl',
    'read', 'reading', 'post', 'posts', 'news', 'health tips', 'tips',
    'education', 'educate', 'learn', 'information', 'info', 'guide', 'guides',
    'awareness', 'advice', 'content', 'latest',
  ],
  contact: [
    'contact', 'contct', 'contac', 'contacts',
    'phone', 'phon', 'number', 'call', 'calling',
    'address', 'adress', 'location', 'locaton', 'locate', 'directions', 'direction',
    'email', 'mail', 'whatsapp', 'watsapp', 'watsp', 'message',
    'hours', 'timing', 'timings', 'open', 'clinic', 'clinc',
    'hospital', 'hosptal', 'where', 'find', 'reach', 'map',
  ],
  about: [
    'about', 'abot', 'abut',
    'doctor', 'docter', 'dr', 'doc', 'physician',
    'profile', 'bio', 'qualification', 'qualifications', 'degree',
    'experience', 'experiance', 'expert', 'specialist', 'specialisation',
    'who', 'cardiologist', 'cardologist',
  ],
  assistance: [
    'assistance', 'assistanc', 'assist',
    'donation', 'donat', 'donate', 'donating',
    'fund', 'funding', 'financial', 'finanical',
    'help', 'support', 'poor', 'afford', 'campaign', 'campagn',
    'ngo', 'charity', 'charit', 'patient assistance',
    'money', 'cost', 'fee', 'fees', 'free treatment',
  ],
  greeting: [
    'hi', 'hello', 'helo', 'hey', 'hii', 'hiii', 'heya', 'howdy',
    'good morning', 'good afternoon', 'good evening', 'greetings',
    'namaste', 'namaskar', 'sup', 'yo',
  ],
  thanks: [
    'thanks', 'thank', 'thank you', 'thankyou', 'thnks', 'thnx', 'thx',
    'ty', 'tysm', 'great', 'awesome', 'ok', 'okay', 'okk', 'fine',
    'got it', 'understood', 'perfect', 'nice', 'good', 'cool',
    'bye', 'goodbye', 'see you', 'cya', 'later',
  ],
  none: [],
}

const INTENT_DISPLAY: Record<Intent, string> = {
  appointment: 'Book Appointment',
  diseases:    'Heart Diseases',
  blogs:       'Health Blogs',
  contact:     'Contact & Location',
  about:       'About the Doctor',
  assistance:  'Patient Assistance',
  greeting:    'greeting',
  thanks:      'thanks',
  none:        'none',
}

/**
 * Detect intent from free-text input.
 * Returns top intent + confidence.
 * If confidence is moderate (0.4–0.7) and a correction exists, suggestCorrection is set.
 */
function detectIntent(raw: string): IntentMatch {
  const text = raw.toLowerCase().trim()
  const words = text.split(/\s+/).filter(Boolean)

  const scores: Partial<Record<Intent, number>> = {}

  for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS) as [Intent, string[]][]) {
    if (intent === 'none') continue
    let score = 0
    for (const word of words) {
      if (fuzzyMatch(word, keywords)) score += 1
      // Exact phrase bonus
      if (keywords.some(kw => text.includes(kw))) score += 0.5
    }
    if (score > 0) scores[intent] = score
  }

  if (Object.keys(scores).length === 0) return { intent: 'none', confidence: 0 }

  // Pick highest-scoring intent
  const sorted = (Object.entries(scores) as [Intent, number][]).sort((a, b) => b[1] - a[1])
  const [topIntent, topScore] = sorted[0]

  const maxPossible = words.length + 0.5
  const confidence  = Math.min(topScore / maxPossible, 1)

  // Suggest a correction label when fuzzy-matched but user clearly had a typo
  let suggestCorrection: string | undefined
  const hasExactWord = words.some(w =>
    INTENT_KEYWORDS[topIntent].some(kw => kw === w || text.includes(kw))
  )
  if (!hasExactWord && confidence > 0.3) {
    suggestCorrection = INTENT_DISPLAY[topIntent]
  }

  return { intent: topIntent, confidence, suggestCorrection }
}

/* ─── Types ─────────────────────────────────────────── */
interface Message {
  id: string
  from: 'bot' | 'user'
  type: 'text' | 'options' | 'cards' | 'contact'
  text?: string
  options?: Option[]
  cards?: Card[]
  contact?: ContactInfo
}

interface Option { label: string; value: string; icon?: string }
interface Card   { title: string; excerpt: string; url: string; type: 'blog' | 'disease' }
interface ContactInfo { phone: string; whatsapp: string; email: string; address: string; hours: string }

interface ChatWidgetProps {
  phone:     string
  whatsapp:  string
  email:     string
  address:   string
  clinicHours: Array<{ day: string; open: string; close: string; closed: boolean }>
  appointmentsOpen: boolean
  doctorName?:   string
  hospitalName?: string
}

/* ─── Helpers ────────────────────────────────────────── */
const uid = () => Math.random().toString(36).slice(2)

const MAIN_MENU: Option[] = [
  { label: '📅 Book Appointment',    value: 'appointment' },
  { label: '🫀 Heart Diseases',       value: 'diseases'    },
  { label: '📖 Health Blogs',         value: 'blogs'       },
  { label: '📞 Contact & Location',   value: 'contact'     },
  { label: '👨‍⚕️ About the Doctor',    value: 'about'       },
  { label: '💰 Patient Assistance',   value: 'assistance'  },
]

/* ─── Component ──────────────────────────────────────── */
export default function ChatWidget({ phone, whatsapp, email, address, clinicHours, appointmentsOpen, doctorName, hospitalName }: ChatWidgetProps) {
  const [open, setOpen]       = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput]     = useState('')
  const [loading, setLoading] = useState(false)
  const [launched, setLaunched] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef  = useRef<HTMLInputElement>(null)

  /* scroll to bottom on new messages */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  /* focus input when opened */
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 300)
      if (!launched) {
        setLaunched(true)
        greet()
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  /* ── Helpers to push messages ── */
  const pushBot = useCallback((msg: Omit<Message, 'id' | 'from'>) => {
    setMessages(prev => [...prev, { id: uid(), from: 'bot', ...msg }])
  }, [])

  const pushUser = useCallback((text: string) => {
    setMessages(prev => [...prev, { id: uid(), from: 'user', type: 'text', text }])
  }, [])

  /* ── Greeting ── */
  function greet() {
    pushBot({
      type: 'text',
      text: '👋 Hello! I\'m the **UpBeat Heart** virtual assistant.\n\nI can help you with appointments, heart health information, blogs, and more. How can I assist you today?',
    })
    setTimeout(() => {
      pushBot({ type: 'options', text: 'Please choose an option or type your question below:', options: MAIN_MENU })
    }, 600)
  }

  /* ── Format clinic hours for display ── */
  function formatHours() {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' })
    return clinicHours.map(h => {
      const isToday = h.day === today
      const row = h.closed ? `${h.day}: Closed` : `${h.day}: ${h.open} – ${h.close}`
      return isToday ? `**${row} ← Today**` : row
    }).join('\n')
  }

  /* ── Handle menu option selection ── */
  async function handleOption(value: string, label: string) {
    pushUser(label)
    setLoading(true)

    await delay(400)

    switch (value) {
      case 'appointment':
        if (appointmentsOpen) {
          pushBot({
            type: 'text',
            text: '📅 **Book an Appointment**\n\nYou can book your appointment online. Our smart system will detect if you\'re a returning patient and pre-fill your details.',
          })
          await delay(300)
          pushBot({
            type: 'options',
            text: '👇 Tap below to open the booking form:',
            options: [
              { label: '📋 Open Appointment Form', value: '__link:/appointment' },
              { label: '🏠 Back to Main Menu',     value: '__menu'             },
            ],
          })
        } else {
          pushBot({
            type: 'text',
            text: `📅 **Appointments temporarily unavailable.**\n\nPlease contact us directly:\n📞 ${phone}\n\nOur team will schedule your appointment.`,
          })
          await delay(300)
          pushBot({ type: 'options', text: 'Anything else?', options: [{ label: '🏠 Main Menu', value: '__menu' }] })
        }
        break

      case 'diseases':
        setLoading(true)
        try {
          const res  = await fetch('/api/chatbot/search?type=diseases&limit=8')
          const data = await res.json() as { results: Array<{ title: string; excerpt: string; slug: string }> }
          if (data.results.length) {
            pushBot({ type: 'text', text: '🫀 **Heart Diseases & Conditions**\n\nHere are the conditions our cardiologist specialises in:' })
            await delay(300)
            pushBot({
              type: 'cards',
              cards: data.results.map(r => ({
                title:   stripHtml(r.title || ''),
                excerpt: stripHtml(r.excerpt || '') || 'Learn about symptoms, causes, diagnosis, and treatment.',
                url:     `/diseases/${r.slug}`,
                type:    'disease',
              })),
            })
          } else {
            pushBot({ type: 'text', text: '🫀 Visit our Diseases section for detailed information on heart conditions, symptoms, and treatments.' })
            pushBot({ type: 'options', text: '', options: [{ label: '🔗 Browse All Diseases', value: '__link:/diseases' }, { label: '🏠 Main Menu', value: '__menu' }] })
          }
        } catch { pushBot({ type: 'text', text: 'Could not load diseases right now. Please visit /diseases directly.' }) }
        await delay(300)
        pushBot({ type: 'options', text: 'Anything else?', options: [{ label: '🏠 Main Menu', value: '__menu' }, { label: '📅 Book Appointment', value: 'appointment' }] })
        break

      case 'blogs':
        setLoading(true)
        try {
          const res  = await fetch('/api/chatbot/search?type=blogs&limit=6')
          const data = await res.json() as { results: Array<{ title: string; excerpt: string; slug: string }> }
          if (data.results.length) {
            pushBot({ type: 'text', text: '📖 **Latest Heart Health Articles**\n\nExpert articles written and approved by our cardiologist:' })
            await delay(300)
            pushBot({
              type: 'cards',
              cards: data.results.map(r => ({
                title:   stripHtml(r.title || ''),
                excerpt: stripHtml(r.excerpt || '') || 'Read this health article.',
                url:     `/blogs/${r.slug}`,
                type:    'blog',
              })),
            })
          } else {
            pushBot({ type: 'text', text: '📖 Visit our Blogs section for expert heart health articles.' })
            pushBot({ type: 'options', text: '', options: [{ label: '🔗 Browse All Blogs', value: '__link:/blogs' }, { label: '🏠 Main Menu', value: '__menu' }] })
          }
        } catch { pushBot({ type: 'text', text: 'Could not load blogs right now. Please visit /blogs.' }) }
        await delay(300)
        pushBot({ type: 'options', text: 'Anything else?', options: [{ label: '🏠 Main Menu', value: '__menu' }] })
        break

      case 'contact':
        pushBot({
          type: 'contact',
          contact: {
            phone,
            whatsapp,
            email,
            address,
            hours: formatHours(),
          },
        })
        await delay(300)
        pushBot({ type: 'options', text: 'Anything else?', options: [{ label: '📅 Book Appointment', value: 'appointment' }, { label: '🏠 Main Menu', value: '__menu' }] })
        break

      case 'about':
        pushBot({
          type: 'text',
          text: `👨‍⚕️ **About Our Cardiologist**\n\nOur consultant cardiologist is a highly experienced cardiac specialist${hospitalName ? ` associated with ${hospitalName}` : ''}${doctorName ? `: **${doctorName}**` : ''}.\n\nSpecialisations include interventional cardiology, heart failure management, echocardiography, and preventive cardiology.`,
        })
        await delay(300)
        pushBot({
          type: 'options',
          text: '',
          options: [
            { label: '🔗 Read Full Profile', value: '__link:/about' },
            { label: '📅 Book Appointment',  value: 'appointment'   },
            { label: '🏠 Main Menu',          value: '__menu'        },
          ],
        })
        break

      case 'assistance':
        pushBot({
          type: 'text',
          text: '💰 **Patient Assistance Program**\n\nUpBeat Heart connects financially disadvantaged patients with individuals, NGOs, and corporate donors.\n\nEvery campaign is verified by our doctor and linked to a specific treatment.',
        })
        await delay(300)
        pushBot({
          type: 'options',
          text: '',
          options: [
            { label: '🔗 View Campaigns', value: '__link:/patient-assistance' },
            { label: '🏠 Main Menu',       value: '__menu'                     },
          ],
        })
        break

      case '__menu':
        pushBot({ type: 'options', text: 'How can I help you?', options: MAIN_MENU })
        break

      default:
        if (value.startsWith('__link:')) {
          window.location.href = value.replace('__link:', '')
        } else if (value.startsWith('__search:')) {
          // User chose "Search instead" after typo correction prompt
          const q = value.replace('__search:', '')
          setLoading(false)
          await handleQuery(q)
          return
        }
        break
    }

    setLoading(false)
  }

  /* ── Handle free-text query ── */
  async function handleQuery(query: string) {
    if (!query.trim()) return
    const trimmed = query.trim()
    pushUser(trimmed)
    setInput('')
    setLoading(true)

    await delay(350)

    // ── Step 1: Intent detection (NLU) ──
    const { intent, confidence, suggestCorrection } = detectIntent(trimmed)

    // ── Step 2: High-confidence intent → route directly ──
    if (confidence >= 0.35 && intent !== 'none') {

      if (intent === 'greeting') {
        pushBot({ type: 'text', text: `👋 Hello! Great to hear from you. How can I help you today?` })
        await delay(300)
        pushBot({ type: 'options', text: 'Choose an option or type your question:', options: MAIN_MENU })
        setLoading(false)
        return
      }

      if (intent === 'thanks') {
        pushBot({ type: 'text', text: `😊 You're welcome! Feel free to ask me anything about heart health, appointments, or our services.` })
        await delay(300)
        pushBot({ type: 'options', text: 'Anything else?', options: MAIN_MENU })
        setLoading(false)
        return
      }

      // Typo correction: show a confirm chip before routing
      if (suggestCorrection) {
        pushBot({
          type: 'text',
          text: `Did you mean **${suggestCorrection}**?`,
        })
        await delay(200)
        pushBot({
          type: 'options',
          text: '',
          options: [
            { label: `✅ Yes — ${suggestCorrection}`, value: intent },
            { label: '🔍 Search instead',             value: `__search:${trimmed}` },
            { label: '🏠 Main Menu',                  value: '__menu' },
          ],
        })
        setLoading(false)
        return
      }

      // Exact / clean match → route to handler directly
      setLoading(false)
      await handleOption(intent, INTENT_DISPLAY[intent])
      return
    }

    // ── Step 3: Low confidence → Firestore search ──
    try {
      const res  = await fetch(`/api/chatbot/search?q=${encodeURIComponent(trimmed)}&limit=5`)
      const data = await res.json() as { results: Array<{ title: string; excerpt: string; slug: string; type: 'disease' | 'blog' }> }

      if (data.results.length) {
        pushBot({ type: 'text', text: `🔍 I found **${data.results.length}** result${data.results.length > 1 ? 's' : ''} matching your query:` })
        await delay(300)
        pushBot({
          type: 'cards',
          cards: data.results.map(r => ({
            title:   stripHtml(r.title || ''),
            excerpt: stripHtml(r.excerpt || ''),
            url:     r.type === 'disease' ? `/diseases/${r.slug}` : `/blogs/${r.slug}`,
            type:    r.type,
          })),
        })
        await delay(300)
        pushBot({ type: 'options', text: 'Is there anything else I can help you with?', options: MAIN_MENU })
      } else {
        // Nothing found — offer menu options as suggestions
        pushBot({
          type: 'text',
          text: `I couldn't find results for **"${trimmed}"**. Here are some things I can help you with:`,
        })
        await delay(200)
        pushBot({ type: 'options', text: '', options: MAIN_MENU })
      }
    } catch {
      pushBot({ type: 'text', text: 'Sorry, something went wrong. Please try again or contact us directly.' })
      pushBot({ type: 'options', text: '', options: MAIN_MENU })
    }

    setLoading(false)
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') handleQuery(input)
  }

  /* ─── Render ──────────────────────────────────────── */
  return (
    <>
      {/* ── Chat toggle button ── */}
      <button
        onClick={() => setOpen(o => !o)}
        aria-label={open ? 'Close chat' : 'Open virtual assistant'}
        className="chat-fab"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9999,
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #1565D8 0%, #18B8E6 100%)',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 24px rgba(21, 101, 216, 0.45)',
          transition: 'transform 200ms ease, box-shadow 200ms ease',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.1)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 32px rgba(21,101,216,0.55)' }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';   (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 24px rgba(21,101,216,0.45)' }}
      >
        {open
          ? <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          : <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              <path d="M8 10h8M8 13h5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
        }
        {/* pulse ring */}
        {!open && (
          <span style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            background: 'rgba(21,101,216,0.3)',
            animation: 'chatPulse 2s ease-out infinite',
          }} />
        )}
      </button>

      {/* ── Chat window ── */}
      {open && (
        <div
          style={{
            position: 'fixed',
            bottom: '96px',
            right: '16px',
            width: 'min(380px, calc(100vw - 32px))',
            height: 'min(580px, calc(100vh - 120px))',
            background: '#ffffff',
            borderRadius: '20px',
            boxShadow: '0 24px 80px rgba(21,101,216,0.18), 0 4px 16px rgba(0,0,0,0.08)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            zIndex: 9998,
            animation: 'chatSlideUp 250ms cubic-bezier(0.34,1.56,0.64,1)',
            fontFamily: 'var(--font-jakarta, "Plus Jakarta Sans", Inter, system-ui, sans-serif)',
          }}
        >
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #143B7D 0%, #1565D8 60%, #18B8E6 100%)',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            flexShrink: 0,
          }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '50%',
              background: 'rgba(255,255,255,0.18)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                <path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z"/>
              </svg>
            </div>
            <div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: '15px', lineHeight: 1.2 }}>UpBeat Heart</div>
              <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#57D66E', display: 'inline-block' }} />
                Virtual Assistant · Online
              </div>
            </div>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            background: '#F8FAFC',
          }}>
            {messages.map(msg => (
              <MessageBubble key={msg.id} msg={msg} onOption={handleOption} />
            ))}
            {loading && <TypingIndicator />}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{
            padding: '12px 16px',
            borderTop: '1px solid #DCE3EC',
            background: '#fff',
            display: 'flex',
            gap: '8px',
            flexShrink: 0,
          }}>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Ask about heart health, diseases, appointments…"
              style={{
                flex: 1,
                border: '1.5px solid #DCE3EC',
                borderRadius: '12px',
                padding: '10px 14px',
                fontSize: '13px',
                outline: 'none',
                color: '#1F2937',
                background: '#F8FAFC',
                transition: 'border-color 200ms',
              }}
              onFocus={e  => { e.target.style.borderColor = '#1565D8' }}
              onBlur={e   => { e.target.style.borderColor = '#DCE3EC' }}
            />
            <button
              onClick={() => handleQuery(input)}
              disabled={!input.trim() || loading}
              style={{
                width: '40px', height: '40px', borderRadius: '12px',
                background: input.trim() && !loading ? '#1565D8' : '#DCE3EC',
                border: 'none', cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, transition: 'background 200ms',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
              </svg>
            </button>
          </div>

          {/* Footer */}
          <div style={{ padding: '6px 16px 10px', textAlign: 'center', fontSize: '11px', color: '#6B7280', background: '#fff' }}>
            Powered by UpBeat Heart · <span style={{ color: '#1565D8' }}>Not medical advice</span>
          </div>
        </div>
      )}

      {/* Global keyframe styles */}
      <style>{`
        @keyframes chatPulse {
          0%   { transform: scale(1);   opacity: 0.6; }
          100% { transform: scale(2.2); opacity: 0; }
        }
        @keyframes chatSlideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
        @keyframes typingDot {
          0%, 80%, 100% { transform: translateY(0);    opacity: 0.4; }
          40%            { transform: translateY(-5px); opacity: 1;   }
        }
      `}</style>
    </>
  )
}

/* ─── Sub-components ─────────────────────────────────── */

function MessageBubble({ msg, onOption }: { msg: Message; onOption: (v: string, l: string) => void }) {
  const isBot = msg.from === 'bot'

  if (msg.type === 'options') {
    return (
      <div>
        {msg.text && <BotText text={msg.text} />}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
          {(msg.options || []).map(opt => (
            <button
              key={opt.value}
              onClick={() => onOption(opt.value, opt.label)}
              style={{
                padding: '7px 14px',
                borderRadius: '20px',
                border: '1.5px solid #1565D8',
                background: '#fff',
                color: '#1565D8',
                fontSize: '12.5px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 150ms',
                lineHeight: 1.3,
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#1565D8'; (e.currentTarget as HTMLButtonElement).style.color = '#fff' }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#fff';    (e.currentTarget as HTMLButtonElement).style.color = '#1565D8' }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    )
  }

  if (msg.type === 'cards') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {(msg.cards || []).map((card, i) => (
          <a
            key={i}
            href={card.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: '#fff',
              border: '1.5px solid #DCE3EC',
              borderRadius: '12px',
              padding: '12px',
              textDecoration: 'none',
              display: 'block',
              transition: 'border-color 200ms, box-shadow 200ms',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = '#1565D8'; (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 2px 12px rgba(21,101,216,0.12)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = '#DCE3EC'; (e.currentTarget as HTMLAnchorElement).style.boxShadow = 'none' }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <span style={{
                fontSize: '16px', lineHeight: 1,
                background: card.type === 'disease' ? '#EFF6FF' : '#F0FDF4',
                width: '32px', height: '32px', borderRadius: '8px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                {card.type === 'disease' ? '🫀' : '📖'}
              </span>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#143B7D', lineHeight: 1.3 }}>{card.title}</div>
                <div style={{ fontSize: '11.5px', color: '#6B7280', marginTop: '3px', lineHeight: 1.4,
                              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {card.excerpt}
                </div>
              </div>
            </div>
            <div style={{ marginTop: '8px', fontSize: '11px', color: '#1565D8', fontWeight: 600, textAlign: 'right' }}>
              Read more →
            </div>
          </a>
        ))}
      </div>
    )
  }

  if (msg.type === 'contact') {
    const c = msg.contact!
    return (
      <div style={{ background: '#fff', border: '1.5px solid #DCE3EC', borderRadius: '14px', padding: '14px', fontSize: '12.5px', color: '#1F2937' }}>
        <div style={{ fontWeight: 700, color: '#143B7D', marginBottom: '10px', fontSize: '13px' }}>📍 Contact Information</div>
        {c.phone    && <ContactRow icon="📞" label="Phone"    value={c.phone}   href={`tel:${c.phone}`} />}
        {c.whatsapp && <ContactRow icon="💬" label="WhatsApp" value="Chat on WhatsApp" href={`https://wa.me/${c.whatsapp.replace(/\D/g,'')}`} />}
        {c.email    && <ContactRow icon="✉️" label="Email"    value={c.email}   href={`mailto:${c.email}`} />}
        {c.address  && <ContactRow icon="🏥" label="Address"  value={c.address} />}
        {c.hours && (
          <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #DCE3EC' }}>
            <div style={{ fontWeight: 600, color: '#143B7D', marginBottom: '6px', fontSize: '12px' }}>🕐 Clinic Hours</div>
            {c.hours.split('\n').map((line, i) => (
              <div key={i} style={{ fontSize: '11.5px', color: line.startsWith('**') ? '#1565D8' : '#6B7280', fontWeight: line.startsWith('**') ? 700 : 400, marginBottom: '2px' }}>
                {line.replace(/\*\*/g, '')}
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  /* plain text */
  return isBot
    ? <BotText text={msg.text || ''} />
    : (
      <div style={{ alignSelf: 'flex-end', maxWidth: '80%',
                    background: 'linear-gradient(135deg, #1565D8, #18B8E6)',
                    color: '#fff', borderRadius: '16px 16px 4px 16px',
                    padding: '10px 14px', fontSize: '13px', lineHeight: 1.5 }}>
          {msg.text}
        </div>
    )
}

function BotText({ text }: { text: string }) {
  /* simple bold renderer */
  const parts = text.split(/\*\*(.*?)\*\*/g)
  return (
    <div style={{ alignSelf: 'flex-start', maxWidth: '90%',
                  background: '#fff', border: '1px solid #DCE3EC',
                  borderRadius: '4px 16px 16px 16px',
                  padding: '10px 14px', fontSize: '13px', lineHeight: 1.6, color: '#1F2937',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
      {parts.map((p, i) => i % 2 === 1 ? <strong key={i}>{p}</strong> : <span key={i} style={{ whiteSpace: 'pre-line' }}>{p}</span>)}
    </div>
  )
}

function ContactRow({ icon, label, value, href }: { icon: string; label: string; value: string; href?: string }) {
  return (
    <div style={{ display: 'flex', gap: '8px', marginBottom: '6px', alignItems: 'flex-start' }}>
      <span>{icon}</span>
      <div>
        <span style={{ color: '#6B7280', fontSize: '11px' }}>{label}: </span>
        {href
          ? <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: '#1565D8', fontWeight: 600, textDecoration: 'none' }}>{value}</a>
          : <span style={{ fontWeight: 500 }}>{value}</span>
        }
      </div>
    </div>
  )
}

function TypingIndicator() {
  return (
    <div style={{ alignSelf: 'flex-start', background: '#fff', border: '1px solid #DCE3EC',
                  borderRadius: '4px 16px 16px 16px', padding: '12px 16px',
                  display: 'flex', gap: '4px', alignItems: 'center',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
      {[0, 0.2, 0.4].map((delay, i) => (
        <span key={i} style={{
          width: '7px', height: '7px', borderRadius: '50%', background: '#18B8E6',
          animation: `typingDot 1.2s ease-in-out ${delay}s infinite`,
          display: 'inline-block',
        }} />
      ))}
    </div>
  )
}

function delay(ms: number) {
  return new Promise(r => setTimeout(r, ms))
}
