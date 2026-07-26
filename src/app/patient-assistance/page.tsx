import type { Metadata } from 'next'
import { getPublishedCampaigns } from '@/lib/firestore/campaigns'
import { getSiteSettings }      from '@/lib/firestore/settings'
import PatientAssistanceClient  from '@/components/campaigns/PatientAssistanceClient'

export const revalidate = 120

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()
  const siteName = settings?.siteTitle ?? 'UpBeat Heart'
  return {
    title:       `Patient Assistance Campaigns | ${siteName}`,
    description: 'Support verified cardiac patients in need. Every donation is 100% transparent and doctor-verified. Help change a life today.',
    openGraph: {
      title:       'Patient Assistance — Help Change a Life',
      description: 'Doctor-verified crowdfunding campaigns for cardiac patients who cannot afford life-saving treatment.',
      type:        'website',
    },
  }
}

export default async function PatientAssistancePage() {
  const [campaigns, settings] = await Promise.all([
    getPublishedCampaigns(50),
    getSiteSettings(),
  ])

  return <PatientAssistanceClient campaigns={campaigns} settings={settings} />
}
