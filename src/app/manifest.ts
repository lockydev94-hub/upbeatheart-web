/**
 * /manifest.webmanifest — PWA manifest.
 *
 * Built from Settings so the installed-app name and icon follow the branding
 * the admin sets, instead of drifting from a checked-in JSON file.
 */
import type { MetadataRoute } from 'next'
import { getSiteSettings } from '@/lib/firestore/settings'

export const revalidate = 3600

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const s = await getSiteSettings()
  const name = s?.siteTitle || 'UpBeat Heart'
  const icon = s?.faviconUrl || '/logo.png'

  return {
    name,
    short_name: name.split(' ')[0] || name,
    description: s?.siteDescription
      || 'Doctor-verified cardiac care, patient education and assistance.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#ffffff',
    theme_color: '#1565D8',
    lang: 'en-IN',
    dir: 'ltr',
    categories: ['health', 'medical', 'education'],
    icons: [
      { src: icon, sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: icon, sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: icon, sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    shortcuts: [
      { name: 'Book Appointment', url: '/appointment' },
      { name: 'Heart Diseases',   url: '/diseases' },
      { name: 'Donate',           url: '/donate' },
    ],
  }
}
