/**
 * getSiteSettings()
 * Reads from Firestore: settings/site
 * Field names mirror EXACTLY the admin SettingsPage.tsx SiteSettings interface.
 * Cache TTL: 60s (matches SSR revalidate on home page)
 */
import { getAdminDb } from '@/lib/firebase-admin'
import { sanitizeForClient } from '@/lib/sanitize'
import { cld } from '@/lib/cloudinary'
import type { SiteSettings, ClinicHour } from '@/types/firestore'
import { unstable_cache } from 'next/cache'

const DEFAULT_HOURS: ClinicHour[] = [
  { day: 'Monday',    open: '09:00', close: '17:00', closed: false },
  { day: 'Tuesday',   open: '09:00', close: '17:00', closed: false },
  { day: 'Wednesday', open: '09:00', close: '17:00', closed: false },
  { day: 'Thursday',  open: '09:00', close: '17:00', closed: false },
  { day: 'Friday',    open: '09:00', close: '17:00', closed: false },
  { day: 'Saturday',  open: '09:00', close: '13:00', closed: false },
  { day: 'Sunday',    open: '09:00', close: '13:00', closed: true  },
]

const DEFAULT_SETTINGS: SiteSettings = {
  // Branding
  logoUrl:           '',
  faviconUrl:        '',
  ogImageUrl:        '',
  // Doctor Profile
  doctorName:        '',
  doctorTitle:       'Consultant Cardiologist',
  doctorBio:         '',
  doctorPhotoUrl:    '',
  doctorQuals:       'MBBS, MD, DM (Cardiology)',
  doctorExperience:  '',
  hospitalName:      'CARE Hospitals',
  hospitalAddress:   '',
  // Contact
  phone:             '',
  phoneAlt:          '',
  whatsapp:          '',
  email:             '',
  emailAlt:          '',
  address:           '',
  mapsEmbedUrl:      '',
  mapsLink:          '',
  clinicHours:       DEFAULT_HOURS,
  // Social
  facebook:          '',
  instagram:         '',
  youtube:           '',
  linkedin:          '',
  twitter:           '',
  googleBusiness:    '',
  googleMapsProfile: '',
  // Website / SEO
  siteTitle:         'UpBeat Heart',
  siteTitleSuffix:   '| Cardiology Care',
  siteDescription:   'Expert cardiac care, patient assistance programs, and health education.',
  gaId:              '',
  razorpayMode:      'test',
  appointmentsOpen:  true,
  appointmentNote:   '',
  // Home Page Section Visibility
  homeSections: {
    hero:            true,
    stats:           true,
    govSchemes:      true,
    video:           true,
    diseases:        true,
    myths:           true,
    cardiologyTypes: true,
    campaigns:       true,
    ngo:             true,
    blogs:           true,
    gallery:         true,
    reviews:         true,
    donate:          true,
    appointment:     true,
  },
  // Education Video
  educationVideoUrl:   '',
  educationVideoTitle: '',
  educationVideoDesc:  '',
  // Donations
  donationEnabled: false,
  razorpayKeyId: '', upiId: '', upiName: '', upiQrUrl: '',
  bankAccountName: '', bankAccountNumber: '', bankIfsc: '',
  bankName: '', bankBranch: '', chequePayableTo: '', donationNote: '',
}



// ── Internal fetcher — called by the unstable_cache wrapper below ──────────
async function _fetchSettings(): Promise<SiteSettings> {
  try {
    const db   = getAdminDb()
    const snap = await db.collection('settings').doc('site').get()
    if (!snap.exists) return DEFAULT_SETTINGS
    const raw = snap.data()!

    // Sanitize all Firestore-specific types before merging
    const data = sanitizeForClient(raw) as Record<string, unknown>

    const raw2 = {
      ...DEFAULT_SETTINGS,
      ...data,
      // clinicHours fallback — admin always saves this array; guard against missing
      clinicHours: Array.isArray(data.clinicHours) && (data.clinicHours as unknown[]).length
        ? data.clinicHours as ClinicHour[]
        : DEFAULT_HOURS,
    } as SiteSettings
    // Ensure homeSections always has all keys (Firestore may have partial/missing)
    raw2.homeSections = {
      hero:            raw2.homeSections?.hero            ?? true,
      stats:           raw2.homeSections?.stats           ?? true,
      govSchemes:      raw2.homeSections?.govSchemes      ?? true,
      video:           raw2.homeSections?.video           ?? true,
      diseases:        raw2.homeSections?.diseases        ?? true,
      myths:           raw2.homeSections?.myths           ?? true,
      cardiologyTypes: raw2.homeSections?.cardiologyTypes ?? true,
      campaigns:       raw2.homeSections?.campaigns       ?? true,
      ngo:             raw2.homeSections?.ngo             ?? true,
      blogs:           raw2.homeSections?.blogs           ?? true,
      gallery:         raw2.homeSections?.gallery         ?? true,
      reviews:         raw2.homeSections?.reviews         ?? true,
      donate:          raw2.homeSections?.donate          ?? true,
      appointment:     raw2.homeSections?.appointment     ?? true,
    }
    // Pre-transform Cloudinary URLs to correctly-sized variants
    // so next/image never has to download a multi-MB raw file
    return {
      ...raw2,
      logoUrl:        cld.logo(raw2.logoUrl),
      faviconUrl:     cld.favicon(raw2.faviconUrl),
      ogImageUrl:     cld.og(raw2.ogImageUrl),
      // doctorPhotoUrl: intentionally NOT pre-transformed here.
      // Each component applies its own size: Navbar/Footer use cld.avatarSm,
      // HeroSection uses cloudinaryPortrait(256,341), DoctorIntro uses cld.doctorAbout.
      // Pre-transforming here caused double-transform stacking → tiny blurry photo.
      doctorPhotoUrl: raw2.doctorPhotoUrl ?? '',
    }
  } catch {
    return DEFAULT_SETTINGS
  }
}

// ── Public export — cached by Next.js, busted by revalidateTag('settings') ─
// revalidate: 60  → ISR fallback if on-demand bust never fires
// tags: ['settings'] → admin API route calls revalidateTag('settings') on save
export const getSiteSettings = unstable_cache(
  _fetchSettings,
  ['site-settings'],
  { revalidate: 60, tags: ['settings'] },
)
