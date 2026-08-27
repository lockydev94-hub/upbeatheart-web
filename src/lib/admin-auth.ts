/**
 * admin-auth.ts — verify Firebase ID tokens on website API routes
 *
 * The admin dashboard sends `Authorization: Bearer <Firebase ID token>`
 * instead of a shared secret. We verify the token server-side and require
 * an admin (or doctor, for read-only ops) role in Firestore users/{uid}.
 */
import { getAuth } from 'firebase-admin/auth'
import { getAdminApp, getAdminDb } from '@/lib/firebase-admin'

export interface VerifiedUser {
  uid:  string
  role: string
}

export async function verifyAdminToken(authHeader: string | null): Promise<VerifiedUser | null> {
  if (!authHeader?.startsWith('Bearer ')) return null
  const token = authHeader.slice(7).trim()
  if (!token) return null

  try {
    const decoded = await getAuth(getAdminApp()).verifyIdToken(token)
    const snap    = await getAdminDb().collection('users').doc(decoded.uid).get()
    const role    = snap.exists ? (snap.data()?.role as string | undefined) : undefined
    if (!role) return null
    return { uid: decoded.uid, role }
  } catch {
    return null
  }
}

/** True only for role 'admin' (Cloudinary admin ops, revalidation). */
export function isAdminRole(v: VerifiedUser | null): boolean {
  return v?.role === 'admin'
}