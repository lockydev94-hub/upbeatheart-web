/**
 * donations.ts — website-side Firestore queries for donations
 *
 * Only fetches admin-approved (showOnWebsite=true) donations for public display.
 * Returns donor names ONLY — no contact details ever exposed.
 *
 * Note: we intentionally do NOT filter by status so UPI/bank/cheque donations
 * (which arrive as status:'created' until admin verifies) still appear once
 * the admin flips showOnWebsite=true.
 */
import { getAdminDb } from '@/lib/firebase-admin'
import { sanitizeForClient } from '@/lib/sanitize'

export interface PublicDonor {
  id:         string
  donorName:  string    // 'Anonymous' if anonymous=true
  amount?:    number    // only if showAmountPublic=true
  createdAt:  string    // ISO string
  monthLabel: string    // 'July 2026'
}

/** Used by sidebar — flat list of last N approved donors */
export async function getPublicDonors(limit = 15): Promise<PublicDonor[]> {
  try {
    const db   = getAdminDb()
    const snap = await db
      .collection('donations')
      .where('showOnWebsite', '==', true)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get()

    const MONTH_NAMES = [
      'January','February','March','April','May','June',
      'July','August','September','October','November','December',
    ]

    return snap.docs.map(d => {
      const raw        = sanitizeForClient(d.data()) as Record<string, unknown>
      const isAnon     = !!raw.anonymous
      const name       = isAnon ? 'Anonymous' : String(raw.donorName || 'Anonymous')
      const amount     = Number(raw.amount || 0)
      const showAmt    = !!(raw.showAmountPublic as boolean)
      const createdAt  = String(raw.createdAt || '')
      const dt         = new Date(createdAt)
      const monthLabel = !isNaN(dt.getTime())
        ? `${MONTH_NAMES[dt.getMonth()]} ${dt.getFullYear()}`
        : ''
      return {
        id:        d.id,
        donorName: name,
        amount:    showAmt ? amount : undefined,
        createdAt,
        monthLabel,
      }
    })
  } catch (err: any) {
    console.error('[getPublicDonors] Firestore query failed:', err?.message ?? err)
    return []
  }
}

/* ── Legacy monthly grouping (kept for compatibility) ── */
export interface MonthlyDonors {
  monthKey:   string
  monthLabel: string
  donors:     PublicDonor[]
  total:      number
  count:      number
}

export async function getPublicDonorsByMonth(limitMonths = 12): Promise<MonthlyDonors[]> {
  try {
    const db   = getAdminDb()
    const snap = await db
      .collection('donations')
      .where('showOnWebsite', '==', true)
      .orderBy('createdAt', 'desc')
      .get()

    const MONTH_NAMES = [
      'January','February','March','April','May','June',
      'July','August','September','October','November','December',
    ]
    const toLabel = (key: string) => {
      const [y, m] = key.split('-')
      return `${MONTH_NAMES[parseInt(m, 10) - 1]} ${y}`
    }

    const raw: Record<string, unknown>[] = snap.docs.map(d => {
      const data = sanitizeForClient(d.data()) as Record<string, unknown>
      return { id: d.id, ...data }
    })

    const map = new Map<string, MonthlyDonors>()
    for (const r of raw) {
      const createdAt = r.createdAt as string | undefined
      if (!createdAt) continue
      const dt = new Date(createdAt)
      if (isNaN(dt.getTime())) continue
      const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`
      if (!map.has(key)) {
        map.set(key, { monthKey: key, monthLabel: toLabel(key), donors: [], total: 0, count: 0 })
      }
      const group  = map.get(key)!
      const isAnon = !!r.anonymous
      const name   = isAnon ? 'Anonymous' : String(r.donorName || 'Anonymous')
      const amount = Number(r.amount || 0)
      const showAmt = !!(r.showAmountPublic as boolean)
      group.donors.push({
        id: r.id as string, donorName: name,
        amount: showAmt ? amount : undefined,
        createdAt, monthLabel: toLabel(key),
      })
      group.total += amount
      group.count += 1
    }
    return Array.from(map.values())
      .sort((a, b) => b.monthKey.localeCompare(a.monthKey))
      .slice(0, limitMonths)
  } catch (err: any) {
    console.error('[getPublicDonorsByMonth] Firestore query failed:', err?.message ?? err)
    return []
  }
}
