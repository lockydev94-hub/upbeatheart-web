import { getAdminDb } from '@/lib/firebase-admin'
import { sanitizeForClient } from '@/lib/sanitize'
import type { FAQItem, LegalSection } from '@/types/firestore'

export async function getFAQ(): Promise<FAQItem[]> {
  try {
    const db = getAdminDb()
    const snap = await db.collection('legal').doc('faq').get()
    if (!snap.exists) return []
    const items = (snap.data()?.items || []) as FAQItem[]
    return items.sort((a, b) => a.order - b.order)
  } catch { return [] }
}

export async function getPrivacy(): Promise<{ sections: LegalSection[]; effectiveDate: string }> {
  try {
    const db = getAdminDb()
    const snap = await db.collection('legal').doc('privacy').get()
    if (!snap.exists) return { sections: [], effectiveDate: '' }
    return snap.data() as any
  } catch { return { sections: [], effectiveDate: '' } }
}

export async function getTerms(): Promise<{ sections: LegalSection[]; effectiveDate: string }> {
  try {
    const db = getAdminDb()
    const snap = await db.collection('legal').doc('terms').get()
    if (!snap.exists) return { sections: [], effectiveDate: '' }
    return snap.data() as any
  } catch { return { sections: [], effectiveDate: '' } }
}
