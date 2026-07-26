'use client'

/**
 * SubmitReviewButton
 * ─────────────────
 * Floating action button shown only on /reviews — clicking opens the
 * "Submit Your Review" modal. Handles Cloudinary photo upload client-side
 * then POSTs to /api/review-submit (Admin SDK writes to Firestore as pending).
 *
 * Cloudinary:
 *   Cloud   : NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME  (boc8bvoc)
 *   Preset  : NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET (upbeat_public)
 *   Folder  : upbeatheart/reviews
 */

import { useState, useRef, useCallback, useEffect } from 'react'
import {
  Star, X, Send, CheckCircle, Upload,
  Loader2, ImageIcon, Trash2, AlertCircle, MessageSquare,
} from 'lucide-react'
import LazyImage from '@/components/ui/LazyImage'

const CLOUD_NAME    = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME    ?? 'boc8bvoc'
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? 'upbeat_public'
const PHOTO_FOLDER  = 'upbeatheart/reviews'

/* ── Cloudinary XHR upload ─────────────────────────────────────────────────── */
async function uploadPhoto(
  file: File,
  onProgress: (pct: number) => void,
): Promise<string> {
  const fd = new FormData()
  fd.append('file', file)
  fd.append('upload_preset', UPLOAD_PRESET)
  fd.append('folder', PHOTO_FOLDER)

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`)
    xhr.upload.addEventListener('progress', e => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100))
    })
    xhr.addEventListener('load', () => {
      try {
        const d = JSON.parse(xhr.responseText)
        if (d.error) return reject(new Error(d.error.message))
        resolve(d.secure_url as string)
      } catch { reject(new Error('Parse error')) }
    })
    xhr.addEventListener('error', () => reject(new Error('Network error')))
    xhr.send(fd)
  })
}

/* ── Interactive Star Picker ─────────────────────────────────────────────── */
function StarPicker({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const [hover, setHover] = useState(0)
  const labels = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent']
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5">
        {Array.from({ length: 5 }).map((_, i) => {
          const n = i + 1
          const active = n <= (hover || value)
          return (
            <button
              key={n}
              type="button"
              onMouseEnter={() => setHover(n)}
              onMouseLeave={() => setHover(0)}
              onClick={() => onChange(n)}
              className="focus:outline-none transition-transform hover:scale-110 active:scale-95"
              aria-label={`${n} star${n !== 1 ? 's' : ''}`}
            >
              <Star
                size={32}
                className={`transition-colors duration-100 ${
                  active ? 'text-amber-400' : 'text-gray-200'
                }`}
                fill="currentColor"
              />
            </button>
          )
        })}
        {(hover || value) > 0 && (
          <span className="ml-1 text-sm font-bold text-amber-600 min-w-[70px]">
            {labels[hover || value]}
          </span>
        )}
      </div>
      {value === 0 && (
        <p className="text-[11px] text-red-400">Please select a rating</p>
      )}
    </div>
  )
}

/* ── Photo Upload Widget ─────────────────────────────────────────────────── */
type PhotoState = 'idle' | 'uploading' | 'done' | 'error'

function PhotoUpload({
  value,
  onChange,
}: {
  value: string
  onChange: (url: string) => void
}) {
  const inputRef                      = useRef<HTMLInputElement>(null)
  const [state, setState]             = useState<PhotoState>('idle')
  const [progress, setProgress]       = useState(0)
  const [errMsg, setErrMsg]           = useState('')
  const [dragging, setDragging]       = useState(false)
  const [localPreview, setLocalPreview] = useState<string>('')

  const process = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrMsg('Please upload an image (JPG, PNG, WebP).')
      setState('error')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrMsg('Photo must be under 5 MB.')
      setState('error')
      return
    }
    // local preview immediately
    const reader = new FileReader()
    reader.onload = e => setLocalPreview(e.target?.result as string)
    reader.readAsDataURL(file)

    setState('uploading')
    setProgress(0)
    setErrMsg('')

    try {
      const url = await uploadPhoto(file, setProgress)
      onChange(url)
      setState('done')
    } catch (err: any) {
      setErrMsg(err.message ?? 'Upload failed. Please try again.')
      setState('error')
      setLocalPreview('')
    }
  }, [onChange])

  const remove = () => {
    onChange('')
    setState('idle')
    setProgress(0)
    setErrMsg('')
    setLocalPreview('')
  }

  const preview = value || localPreview

  /* uploaded or previewing */
  if (preview) {
    return (
      <div className="flex items-center gap-3">
        {/* thumbnail */}
        <div className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-primary/20 bg-bg shrink-0">
          <LazyImage src={preview} alt="Your photo" rootMargin="0px" className="absolute inset-0 w-full h-full object-cover" />
          {state === 'uploading' && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <Loader2 size={16} className="text-white animate-spin" />
            </div>
          )}
          {state === 'done' && (
            <div className="absolute bottom-0 inset-x-0 bg-green/90 text-white text-[8px] font-bold text-center py-0.5">
              ✓ Saved
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          {state === 'uploading' ? (
            <>
              <p className="text-xs font-semibold text-primary">Uploading… {progress}%</p>
              <div className="mt-1 w-full bg-primary/10 rounded-full h-1.5">
                <div
                  className="bg-primary h-1.5 rounded-full transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </>
          ) : (
            <>
              <p className="text-xs font-semibold text-green flex items-center gap-1">
                <CheckCircle size={11} /> Photo uploaded
              </p>
              <button
                type="button"
                onClick={remove}
                className="mt-1 flex items-center gap-1 text-[11px] text-red-400 hover:underline"
              >
                <Trash2 size={10} /> Remove
              </button>
            </>
          )}
        </div>
      </div>
    )
  }

  /* drop zone */
  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => { if (e.target.files?.[0]) process(e.target.files[0]); e.target.value = '' }}
      />
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => {
          e.preventDefault(); setDragging(false)
          if (e.dataTransfer.files?.[0]) process(e.dataTransfer.files[0])
        }}
        onClick={() => inputRef.current?.click()}
        className={`flex items-center gap-3 border-2 border-dashed rounded-xl px-4 py-3 cursor-pointer transition-all ${
          dragging
            ? 'border-primary/60 bg-primary/6'
            : 'border-[#DCE3EC] hover:border-primary/40 hover:bg-primary/3'
        }`}
      >
        <div className="w-9 h-9 rounded-xl bg-primary/8 flex items-center justify-center shrink-0">
          <ImageIcon size={16} className="text-primary" />
        </div>
        <div>
          <p className="text-xs font-semibold text-[#1F2937]">
            Add a photo <span className="font-normal text-[#6B7280]">(optional)</span>
          </p>
          <p className="text-[11px] text-[#6B7280] mt-0.5">
            Drop or <span className="text-primary">browse</span> · JPG/PNG · max 5 MB
          </p>
        </div>
      </div>

      {state === 'error' && errMsg && (
        <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-1.5">
          <AlertCircle size={11} className="shrink-0" /> {errMsg}
        </div>
      )}
    </div>
  )
}

/* ── Review Submission Modal ─────────────────────────────────────────────── */
const BLANK = { patientName: '', rating: 0, text: '', photoURL: '' }

function ReviewModal({ onClose }: { onClose: () => void }) {
  const [form, setForm]         = useState(BLANK)
  const [submitting, setSub]    = useState(false)
  const [success, setSuccess]   = useState(false)
  const [error, setError]       = useState('')

  /* lock scroll while open */
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  /* Escape key closes */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const set = <K extends keyof typeof BLANK>(k: K, v: typeof BLANK[K]) =>
    setForm(p => ({ ...p, [k]: v }))

  async function handleSubmit() {
    if (!form.patientName.trim()) { setError('Please enter your name.'); return }
    if (form.rating === 0)        { setError('Please select a star rating.'); return }
    if (!form.text.trim())        { setError('Please write a short review.'); return }
    if (form.text.trim().length < 10) { setError('Review is too short — please write at least 10 characters.'); return }

    setSub(true)
    setError('')
    try {
      const res = await fetch('/api/review-submit', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          patientName: form.patientName.trim(),
          rating:      form.rating,
          text:        form.text.trim(),
          photoURL:    form.photoURL || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Submission failed')
      setSuccess(true)
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong. Please try again.')
    } finally {
      setSub(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[300] flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: 'rgba(10,20,50,0.65)', backdropFilter: 'blur(6px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[92dvh]">

        {/* Mobile drag handle */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden shrink-0">
          <div className="w-10 h-1 rounded-full bg-gray-200" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#DCE3EC] shrink-0">
          <div>
            <h2 className="text-base font-extrabold text-[#143B7D]">Share Your Experience</h2>
            <p className="text-[11px] text-[#6B7280] mt-0.5">
              Your review will be published after our team reviews it
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F8FAFC] hover:bg-[#DCE3EC] flex items-center justify-center transition text-[#6B7280]"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        {success ? (
          <div className="flex flex-col items-center justify-center py-14 px-8 text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-green-50 border border-green-100 flex items-center justify-center">
              <CheckCircle size={32} className="text-[#18B55A]" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-[#143B7D]">Thank You!</h3>
              <p className="text-[#6B7280] text-sm mt-2 max-w-xs">
                Your review has been submitted and will appear on this page after our team approves it — usually within 1–2 days.
              </p>
            </div>
            <button
              onClick={onClose}
              className="mt-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white"
              style={{ background: 'linear-gradient(90deg,#1565D8,#18B8E6)' }}
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">

              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-1.5">
                  Your Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.patientName}
                  onChange={e => set('patientName', e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full border border-[#DCE3EC] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1565D8]/30 bg-white text-[#1F2937] placeholder:text-[#6B7280]"
                />
              </div>

              {/* Star Rating */}
              <div>
                <label className="block text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-2">
                  Your Rating <span className="text-red-400">*</span>
                </label>
                <StarPicker value={form.rating} onChange={n => set('rating', n)} />
              </div>

              {/* Review Text */}
              <div>
                <label className="block text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-1.5">
                  Your Review <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={form.text}
                  onChange={e => set('text', e.target.value)}
                  placeholder="Share your experience with the doctor and the care you received…"
                  rows={4}
                  className="w-full border border-[#DCE3EC] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1565D8]/30 bg-white resize-none text-[#1F2937] placeholder:text-[#6B7280]"
                />
                <p className="text-[10px] text-[#6B7280] mt-1 text-right">
                  {form.text.length} chars
                </p>
              </div>

              {/* Photo upload */}
              <div>
                <label className="block text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-2">
                  Your Photo <span className="font-normal normal-case">(optional)</span>
                </label>
                <PhotoUpload value={form.photoURL} onChange={url => set('photoURL', url)} />
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
                  <AlertCircle size={14} className="shrink-0 mt-0.5" /> {error}
                </div>
              )}

              {/* Disclaimer */}
              <p className="text-[11px] text-[#6B7280] leading-relaxed">
                By submitting, you consent to your name and review being published on this website after moderation.
                We never share contact details publicly.
              </p>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-[#DCE3EC] bg-[#F8FAFC]/60 rounded-b-3xl shrink-0 flex gap-3">
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 py-3 rounded-xl text-sm font-extrabold text-white flex items-center justify-center gap-2 transition disabled:opacity-60 shadow-lg"
                style={{ background: 'linear-gradient(90deg,#1565D8,#18B8E6)' }}
              >
                {submitting
                  ? <><Loader2 size={15} className="animate-spin" /> Submitting…</>
                  : <><Send size={14} /> Submit Review</>
                }
              </button>
              <button
                onClick={onClose}
                className="px-4 py-3 border border-[#DCE3EC] text-[#6B7280] rounded-xl text-sm hover:bg-[#F8FAFC] transition"
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

/* ── Float Button (exported — rendered inside Server Component page) ───────── */
export default function SubmitReviewButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Floating action button — bottom-right corner */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-[200] flex items-center gap-2 pl-4 pr-5 py-3.5 rounded-full text-white text-sm font-bold shadow-[0_8px_32px_rgba(21,101,216,0.4)] hover:shadow-[0_12px_40px_rgba(21,101,216,0.55)] hover:scale-105 active:scale-95 transition-all duration-200"
        style={{ background: 'linear-gradient(135deg,#1565D8,#18B8E6)' }}
        aria-label="Write a review"
      >
        <MessageSquare size={18} className="fill-white/20" />
        Write a Review
        <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#18B55A] border-2 border-white animate-pulse" />
      </button>

      {/* Modal */}
      {open && <ReviewModal onClose={() => setOpen(false)} />}
    </>
  )
}
