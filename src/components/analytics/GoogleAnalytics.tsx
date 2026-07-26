/**
 * GoogleAnalytics.tsx
 * Injects the GA4 gtag.js script pair into <head>.
 *
 * Priority order for the Measurement ID:
 *   1. gaId passed from Firestore settings/site (set via admin dashboard
 *      Settings → Website/SEO → "Google Analytics 4 — Measurement ID")
 *   2. NEXT_PUBLIC_GA_ID env variable (optional override / hardcoded fallback)
 *
 * Usage: <GoogleAnalytics gaId={settings.gaId} />  ← in root layout.tsx
 *
 * Renders null when no valid G-XXXXXXXX ID is available,
 * so dev builds without a GA ID stay clean.
 */

interface Props {
  /** GA4 Measurement ID from Firestore, e.g. "G-DYLEVM7H2L" */
  gaId?: string
}

export default function GoogleAnalytics({ gaId }: Props) {
  // Resolve: Firestore value → env fallback → nothing
  const measurementId =
    (gaId && gaId.trim().startsWith('G-') ? gaId.trim() : '') ||
    (process.env.NEXT_PUBLIC_GA_ID?.startsWith('G-')
      ? process.env.NEXT_PUBLIC_GA_ID
      : '')

  if (!measurementId) return null

  return (
    <>
      {/* Google tag (gtag.js) — async loader */}
      <script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
      />
      {/* gtag initialisation — must run immediately after the loader */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${measurementId}', { page_path: window.location.pathname });
          `.trim(),
        }}
      />
    </>
  )
}
