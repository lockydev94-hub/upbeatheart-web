import { Star } from 'lucide-react'

interface Props {
  rating: number
  size?: 'xs' | 'sm' | 'md' | 'lg'
  showValue?: boolean
}

const sizes = { xs: 10, sm: 13, md: 16, lg: 20 }

export default function StarRating({ rating, size = 'sm', showValue }: Props) {
  const px = sizes[size]
  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={px}
            className={i < rating ? 'text-amber-400' : 'text-gray-200'}
            fill={i < rating ? 'currentColor' : 'currentColor'}
          />
        ))}
      </div>
      {showValue && (
        <span className="text-xs font-bold text-amber-600 ml-0.5">{rating}.0</span>
      )}
    </div>
  )
}
