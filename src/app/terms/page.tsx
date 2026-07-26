import { getTerms }         from '@/lib/firestore/legal'
import { getSiteSettings }  from '@/lib/firestore/settings'
import LegalPageLayout      from '@/components/legal/LegalPageLayout'
import { FileText }         from 'lucide-react'
import type { Metadata }    from 'next'

export const revalidate = 86400

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSiteSettings()
  return {
    title:       `Terms of Service | ${s.siteTitle || 'UpBeat Heart'}`,
    description: `Read the UpBeat Heart Terms of Service. Understand your rights and obligations when using our cardiac care platform.`,
    openGraph:   {
      title:  `Terms of Service | ${s.siteTitle || 'UpBeat Heart'}`,
      images: s.ogImageUrl ? [{ url: s.ogImageUrl }] : [],
    },
  }
}

export default async function TermsPage() {
  const [{ sections, effectiveDate }, settings] = await Promise.all([
    getTerms(),
    getSiteSettings(),
  ])

  return (
    <LegalPageLayout
      title="Terms of Service"
      subtitle="By using the UpBeat Heart platform, you agree to these terms. Please read them carefully before using our services."
      effectiveDate={effectiveDate}
      sections={sections}
      settings={settings}
      accentColor="text-emerald-600"
      heroGradient="linear-gradient(135deg,#064E3B 0%,#065F46 50%,#1565D8 100%)"
      eyebrowIcon={<FileText size={11} />}
      eyebrowLabel="Terms of Service"
    />
  )
}
