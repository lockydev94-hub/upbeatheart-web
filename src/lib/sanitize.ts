/**
 * sanitizeForClient(value)
 *
 * Recursively converts any value that is NOT serialisable as plain JSON into
 * a safe equivalent, so the result can be passed from Next.js Server Components
 * to 'use client' Client Components without the
 * "Only plain objects can be passed to Client Components" runtime error.
 *
 * Conversions applied:
 *   Firestore Timestamp  →  ISO 8601 string  (via .toDate().toISOString())
 *   Date instance        →  ISO 8601 string
 *   undefined            →  null
 *   Array                →  recursed element-by-element
 *   Plain object         →  recursed value-by-value
 *   Primitive            →  unchanged
 */
export function sanitizeForClient<T = unknown>(value: unknown): T {
  // null / undefined
  if (value === null) return null as T
  if (value === undefined) return null as T

  // Firestore Timestamp (has a toDate method and _seconds/_nanoseconds)
  if (
    typeof value === 'object' &&
    typeof (value as any).toDate === 'function'
  ) {
    return (value as any).toDate().toISOString() as T
  }

  // Native Date
  if (value instanceof Date) return value.toISOString() as T

  // Array
  if (Array.isArray(value)) {
    return value.map((v) => sanitizeForClient(v)) as T
  }

  // Plain object (not a class instance with exotic prototype)
  if (typeof value === 'object') {
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = sanitizeForClient(v)
    }
    return out as T
  }

  // Primitives: string, number, boolean
  return value as T
}
