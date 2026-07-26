/**
 * /donate — Full donation page
 */
import type { Metadata } from 'next'
import { getSiteSettings } from '@/lib/firestore/settings'
import { getPublicDonors } from '@/lib/firestore/donations'
import DonatePageClient from './_DonatePageClient'

export const revalidate = 60

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSiteSettings()
  return {
    title:       `Donate | ${s.siteTitle}`,
    description: 'Support cardiac patients who cannot afford treatment. Donate via Razorpay, UPI, Bank Transfer, or Cheque.',
  }
}

export default async function DonatePage() {
  const [settings, donors] = await Promise.all([
    getSiteSettings(),
    getPublicDonors(15),
  ])
  return <DonatePageClient settings={settings} donors={donors} />
}
