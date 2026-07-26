import type { Metadata } from 'next'
import { getApprovedNGOs } from '@/lib/firestore/ngos'
import { getSiteSettings } from '@/lib/firestore/settings'
import NGOPageClient       from '@/components/ngo/NGOPageClient'

export const revalidate = 60  // settings data — busted by revalidateTag("settings")

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()
  const siteName = settings?.siteTitle ?? 'UpBeat Heart'
  return {
    title:       `NGO Partners | ${siteName}`,
    description: 'Our trusted non-profit partners bringing cardiac care to communities through health camps, awareness drives, and patient assistance programmes.',
    openGraph: {
      title:       'NGO Partners — UpBeat Heart',
      description: 'Together with our NGO partners we bring cardiac care to communities that need it most.',
      type:        'website',
    },
  }
}

export default async function NGOPage() {
  const [ngos, settings] = await Promise.all([
    getApprovedNGOs(),
    getSiteSettings(),
  ])

  return <NGOPageClient ngos={ngos} settings={settings} />
}
