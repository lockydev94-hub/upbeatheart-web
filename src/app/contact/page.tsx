import { getSiteSettings } from '@/lib/firestore/settings'
import { localBusinessSchema, buildMetadata } from '@/lib/seo'
import ContactPageClient from './_ContactPageClient'
import type { Metadata } from 'next'

export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSiteSettings()
  return buildMetadata({
    title:       'Contact Us',
    description: `Get in touch with ${s.doctorName || 'our cardiologist'} at ${s.hospitalName || 'our clinic'}. Book appointments, ask questions, and reach out for cardiac care.`,
    path:        '/contact',
    image:       s.ogImageUrl,
    settings:    s,
    keywords: [
      'contact cardiologist',
      s.doctorName,
      s.hospitalName,
      'book cardiology appointment',
      'cardiac clinic contact',
      'heart doctor appointment India',
    ].filter(Boolean) as string[],
  })
}

export default async function ContactPage() {
  const settings = await getSiteSettings()
  const schema   = localBusinessSchema(settings)
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <ContactPageClient settings={settings} />
    </>
  )
}
