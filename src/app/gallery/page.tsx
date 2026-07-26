import { Metadata }            from 'next'
import { getAllPublishedGallery } from '@/lib/firestore/gallery'
import { getSiteSettings }       from '@/lib/firestore/settings'
import GalleryClient             from '@/components/gallery/GalleryClient'

export const revalidate = 1800

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSiteSettings()
  return {
    title:       `Gallery | ${s?.siteTitle ?? 'UpBeat Heart'}`,
    description: `Photos and videos from ${s?.doctorName ?? 'our'} clinic, health camps, community outreach, and award ceremonies.`,
    alternates:  { canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/gallery` },
    openGraph: {
      title:       `Gallery | ${s?.siteTitle ?? 'UpBeat Heart'}`,
      description: 'A visual story of our cardiac care journey.',
      images:      s?.ogImageUrl ? [s.ogImageUrl] : [],
    },
  }
}

export default async function GalleryPage() {
  const [items, settings] = await Promise.all([
    getAllPublishedGallery(),
    getSiteSettings(),
  ])
  return <GalleryClient items={items} settings={settings} />
}
