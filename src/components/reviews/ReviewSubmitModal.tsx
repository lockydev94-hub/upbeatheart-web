'use client'

import { useState, useRef, useCallback } from 'react'
import { Star, X, Upload, Loader2, CheckCircle2, MessageSquarePlus, Camera } from 'lucide-react'
import LazyImage from '@/components/ui/LazyImage'

// ── Cloudinary unsigned upload ─────────────────────────────────────────────
const CLOUD_NAME   = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME  ?? ''
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? 'upbeat_public'

async function uploadToCloudinary(file: File): Promise<string> {
  const fd = new FormData()
  fd.append('file', file)
  fd.append('upload_preset', UPLOAD_PRESET)
  fd.append('folder', 'upbeatheart/reviews')
  const res  = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: 'POST',
    body:   fd,
  })
  if (!res.ok) throw new Error('Image upload failed')
  const data = await res.json()
  return data.secure_url as string
}

// ── Interactive star picker ────────────────────────────────────────────────
function StarPicker({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const [hovered, setHovered] = useState(0)
  const labels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent']
  const active  = hovered || value

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map(n => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            onMouseEnter={() => setHovered(n)}
            onMouseLeave={() => setHovered(0)}
            className="focus:outline-none transition-transform hover:scale-110 active:scale-95"
            aria-label={`Rate ${n} star${n > 1 ? 's' : ''}`}
          >
            <Star
              size={32}
              className={n <= active ? 'text-amber-400' : 'text-gray-200'}
              fill={n <= active ? 'currentColor' : 'currentColor'}
            />
          </button>
        ))}
      </div>
      <span className="text-xs font-semibold text-[#6B7280] h-4">
        {active > 0 ? labels[active] : 'Tap to rate'}
      </span>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────
export default function ReviewSubmitModal() {
  const [open,          setOpen]          = useState(false)
  const [patientName,   setPatientName]   = useState('')
  const [rating,        setRating]        = useState(0)
  const [text,          setText]          = useState('')
  const [photoFile,     setPhotoFile]     = useState<File | null>(null)
  const [photoPreview,  setPhotoPreview]  = useState<string | null>(null)
  const [uploading,     setUploading]     = useState(false)
  const [submitting,    setSubmitting]    = useState(false)
  const [success,       setSuccess]       = useState(false)
  const [error,         setError]         = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const handlePhoto = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { setError('Photo must be under 5 MB'); return }
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
    setError(null)
  }, [])

  const reset = useCallback(() => {
    setPatientName(''); setRating(0); setText('')
    setPhotoFile(null); setPhotoPreview(null)
    setError(null); setSuccess(false)
    setUploading(false); setSubmitting(false)
  }, [])

  const handleClose = () => { setOpen(false); reset() }

  const handleSubmit = async () => {
    // ── client-side validation ──
    if (!patientName.trim()) { setError('Please enter your name'); return }
    if (rating === 0)         { setError('Please select a rating'); return }
    if (text.trim().length < 10) { setError('Please write at least 10 characters'); return }

    setError(null)

    try {
      let photoURL: string | null = null

      // optional photo upload
      if (photoFile) {
        setUploading(true)
        photoURL = await uploadToCloudinary(photoFile)
        setUploading(false)
      }

      setSubmitting(true)
      const res = await fetch('/api/review-submit', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ patientName: patientName.trim(), rating, text: text.trim(), photoURL }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Submission failed')

      setSuccess(true)
    } catch (err) {
      setUploading(false)
      setSubmitting(false)
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    }
  }

  const busy = uploading || submitting

  return (
    <>
      {/* ── Float Button (only renders on /reviews page via page.tsx) ── */}
      <button
        onClick={() => setOpen(true)}
        className="
          fixed top-1/2 -translate-y-1/2 right-0 z-50
          flex items-center gap-2
          px-3 py-3 rounded-l-2xl rounded-r-none
          bg-gradient-to-r from-[#1565D8] to-[#18B8E6]
          text-white text-sm font-bold
          shadow-[0_4px_24px_rgba(21,101,216,0.45)]
          hover:shadow-[0_6px_28px_rgba(21,101,216,0.6)]
          hover:scale-105 active:scale-95
          transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-[#1565D8]/50
        "
        aria-label="Write a review"
      >
        <span className="[writing-mode:vertical-rl] text-[11px] font-bold tracking-widest rotate-180 leading-none">Review</span>
        <MessageSquarePlus size={16} />
      </button>

      {/* ── Backdrop ─────────────────────────────────────────────────── */}
      {open && (
        <div
          className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={(e) => { if (e.target === e.currentTarget) handleClose() }}
        >
          {/* ── Modal card ───────────────────────────────────────────── */}
          <div className="
            w-full sm:max-w-lg
            bg-white rounded-t-3xl sm:rounded-3xl
            shadow-2xl overflow-hidden
            animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200
          ">

            {/* Header */}
            <div className="relative bg-gradient-to-r from-[#143B7D] via-[#1565D8] to-[#18B8E6] px-6 py-5">
              <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full bg-white/5 pointer-events-none" />
              <div className="flex items-center justify-between relative">
                <div>
                  <h2 className="text-lg font-extrabold text-white">Share Your Experience</h2>
                  <p className="text-white/70 text-xs mt-0.5">Your story helps other patients</p>
                </div>
                <button
                  onClick={handleClose}
                  className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center text-white hover:bg-white/25 transition-colors focus:outline-none"
                  aria-label="Close"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="px-6 py-6 space-y-5 max-h-[70vh] overflow-y-auto">

              {/* ── Success state ── */}
              {success ? (
                <div className="py-8 text-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-[#18B55A]/10 border border-[#18B55A]/20 flex items-center justify-center mx-auto">
                    <CheckCircle2 size={32} className="text-[#18B55A]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-[#143B7D]">Thank You!</h3>
                    <p className="text-sm text-[#6B7280] mt-1 leading-relaxed">
                      Your review has been submitted and is awaiting approval.<br />
                      It will appear on this page once our team publishes it.
                    </p>
                  </div>
                  <button
                    onClick={handleClose}
                    className="mt-2 px-6 py-2.5 rounded-xl bg-[#1565D8] text-white text-sm font-semibold hover:bg-[#143B7D] transition-colors"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <>
                  {/* Name */}
                  <div>
                    <label className="block text-xs font-bold text-[#143B7D] mb-1.5">
                      Your Name <span className="text-[#DC2626]">*</span>
                    </label>
                    <input
                      type="text"
                      value={patientName}
                      onChange={e => setPatientName(e.target.value)}
                      placeholder="e.g. Ramesh Kumar"
                      maxLength={80}
                      disabled={busy}
                      className="
                        w-full px-4 py-2.5 rounded-xl border border-[#DCE3EC]
                        text-sm text-[#1F2937] placeholder:text-[#6B7280]/50
                        focus:outline-none focus:ring-2 focus:ring-[#1565D8]/30 focus:border-[#1565D8]
                        disabled:opacity-50 transition-all
                      "
                    />
                  </div>

                  {/* Rating */}
                  <div>
                    <label className="block text-xs font-bold text-[#143B7D] mb-2">
                      Rating <span className="text-[#DC2626]">*</span>
                    </label>
                    <StarPicker value={rating} onChange={setRating} />
                  </div>

                  {/* Review text */}
                  <div>
                    <label className="block text-xs font-bold text-[#143B7D] mb-1.5">
                      Your Review <span className="text-[#DC2626]">*</span>
                    </label>
                    <textarea
                      value={text}
                      onChange={e => setText(e.target.value)}
                      placeholder="Share your experience with our cardiac care team..."
                      rows={4}
                      maxLength={1000}
                      disabled={busy}
                      className="
                        w-full px-4 py-2.5 rounded-xl border border-[#DCE3EC]
                        text-sm text-[#1F2937] placeholder:text-[#6B7280]/50
                        focus:outline-none focus:ring-2 focus:ring-[#1565D8]/30 focus:border-[#1565D8]
                        disabled:opacity-50 resize-none transition-all
                      "
                    />
                    <p className="text-[10px] text-[#6B7280] text-right mt-1">{text.length}/1000</p>
                  </div>

                  {/* Photo upload (optional) */}
                  <div>
                    <label className="block text-xs font-bold text-[#143B7D] mb-1.5">
                      Profile Photo <span className="text-[#6B7280] font-normal">(optional)</span>
                    </label>

                    {photoPreview ? (
                      <div className="flex items-center gap-3">
                        <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-[#DCE3EC] shrink-0">
                          <LazyImage
                            src={photoPreview}
                            alt="Preview"
                            rootMargin="0px"
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-medium text-[#1F2937] truncate">{photoFile?.name}</p>
                          <button
                            type="button"
                            onClick={() => { setPhotoFile(null); setPhotoPreview(null) }}
                            disabled={busy}
                            className="text-xs text-[#DC2626] hover:underline mt-0.5 disabled:opacity-50"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => fileRef.current?.click()}
                        disabled={busy}
                        className="
                          w-full flex items-center justify-center gap-2
                          px-4 py-3 rounded-xl border-2 border-dashed border-[#DCE3EC]
                          text-xs text-[#6B7280] font-medium
                          hover:border-[#1565D8] hover:text-[#1565D8] hover:bg-[#F8FAFC]
                          disabled:opacity-50 transition-all
                        "
                      >
                        <Camera size={15} />
                        Upload a photo (JPG / PNG, max 5 MB)
                      </button>
                    )}

                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={handlePhoto}
                    />
                  </div>

                  {/* Error */}
                  {error && (
                    <p className="text-xs text-[#DC2626] bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">
                      {error}
                    </p>
                  )}

                  {/* Note */}
                  <p className="text-[10px] text-[#6B7280] leading-relaxed bg-[#F8FAFC] border border-[#DCE3EC] rounded-xl px-4 py-2.5">
                    Your review will be reviewed by our team before publishing. We publish only genuine patient experiences.
                  </p>
                </>
              )}
            </div>

            {/* Footer (hidden on success) */}
            {!success && (
              <div className="px-6 pb-6">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={busy}
                  className="
                    w-full flex items-center justify-center gap-2
                    px-6 py-3 rounded-xl
                    bg-gradient-to-r from-[#1565D8] to-[#18B8E6]
                    text-white text-sm font-bold
                    hover:from-[#143B7D] hover:to-[#1565D8]
                    disabled:opacity-60 disabled:cursor-not-allowed
                    transition-all shadow-md hover:shadow-lg
                    focus:outline-none focus:ring-2 focus:ring-[#1565D8]/50
                  "
                >
                  {uploading ? (
                    <><Loader2 size={16} className="animate-spin" /> Uploading photo…</>
                  ) : submitting ? (
                    <><Loader2 size={16} className="animate-spin" /> Submitting…</>
                  ) : (
                    <>
                      <Upload size={16} /> Submit Review
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
