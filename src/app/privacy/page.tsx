import { getPrivacy }       from '@/lib/firestore/legal'
import { getSiteSettings }  from '@/lib/firestore/settings'
import LegalPageLayout      from '@/components/legal/LegalPageLayout'
import { Shield }           from 'lucide-react'
import type { Metadata }    from 'next'

export const revalidate = 86400

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSiteSettings()
  return {
    title:       `Privacy Policy | ${s.siteTitle || 'UpBeat Heart'}`,
    description: `Read the UpBeat Heart Privacy Policy. Learn how we collect, use, and protect your personal and medical data.`,
    openGraph:   {
      title:  `Privacy Policy | ${s.siteTitle || 'UpBeat Heart'}`,
      images: s.ogImageUrl ? [{ url: s.ogImageUrl }] : [],
    },
  }
}

export default async function PrivacyPage() {
  const [{ sections, effectiveDate }, settings] = await Promise.all([
    getPrivacy(),
    getSiteSettings(),
  ])

  return (
    <LegalPageLayout
      title="Privacy Policy"
      subtitle="We are committed to protecting your privacy. This policy explains how we collect, use, and safeguard your personal and medical information."
      effectiveDate={effectiveDate}
      sections={sections}
      settings={settings}
      accentColor="text-violet-600"
      heroGradient="linear-gradient(135deg,#2D1B69 0%,#4C1D95 50%,#1565D8 100%)"
      eyebrowIcon={<Shield size={11} />}
      eyebrowLabel="Privacy Policy"
    />
  )
}
