'use client'
import { db } from '@/lib/firebase-client'
import { doc, updateDoc, addDoc, collection, increment, serverTimestamp } from 'firebase/firestore'

function getOrCreateSessionId(): string {
  const key = 'ubh_session'
  let id = sessionStorage.getItem(key)
  if (!id) { id = Math.random().toString(36).slice(2); sessionStorage.setItem(key, id) }
  return id
}

function detectSource(): string {
  const ref = document.referrer
  if (!ref) return 'direct'
  if (ref.includes('google') || ref.includes('bing')) return 'google'
  if (ref.includes('facebook') || ref.includes('instagram')) return 'social'
  return 'referral'
}

function detectDevice(): string {
  const ua = navigator.userAgent
  if (/tablet|ipad/i.test(ua)) return 'tablet'
  if (/mobile|android|iphone/i.test(ua)) return 'mobile'
  return 'desktop'
}

export async function trackDiseaseVisit(diseaseId: string) {
  const startTime = Date.now()
  try {
    // Increment top-level counter atomically
    await updateDoc(doc(db, 'diseases', diseaseId), {
      visitCount: increment(1),
      lastVisitedAt: serverTimestamp(),
    })
    // Write detailed visit record
    const visitRef = await addDoc(collection(db, 'diseases', diseaseId, 'visits'), {
      sessionId:   getOrCreateSessionId(),
      visitedAt:   serverTimestamp(),
      source:      detectSource(),
      deviceType:  detectDevice(),
      readTimeSec: 0,
      scrollDepth: 0,
      cameFrom:    document.referrer || 'direct',
    })
    // Track scroll depth
    let maxScroll = 0
    const onScroll = () => {
      const pct = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100)
      if (pct > maxScroll) maxScroll = pct
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    // Finalize on unload
    window.addEventListener('beforeunload', async () => {
      window.removeEventListener('scroll', onScroll)
      const readTime = Math.round((Date.now() - startTime) / 1000)
      await updateDoc(visitRef, { readTimeSec: readTime, scrollDepth: maxScroll })
    })
  } catch { /* silent fail — analytics shouldn't break pages */ }
}
