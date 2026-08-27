import { getAdminDb } from '@/lib/firebase-admin'
import { sanitizeForClient } from '@/lib/sanitize'
import type { FAQItem, LegalSection } from '@/types/firestore'

interface LegalDoc { sections: LegalSection[]; effectiveDate: string }

export async function getFAQ(): Promise<FAQItem[]> {
  try {
    const db = getAdminDb()
    const snap = await db.collection('legal').doc('faq').get()
    if (!snap.exists) return []
    const items = sanitizeForClient<FAQItem[]>(snap.data()?.items || [])
    return items.sort((a, b) => a.order - b.order)
  } catch { return [] }
}

export async function getPrivacy(): Promise<LegalDoc> {
  return getLegalDoc('privacy')
}

export async function getTerms(): Promise<LegalDoc> {
  return getLegalDoc('terms')
}

async function getLegalDoc(docId: string): Promise<LegalDoc> {
  try {
    const db = getAdminDb()
    const snap = await db.collection('legal').doc(docId).get()
    if (!snap.exists) return { sections: [], effectiveDate: '' }
    // Sanitize so Timestamps/dates can never break server→client serialization
    return sanitizeForClient<LegalDoc>(snap.data())
  } catch { return { sections: [], effectiveDate: '' } }
}
