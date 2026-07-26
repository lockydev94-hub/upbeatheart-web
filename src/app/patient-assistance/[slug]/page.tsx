import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getCampaignBySlug, getPublishedCampaigns } from '@/lib/firestore/campaigns'
import { getSiteSettings }                          from '@/lib/firestore/settings'
import CampaignDetailContent                        from '@/components/campaigns/CampaignDetailContent'
import { campaignSchema, breadcrumbSchema }         from '@/lib/seo'

export const revalidate = 60

export async function generateStaticParams() {
  const campaigns = await getPublishedCampaigns(50)
  // Prefer slug; fall back to id for campaigns without a slug
  return campaigns.map(c => ({ slug: c.slug || c.id }))
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const [campaign, settings] = await Promise.all([
    getCampaignBySlug(params.slug),
    getSiteSettings(),
  ])
  if (!campaign) return { title: 'Campaign Not Found' }
  const siteName    = settings?.siteTitle ?? 'UpBeat Heart'
  const firstName   = campaign.patientName?.split(' ')[0] ?? 'Patient'
  const canonical   = `${process.env.NEXT_PUBLIC_SITE_URL}/patient-assistance/${campaign.slug || campaign.id}`
  return {
    title:       `Help ${firstName} — ${campaign.diagnosis} | ${siteName}`,
    description: `Support ${firstName}'s treatment for ${campaign.diagnosis}. Doctor-verified campaign. ₹${(campaign.amountRaised ?? 0).toLocaleString('en-IN')} raised of ₹${(campaign.estimatedCost ?? 0).toLocaleString('en-IN')}.`,
    alternates:  { canonical },
    openGraph: {
      title:       `Help ${firstName} fight ${campaign.diagnosis}`,
      description: campaign.patientStory?.replace(/<[^>]*>/g, '').slice(0, 160) ?? '',
      images:      campaign.photos?.[0] ? [{ url: campaign.photos[0] }] : [],
      url:         canonical,
      type:        'website',
    },
  }
}

export default async function CampaignDetailPage({ params }: { params: { slug: string } }) {
  const [campaign, settings, all] = await Promise.all([
    getCampaignBySlug(params.slug),
    getSiteSettings(),
    getPublishedCampaigns(6),
  ])
  if (!campaign) notFound()

  const related = all
    .filter(c => c.id !== campaign.id && ['active', 'published'].includes(c.status))
    .slice(0, 3)

  const slug        = campaign.slug || campaign.id
  const firstName   = campaign.patientName?.split(' ')[0] ?? 'Patient'
  const SITE_URL    = process.env.NEXT_PUBLIC_SITE_URL || 'https://upbeatheart.com'

  const campaignLd = campaignSchema({
    patientName:    campaign.patientName,
    diagnosis:      campaign.diagnosis,
    story:          campaign.patientStory?.replace(/<[^>]*>/g, '') ?? '',
    goal:           campaign.estimatedCost ?? 0,
    raised:         campaign.amountRaised ?? 0,
    slug,
    photo:          campaign.photos?.[0],
    doctorVerified: campaign.doctorVerified ?? false,
    hospitalName:   campaign.hospital ?? settings?.hospitalName ?? 'UpBeat Heart',
  })

  const breadcrumbLd = breadcrumbSchema([
    { name: 'Home',              url: `${SITE_URL}/` },
    { name: 'Patient Assistance', url: `${SITE_URL}/patient-assistance` },
    { name: `Help ${firstName}`,  url: `${SITE_URL}/patient-assistance/${slug}` },
  ])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(campaignLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <CampaignDetailContent campaign={campaign} settings={settings} related={related} />
    </>
  )
}
