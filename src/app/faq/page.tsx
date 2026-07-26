import { getFAQ }           from '@/lib/firestore/legal'
import { getSiteSettings }  from '@/lib/firestore/settings'
import FAQPageClient         from './_FAQPageClient'
import type { Metadata }     from 'next'
import { faqSchema, buildMetadata } from '@/lib/seo'

export const revalidate = 60  // settings data — busted by revalidateTag("settings")

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSiteSettings()
  return buildMetadata({
    title:       'Frequently Asked Questions',
    description: `Frequently asked questions about appointments, donations, patient assistance campaigns, and cardiac care at ${s.hospitalName || 'UpBeat Heart'}.`,
    path:        '/faq',
    image:       s.ogImageUrl,
    settings:    s,
    keywords: ['cardiology FAQ', 'heart doctor FAQ', 'appointment FAQ', 'patient assistance FAQ', 'cardiac care questions'],
  })
}

export default async function FAQPage() {
  const [items, settings] = await Promise.all([getFAQ(), getSiteSettings()])

  // Build FAQPage schema from all FAQ items
  const allFaqs = items.map((item: any) => ({ q: item.question, a: item.answer }))
  const schema  = allFaqs.length ? faqSchema(allFaqs) : null

  return (
    <>
      {schema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      )}
      <FAQPageClient items={items} settings={settings} />
    </>
  )
}
