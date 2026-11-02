import LazyImage from '@/components/ui/LazyImage'
import { cld } from '@/lib/cloudinary'
import { Quote, Play, ExternalLink, BadgeCheck } from 'lucide-react'
import StarRating from './StarRating'
import type { Review } from '@/types/firestore'

interface Props {
  review: Review
  variant?: 'compact' | 'full'
}

function Avatar({ review }: { review: Review }) {
  if (review.photoURL) {
    return (
      <div className="relative w-11 h-11 rounded-full shrink-0 border-2 border-white shadow-md overflow-hidden">
        <LazyImage
          src={cld.avatarSm(review.photoURL)}
          alt={review.patientName}
          revealBlur
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>
    )
  }
  // Colour-coded initials by rating
  const colours = [
    '', // 0 index unused
    'bg-red-100 text-red-600',
    'bg-orange-100 text-orange-600',
    'bg-amber-100 text-amber-700',
    'bg-green-100 text-green-700',
    'bg-emerald-100 text-emerald-700',
  ]
  const cls = colours[Math.min(review.rating, 5)] ?? colours[5]
  return (
    <div className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-extrabold shrink-0 ${cls}`}>
      {review.patientName.charAt(0).toUpperCase()}
    </div>
  )
}

export default function ReviewCard({ review, variant = 'compact' }: Props) {
  const isFull = variant === 'full'

  return (
    <div className="group flex flex-col gap-4 bg-white rounded-2xl border border-[#DCE3EC] p-6 shadow-sm hover:shadow-[0_8px_32px_rgba(21,101,216,0.10)] hover:border-[#1565D8]/20 transition-all duration-300 h-full">

      {/* Top row: quote icon + stars */}
      <div className="flex items-start justify-between">
        <div className="w-9 h-9 rounded-xl bg-[#1565D8]/8 border border-[#1565D8]/12 flex items-center justify-center shrink-0">
          <Quote size={15} className="text-[#1565D8]" />
        </div>
        <StarRating rating={review.rating} size="sm" />
      </div>

      {/* Review text */}
      <p className={`text-[13px] text-[#6B7280] leading-relaxed flex-1 ${isFull ? '' : 'line-clamp-4'}`}>
        &ldquo;{review.text}&rdquo;
      </p>

      {/* Video badge */}
      {review.videoURL && isFull && (
        <a
          href={review.videoURL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-700 bg-purple-50 border border-purple-200 px-3 py-1.5 rounded-lg hover:bg-purple-100 transition w-fit"
        >
          <Play size={12} className="fill-purple-700" /> Watch video testimonial
          <ExternalLink size={11} />
        </a>
      )}

      {/* Patient footer */}
      <div className="flex items-center gap-3 pt-3 border-t border-[#DCE3EC]">
        <Avatar review={review} />
        <div className="min-w-0 flex-1">
          <p className="text-[12px] font-extrabold text-[#143B7D] leading-tight truncate">
            {review.patientName}
          </p>
          <div className="flex items-center gap-1.5 mt-0.5">
            {review.source === 'google' ? (
              <span className="text-[10px] text-[#6B7280] font-medium">⭐ Google Review</span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] text-[#18B55A] font-semibold">
                <BadgeCheck size={10} /> Verified Patient
              </span>
            )}
            {review.videoURL && !isFull && (
              <span className="inline-flex items-center gap-1 text-[10px] text-purple-600 font-semibold">
                · <Play size={9} className="fill-purple-600" /> Video
              </span>
            )}
          </div>
        </div>
        {review.videoURL && !isFull && (
          <a
            href={review.videoURL}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center hover:bg-purple-100 transition opacity-0 group-hover:opacity-100"
          >
            <Play size={12} className="fill-purple-600 text-purple-600" />
          </a>
        )}
      </div>
    </div>
  )
}
