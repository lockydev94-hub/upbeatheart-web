/**
 * UpBeat Heart — Advanced SEO Library
 *
 * Every page's `generateMetadata` should go through `buildMetadata()` so the
 * whole site gets a canonical URL, an Open Graph block, a Twitter card and
 * explicit robots/googleBot directives from one place. Page-specific JSON-LD
 * is composed from the schema builders below and emitted with `<JsonLd />`.
 *
 * Two rules worth knowing before editing:
 *  • `buildMetadata` returns `title: { absolute }` on purpose. The root layout
 *    declares a `title.template` of "%s | <suffix>", so a page returning a bare
 *    string would get the suffix appended a second time.
 *  • Never spread `buildMetadata(...)` and then add your own `openGraph` key —
 *    Next.js replaces the whole OG object rather than merging it, which silently
 *    drops siteName / locale / publishedTime. Pass the values in as options.
 */

import type { Metadata } from 'next'
import type { SiteSettings } from '@/types/firestore'

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://upbeatheart.com'

/** Fallback site name used before settings have loaded. */
export const SITE_NAME = 'UpBeat Heart'

/**
 * Generated 1200x630 social card, served by `app/og-default.png/route.tsx`.
 * Used whenever a page has no image of its own and Settings has no OG image.
 */
export const OG_FALLBACK = `${SITE_URL}/og-default.png`

/**
 * Generated square publisher logo, served by `app/logo.png/route.tsx`.
 * Google needs a resolvable logo on Article/Organization for rich results.
 */
export const LOGO_FALLBACK = `${SITE_URL}/logo.png`

/**
 * ISO-8601 or nothing. Firestore timestamps arrive here as strings via
 * `sanitizeForClient`, and a malformed one would make `toISOString()` throw
 * `RangeError` during the build — a bad date must never fail a page render.
 */
export function safeIso(value?: string | number | Date | null): string | undefined {
  if (!value) return undefined
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString()
}

/** Absolute URL from a site-relative path, with duplicate slashes collapsed. */
export function absUrl(path = '/'): string {
  if (/^https?:\/\//i.test(path)) return path
  return `${SITE_URL}/${path.replace(/^\/+/, '')}`.replace(/\/+$/, path === '/' ? '/' : '')
}

// ── 1. buildMetadata ────────────────────────────────────────────────────────
export function buildMetadata(opts: {
  title:        string
  description:  string
  path:         string
  image?:       string
  imageAlt?:    string
  settings:     SiteSettings
  type?:        'website' | 'article'
  keywords?:    string[]
  publishedAt?: string
  modifiedAt?:  string
  noIndex?:     boolean
  /** Site-relative path, e.g. the `seo.canonical` stored on a disease. */
  canonical?:   string
  /** Overrides the OG/Twitter title only — the `<title>` tag keeps `title`. */
  ogTitle?:     string
  /** Overrides the OG/Twitter description only. */
  ogDescription?: string
  /** Article byline, e.g. the reviewing doctor. */
  authorName?:  string
  /** Article section / category. */
  section?:     string
  /** Article tags, emitted as `article:tag`. */
  tags?:        string[]
}): Metadata {
  const {
    title, description, path, image, imageAlt,
    settings, type = 'website', keywords,
    publishedAt, modifiedAt, noIndex = false, canonical,
    ogTitle, ogDescription, authorName, section, tags,
  } = opts

  const url    = absUrl(path)
  const canon  = canonical ? absUrl(canonical) : url
  const ogImg  = image || settings.ogImageUrl || OG_FALLBACK
  const suffix = settings.siteTitleSuffix?.trim() || `| ${SITE_NAME}`
  const fullTitle = title.includes(suffix) ? title : `${title} ${suffix}`

  const published = safeIso(publishedAt)
  const modified  = safeIso(modifiedAt)

  return {
    // `absolute` opts out of the root layout's title template, which would
    // otherwise append the site suffix a second time.
    title:       { absolute: fullTitle },
    description,
    metadataBase: new URL(SITE_URL),
    alternates:   { canonical: canon },
    keywords:     keywords?.length ? keywords.join(', ') : undefined,
    ...(authorName ? { authors: [{ name: authorName }] } : {}),
    ...(section ? { category: section } : {}),

    openGraph: {
      title:       ogTitle || title,
      description: ogDescription || description,
      url:      canon,
      type,
      siteName: settings.siteTitle || SITE_NAME,
      locale:   'en_IN',
      images:   [{ url: ogImg, width: 1200, height: 630, alt: imageAlt || title }],
      ...(published ? { publishedTime: published } : {}),
      ...(modified  ? { modifiedTime:  modified  } : {}),
      ...(type === 'article' && authorName ? { authors: [authorName] } : {}),
      ...(type === 'article' && section    ? { section }               : {}),
      ...(type === 'article' && tags?.length ? { tags }                : {}),
    },

    twitter: {
      card:        'summary_large_image',
      title:       ogTitle || title,
      description: ogDescription || description,
      images:      [ogImg],
      site:        settings.twitter
        ? `@${settings.twitter.replace(/^@/, '').split('/').pop()}`
        : undefined,
    },

    robots: noIndex
      ? { index: false, follow: false }
      : {
          index: true, follow: true,
          googleBot: {
            index: true, follow: true,
            'max-image-preview': 'large',
            'max-snippet': -1,
            'max-video-preview': -1,
          },
        },
  }
}

// ── 2. Physician Schema ─────────────────────────────────────────────────────
export function physicianSchema(s: SiteSettings) {
  const social = [s.facebook, s.instagram, s.youtube, s.linkedin, s.twitter, s.googleBusiness]
    .filter(Boolean).map(u => (u.startsWith('http') ? u : `https://${u}`))

  return {
    '@context': 'https://schema.org',
    '@type': ['Person', 'Physician'],
    '@id':   `${SITE_URL}/#physician`,
    name:     s.doctorName,
    description: s.doctorBio,
    url:      SITE_URL,
    image:    s.doctorPhotoUrl || undefined,
    telephone: s.phone,
    email:    s.email,
    jobTitle: s.doctorTitle,
    hasCredential: s.doctorQuals
      ? [{ '@type': 'EducationalOccupationalCredential', credentialCategory: s.doctorQuals }]
      : undefined,
    medicalSpecialty: { '@type': 'MedicalSpecialty', name: 'Cardiology' },
    worksFor: {
      '@type': 'MedicalOrganization',
      '@id':   `${SITE_URL}/#organization`,
      name:    s.hospitalName,
      address: s.hospitalAddress,
    },
    sameAs: social.length ? social : undefined,
  }
}

// ── 3. MedicalOrganization Schema ───────────────────────────────────────────
export function medicalOrgSchema(s: SiteSettings) {
  const hours = (s.clinicHours || [])
    .filter(h => !h.closed)
    .map(h => `${h.day.slice(0, 2)} ${h.open}-${h.close}`)

  const social = [s.facebook, s.instagram, s.youtube, s.linkedin, s.googleBusiness]
    .filter(Boolean)

  return {
    '@context': 'https://schema.org',
    '@type': ['MedicalOrganization', 'LocalBusiness'],
    '@id':    `${SITE_URL}/#organization`,
    name:     s.hospitalName || s.siteTitle || 'UpBeat Heart',
    url:      SITE_URL,
    logo:     s.logoUrl || undefined,
    image:    s.ogImageUrl || undefined,
    telephone: s.phone,
    email:    s.email,
    address: s.address ? {
      '@type': 'PostalAddress',
      streetAddress: s.address,
    } : undefined,
    hasMap: s.mapsLink || undefined,
    openingHoursSpecification: (s.clinicHours || [])
      .filter(h => !h.closed)
      .map(h => ({
        '@type':    'OpeningHoursSpecification',
        dayOfWeek:  `https://schema.org/${h.day}`,
        opens:      h.open,
        closes:     h.close,
      })),
    openingHours: hours.length ? hours : undefined,
    medicalSpecialty: 'Cardiology',
    availableService: {
      '@type': 'MedicalTherapy',
      name: 'Cardiology Consultation',
    },
    currenciesAccepted: 'INR',
    paymentAccepted: 'Cash, UPI, Card',
    priceRange: '₹₹',
    sameAs: social,
    member: {
      '@type': 'Physician',
      '@id':   `${SITE_URL}/#physician`,
      name:    s.doctorName,
    },
  }
}

// ── 4. WebSite + SearchAction (Home) ───────────────────────────────────────
export function webSiteSchema(s: SiteSettings) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id':   `${SITE_URL}/#website`,
    name:    s.siteTitle || 'UpBeat Heart',
    url:     SITE_URL,
    description: s.siteDescription,
    inLanguage: 'en-IN',
    publisher: {
      '@type': 'Organization',
      '@id':   `${SITE_URL}/#organization`,
    },
    potentialAction: {
      '@type':       'SearchAction',
      target:        `${SITE_URL}/diseases?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  }
}

// ── 5. BreadcrumbList ──────────────────────────────────────────────────────
export function breadcrumbSchema(crumbs: { name: string; url?: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type':  'ListItem',
      position: i + 1,
      name:     c.name,
      item:     c.url,
    })),
  }
}

// ── 6. MedicalWebPage (disease/treatment page) ─────────────────────────────
export function medicalWebPageSchema(opts: {
  title:       string
  description: string
  slug:        string
  doctorName:  string
  doctorTitle: string
  image?:      string
  publishedAt?: string
  updatedAt?:  string
  icdCode?:    string
  keywords?:   string[]
  category?:   string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'MedicalWebPage',
    '@id':   `${SITE_URL}/diseases/${opts.slug}#webpage`,
    name:    opts.title,
    description: opts.description,
    url:     `${SITE_URL}/diseases/${opts.slug}`,
    image:   opts.image,
    datePublished: safeIso(opts.publishedAt),
    dateModified:  safeIso(opts.updatedAt) || safeIso(opts.publishedAt),
    inLanguage:    'en-IN',
    about: {
      '@type': 'MedicalCondition',
      name:    opts.title,
      code: opts.icdCode ? {
        '@type':      'MedicalCode',
        code:         opts.icdCode,
        codingSystem: 'ICD-10',
      } : undefined,
      category:           opts.category,
      relevantSpecialty:  { '@type': 'MedicalSpecialty', name: 'Cardiology' },
    },
    reviewedBy: {
      '@type':          'Physician',
      '@id':            `${SITE_URL}/#physician`,
      name:             opts.doctorName,
      jobTitle:         opts.doctorTitle,
      medicalSpecialty: { '@type': 'MedicalSpecialty', name: 'Cardiology' },
    },
    medicalAudience: { '@type': 'Patient' },
    specialty:       'Cardiology',
    keywords: opts.keywords?.join(', '),
  }
}

// ── 7. FAQPage ─────────────────────────────────────────────────────────────
export function faqSchema(faqs: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(f => ({
      '@type': 'Question',
      name:    f.q,
      acceptedAnswer: { '@type': 'Answer', text: stripHtml(f.a) },
    })),
  }
}

// ── 8. Article Schema (blog) ───────────────────────────────────────────────
export function articleSchema(opts: {
  title:       string
  description: string
  slug:        string
  coverImage?: string
  publishedAt?: string
  updatedAt?:  string
  authorName:  string
  authorTitle: string
  category?:   string
  tags?:       string[]
  wordCount?:  number
  publisherName?: string
  publisherLogo?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id':   `${SITE_URL}/blogs/${opts.slug}#article`,
    headline:    opts.title,
    description: opts.description,
    url:         `${SITE_URL}/blogs/${opts.slug}`,
    image: opts.coverImage ? {
      '@type':       'ImageObject',
      url:           opts.coverImage,
      contentUrl:    opts.coverImage,
    } : undefined,
    datePublished: safeIso(opts.publishedAt),
    dateModified:  safeIso(opts.updatedAt) || safeIso(opts.publishedAt),
    inLanguage:    'en-IN',
    wordCount:     opts.wordCount,
    articleSection: opts.category,
    keywords:      opts.tags?.join(', '),
    author: {
      '@type':          'Physician',
      '@id':            `${SITE_URL}/#physician`,
      name:             opts.authorName,
      jobTitle:         opts.authorTitle,
      medicalSpecialty: { '@type': 'MedicalSpecialty', name: 'Cardiology' },
    },
    publisher: {
      '@type': 'Organization',
      '@id':   `${SITE_URL}/#organization`,
      name:    opts.publisherName || SITE_NAME,
      url:     SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url:     opts.publisherLogo || LOGO_FALLBACK,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id':   `${SITE_URL}/blogs/${opts.slug}`,
    },
    about: {
      '@type': 'MedicalSpecialty',
      name:    'Cardiology',
    },
  }
}

// ── 9. VideoObject ─────────────────────────────────────────────────────────
export function videoObjectSchema(opts: {
  name:         string
  description:  string
  thumbnailUrl: string
  uploadDate:   string
  contentUrl?:  string
  embedUrl?:    string
  duration?:    string  // ISO 8601 e.g. PT5M30S
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name:         opts.name,
    description:  opts.description,
    thumbnailUrl: opts.thumbnailUrl,
    uploadDate:   opts.uploadDate,
    contentUrl:   opts.contentUrl,
    embedUrl:     opts.embedUrl,
    duration:     opts.duration,
    publisher: {
      '@type': 'Organization',
      '@id':   `${SITE_URL}/#organization`,
      name:    'UpBeat Heart',
    },
  }
}

// ── 10. AggregateRating + Review (reviews page) ────────────────────────────
export function aggregateRatingSchema(opts: {
  reviews: { patientName: string; rating: number; text: string; publishedAt?: string }[]
  orgName: string
}) {
  if (!opts.reviews.length) return null
  const sum = opts.reviews.reduce((a, r) => a + r.rating, 0)
  const avg = (sum / opts.reviews.length).toFixed(1)
  return {
    '@context': 'https://schema.org',
    '@type': 'MedicalOrganization',
    '@id':   `${SITE_URL}/#organization`,
    name:    opts.orgName,
    aggregateRating: {
      '@type':       'AggregateRating',
      ratingValue:   avg,
      bestRating:    '5',
      worstRating:   '1',
      ratingCount:   opts.reviews.length,
      reviewCount:   opts.reviews.length,
    },
    review: opts.reviews.slice(0, 10).map(r => ({
      '@type':    'Review',
      author:     { '@type': 'Person', name: r.patientName },
      reviewRating: {
        '@type':       'Rating',
        ratingValue:   r.rating,
        bestRating:    5,
        worstRating:   1,
      },
      reviewBody:  r.text.slice(0, 500),
      datePublished: r.publishedAt,
    })),
  }
}

// ── 11. DonateAction (campaign page) ───────────────────────────────────────
export function campaignSchema(opts: {
  patientName:    string
  diagnosis:      string
  story:          string
  goal:           number
  raised:         number
  slug:           string
  photo?:         string
  doctorVerified: boolean
  hospitalName:   string
}) {
  const remaining = Math.max(0, opts.goal - opts.raised)
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id':   `${SITE_URL}/patient-assistance/${opts.slug}`,
    name:    `Help ${opts.patientName.split(' ')[0]} — ${opts.diagnosis}`,
    description: opts.story.slice(0, 300),
    url:     `${SITE_URL}/patient-assistance/${opts.slug}`,
    image:   opts.photo,
    potentialAction: {
      '@type':  'DonateAction',
      name:     `Donate to help ${opts.patientName.split(' ')[0]}`,
      target:   `${SITE_URL}/patient-assistance/${opts.slug}#donate`,
      price:    remaining,
      priceCurrency: 'INR',
      recipient: {
        '@type': 'Patient',
        name:    opts.patientName,
        description: opts.diagnosis,
      },
    },
    about: {
      '@type':    'MedicalCondition',
      name:       opts.diagnosis,
      relevantSpecialty: { '@type': 'MedicalSpecialty', name: 'Cardiology' },
    },
  }
}

// ── 12. LocalBusiness (contact page) ──────────────────────────────────────
export function localBusinessSchema(s: SiteSettings) {
  return {
    '@context': 'https://schema.org',
    '@type': ['LocalBusiness', 'MedicalOrganization'],
    '@id':   `${SITE_URL}/#organization`,
    name:    s.hospitalName || s.siteTitle || 'UpBeat Heart',
    url:     SITE_URL,
    telephone: s.phone,
    email:   s.email,
    address: {
      '@type':        'PostalAddress',
      streetAddress:  s.address,
    },
    hasMap:  s.mapsLink || undefined,
    openingHoursSpecification: (s.clinicHours || [])
      .filter(h => !h.closed)
      .map(h => ({
        '@type':    'OpeningHoursSpecification',
        dayOfWeek:  `https://schema.org/${h.day}`,
        opens:      h.open,
        closes:     h.close,
      })),
    medicalSpecialty: 'Cardiology',
    priceRange: '₹₹',
    currenciesAccepted: 'INR',
    paymentAccepted: 'Cash, UPI, Card, Cheque',
    sameAs: [s.facebook, s.instagram, s.youtube, s.googleBusiness].filter(Boolean),
  }
}

// ── 13. SpeakableSpecification (voice search — disease pages) ──────────────
export function speakableSchema(url: string, cssSelectors: string[] = []) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    speakable: {
      '@type':       'SpeakableSpecification',
      // Defaults match the real disease-article markup — section wrappers are
      // addressed by id, not class. A selector that matches nothing makes the
      // whole speakable block useless, so keep these in sync with the page.
      cssSelector:   cssSelectors.length
        ? cssSelectors
        : ['h1', '#overview', '#symptoms'],
    },
    url,
  }
}

// ── 14. Health camp Event ──────────────────────────────────────────────────
export function healthCampEventSchema(opts: {
  name:        string
  startDate:   string
  location:    string
  description: string
  url:         string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name:        opts.name,
    startDate:   opts.startDate,
    description: opts.description,
    url:         opts.url,
    location: {
      '@type': 'Place',
      name:    opts.location,
    },
    organizer: {
      '@type': 'Organization',
      '@id':   `${SITE_URL}/#organization`,
    },
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
  }
}

// ── 15. Organization (standalone — for home page @graph) ──────────────────
export function organizationSchema(s: SiteSettings) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id':   `${SITE_URL}/#organization`,
    name:    s.siteTitle || 'UpBeat Heart',
    url:     SITE_URL,
    logo: {
      '@type':       'ImageObject',
      '@id':         `${SITE_URL}/#logo`,
      url:           s.logoUrl || LOGO_FALLBACK,
      width:         200,
      height:        60,
      caption:       s.siteTitle || 'UpBeat Heart',
    },
    image:    s.ogImageUrl || undefined,
    telephone: s.phone,
    email:    s.email,
    sameAs: [s.facebook, s.instagram, s.youtube, s.linkedin, s.twitter, s.googleBusiness]
      .filter(Boolean),
  }
}

// ── 16. MedicalProcedure / Service per treatment ──────────────────────────
export function medicalProcedureSchema(opts: {
  name:        string
  description: string
  slug:        string
  category?:   string
  doctorName:  string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'MedicalProcedure',
    name:        opts.name,
    description: opts.description,
    url:         `${SITE_URL}/diseases/${opts.slug}`,
    procedureType: 'https://schema.org/TherapeuticProcedure',
    relevantSpecialty: { '@type': 'MedicalSpecialty', name: 'Cardiology' },
    recognizingAuthority: {
      '@type': 'Organization',
      '@id':   `${SITE_URL}/#organization`,
    },
    legalStatus: 'Approved',
    medicineSystem: 'https://schema.org/WesternConventional',
    study: {
      '@type': 'MedicalTrial',
      trialDesign: 'https://schema.org/OpenTrial',
    },
  }
}

// ── 17. HowTo (lifestyle / self-care articles) ────────────────────────────
export function howToSchema(opts: {
  name:        string
  description: string
  steps:       string[]
  url:         string
  image?:      string
  totalTime?:  string  // ISO 8601 duration e.g. PT30M
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name:        opts.name,
    description: opts.description,
    url:         opts.url,
    image:       opts.image,
    totalTime:   opts.totalTime,
    step: opts.steps.map((s, i) => ({
      '@type':  'HowToStep',
      position: i + 1,
      text:     stripHtml(s),
    })),
  }
}

// ── 18. NGO partner entity ─────────────────────────────────────────────────
export function ngoSchema(opts: {
  name:        string
  description: string
  url?:        string
  phone?:      string
  email?:      string
  address?:    string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'NGO',
    name:        opts.name,
    description: opts.description,
    url:         opts.url,
    telephone:   opts.phone,
    email:       opts.email,
    address: opts.address ? {
      '@type':        'PostalAddress',
      streetAddress:  opts.address,
    } : undefined,
  }
}

// ── 19. Full @graph for Home page (richest structured data) ───────────────
export function homePageGraph(s: SiteSettings) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      // WebSite
      {
        '@type': 'WebSite',
        '@id':   `${SITE_URL}/#website`,
        name:    s.siteTitle || 'UpBeat Heart',
        url:     SITE_URL,
        description: s.siteDescription,
        inLanguage: 'en-IN',
        publisher: { '@id': `${SITE_URL}/#organization` },
        potentialAction: {
          '@type':       'SearchAction',
          target:        `${SITE_URL}/diseases?q={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      },
      // Organization
      {
        '@type': ['Organization', 'MedicalOrganization'],
        '@id':   `${SITE_URL}/#organization`,
        name:    s.siteTitle || 'UpBeat Heart',
        url:     SITE_URL,
        logo: {
          '@type': 'ImageObject',
          '@id':   `${SITE_URL}/#logo`,
          url:     s.logoUrl || LOGO_FALLBACK,
          caption: s.siteTitle || 'UpBeat Heart',
        },
        image:    s.ogImageUrl || undefined,
        telephone: s.phone,
        email:    s.email,
        address: s.address ? { '@type': 'PostalAddress', streetAddress: s.address } : undefined,
        sameAs: [s.facebook, s.instagram, s.youtube, s.linkedin, s.googleBusiness].filter(Boolean),
        medicalSpecialty: 'Cardiology',
      },
      // Physician
      {
        '@type': ['Person', 'Physician'],
        '@id':   `${SITE_URL}/#physician`,
        name:    s.doctorName,
        jobTitle: s.doctorTitle,
        description: s.doctorBio,
        image:   s.doctorPhotoUrl || undefined,
        telephone: s.phone,
        email:   s.email,
        url:     `${SITE_URL}/about`,
        medicalSpecialty: { '@type': 'MedicalSpecialty', name: 'Cardiology' },
        hasCredential: s.doctorQuals
          ? [{ '@type': 'EducationalOccupationalCredential', credentialCategory: s.doctorQuals }]
          : undefined,
        worksFor: { '@id': `${SITE_URL}/#organization` },
        sameAs: [s.facebook, s.instagram, s.linkedin].filter(Boolean),
      },
      // WebPage (Home)
      {
        '@type': 'WebPage',
        '@id':   `${SITE_URL}/#webpage`,
        url:     SITE_URL,
        name:    s.siteTitle || 'UpBeat Heart',
        description: s.siteDescription,
        inLanguage: 'en-IN',
        isPartOf:  { '@id': `${SITE_URL}/#website` },
        about:     { '@id': `${SITE_URL}/#physician` },
        publisher: { '@id': `${SITE_URL}/#organization` },
      },
    ],
  }
}

// ── 20. Long-tail keyword builder for disease pages ────────────────────────
export function buildDiseaseKeywords(
  diseaseName: string,
  city: string = 'India',
  doctorName?: string,
): string[] {
  const d = diseaseName
  const c = city
  return [
    `${d} symptoms`,
    `${d} treatment`,
    `${d} causes`,
    `${d} diagnosis`,
    `${d} in ${c}`,
    `${d} treatment in ${c}`,
    `best cardiologist for ${d}`,
    `${d} specialist in ${c}`,
    `${d} prevention`,
    `${d} risk factors`,
    `${d} surgery`,
    `${d} recovery`,
    `${d} FAQs`,
    doctorName ? `${doctorName} ${d}` : '',
    `cardiology ${d}`,
  ].filter(Boolean)
}

// ── 21. Long-tail keyword builder for blog articles ────────────────────────
export function buildBlogKeywords(
  title: string,
  tags: string[] = [],
  city?: string,
): string[] {
  const base = [
    title,
    ...tags,
    'heart health tips',
    'cardiology advice',
    city ? `cardiology ${city}` : '',
  ].filter(Boolean)
  return [...new Set(base)]
}

// ── 22. ImageSitemap entry helper (for sitemap.ts) ─────────────────────────
export interface ImageSitemapEntry {
  url:     string
  images?: { loc: string; title?: string; caption?: string }[]
}

// ── 23. Breadcrumb helper — absolute URLs from site-relative paths ─────────
/**
 * `siteCrumbs([['Home','/'], ['Diseases','/diseases']])` — saves every page
 * hand-interpolating SITE_URL, which is where the `undefined/gallery` class of
 * bug came from. The last crumb is the current page.
 */
export function siteCrumbs(crumbs: [name: string, path: string][]) {
  return breadcrumbSchema(crumbs.map(([name, path]) => ({ name, url: absUrl(path) })))
}

// ── 24. CollectionPage + ItemList (hub / listing pages) ───────────────────
/**
 * Listing pages (diseases, blogs, campaigns, NGO partners) are `CollectionPage`
 * nodes carrying an `ItemList` of what they link to. This is what lets Google
 * treat the hub as an index rather than a thin duplicate of its children.
 */
export function collectionPageSchema(opts: {
  name:         string
  description:  string
  path:         string
  items:        { name: string; path: string; image?: string; description?: string }[]
  /** Schema type for the list entries, e.g. `MedicalWebPage`, `Article`. */
  itemType?:    string
  /** Narrower page type, e.g. `CollectionPage` (default) or `ImageGallery`. */
  pageType?:    string
  numberOfItems?: number
}) {
  const { name, description, path, items, itemType, pageType = 'CollectionPage' } = opts
  return {
    '@context': 'https://schema.org',
    '@type':    pageType,
    '@id':      `${absUrl(path)}#webpage`,
    name,
    description,
    url:        absUrl(path),
    inLanguage: 'en-IN',
    isPartOf:   { '@type': 'WebSite', '@id': `${SITE_URL}/#website` },
    publisher:  { '@type': 'Organization', '@id': `${SITE_URL}/#organization` },
    mainEntity: {
      '@type':        'ItemList',
      itemListOrder:  'https://schema.org/ItemListOrderDescending',
      numberOfItems:  opts.numberOfItems ?? items.length,
      itemListElement: items.map((it, i) => ({
        '@type':   'ListItem',
        position:  i + 1,
        name:      it.name,
        url:       absUrl(it.path),
        ...(itemType ? {
          item: {
            '@type':      itemType,
            '@id':        absUrl(it.path),
            name:         it.name,
            url:          absUrl(it.path),
            ...(it.image       ? { image: it.image }             : {}),
            ...(it.description ? { description: it.description } : {}),
          },
        } : {}),
      })),
    },
  }
}

// ── 25. Generic WebPage (legal, static and utility pages) ─────────────────
/**
 * For pages that carry no richer entity of their own. `pageType` should be the
 * most specific schema.org subtype that applies — `AboutPage`, `ContactPage`,
 * `CheckoutPage`, or plain `WebPage`.
 */
export function webPageSchema(opts: {
  name:         string
  description:  string
  path:         string
  pageType?:    string
  datePublished?: string
  dateModified?:  string
  image?:       string
  breadcrumbPath?: string
}) {
  const { name, description, path, pageType = 'WebPage' } = opts
  return {
    '@context': 'https://schema.org',
    '@type':    pageType,
    '@id':      `${absUrl(path)}#webpage`,
    name,
    description,
    url:        absUrl(path),
    inLanguage: 'en-IN',
    isPartOf:   { '@type': 'WebSite', '@id': `${SITE_URL}/#website` },
    publisher:  { '@type': 'Organization', '@id': `${SITE_URL}/#organization` },
    ...(opts.image          ? { primaryImageOfPage: { '@type': 'ImageObject', url: opts.image } } : {}),
    ...(safeIso(opts.datePublished) ? { datePublished: safeIso(opts.datePublished) } : {}),
    ...(safeIso(opts.dateModified)  ? { dateModified:  safeIso(opts.dateModified)  } : {}),
  }
}

// ── 26. ImageGallery (/gallery) ───────────────────────────────────────────
export function imageGallerySchema(opts: {
  name:        string
  description: string
  path:        string
  images:      { url: string; caption?: string; name?: string }[]
}) {
  return {
    '@context': 'https://schema.org',
    '@type':    'ImageGallery',
    '@id':      `${absUrl(opts.path)}#webpage`,
    name:        opts.name,
    description: opts.description,
    url:         absUrl(opts.path),
    inLanguage:  'en-IN',
    isPartOf:    { '@type': 'WebSite', '@id': `${SITE_URL}/#website` },
    publisher:   { '@type': 'Organization', '@id': `${SITE_URL}/#organization` },
    associatedMedia: opts.images.map(img => ({
      '@type':     'ImageObject',
      contentUrl:  img.url,
      url:         img.url,
      ...(img.name    ? { name: img.name }       : {}),
      ...(img.caption ? { caption: img.caption } : {}),
    })),
  }
}

// ── 27. DonateAction (/donate) ────────────────────────────────────────────
/**
 * Marks /donate as the site's donation entry point. `recipient` points at the
 * organisation node so the action is attributed to the clinic, not the page.
 */
export function donatePageSchema(s: SiteSettings, opts: {
  name:        string
  description: string
  path:        string
}) {
  return {
    '@context': 'https://schema.org',
    '@type':    'WebPage',
    '@id':      `${absUrl(opts.path)}#webpage`,
    name:        opts.name,
    description: opts.description,
    url:         absUrl(opts.path),
    inLanguage:  'en-IN',
    isPartOf:    { '@type': 'WebSite', '@id': `${SITE_URL}/#website` },
    potentialAction: {
      '@type': 'DonateAction',
      name:    'Donate to cardiac patient care',
      target: {
        '@type':        'EntryPoint',
        urlTemplate:    absUrl(opts.path),
        actionPlatform: [
          'https://schema.org/DesktopWebPlatform',
          'https://schema.org/MobileWebPlatform',
        ],
      },
      recipient: {
        '@type': 'MedicalOrganization',
        '@id':   `${SITE_URL}/#organization`,
        name:    s.siteTitle || SITE_NAME,
      },
      priceSpecification: {
        '@type':        'PriceSpecification',
        priceCurrency:  'INR',
      },
    },
  }
}

// ── 28. ReserveAction (/appointment) ──────────────────────────────────────
/** Declares online booking so Google can surface a "Book" action. */
export function appointmentPageSchema(s: SiteSettings, opts: {
  name:        string
  description: string
  path:        string
}) {
  return {
    '@context': 'https://schema.org',
    '@type':    'WebPage',
    '@id':      `${absUrl(opts.path)}#webpage`,
    name:        opts.name,
    description: opts.description,
    url:         absUrl(opts.path),
    inLanguage:  'en-IN',
    isPartOf:    { '@type': 'WebSite', '@id': `${SITE_URL}/#website` },
    mainEntity: {
      '@type':   'MedicalClinic',
      '@id':     `${SITE_URL}/#organization`,
      name:      s.hospitalName || s.siteTitle || SITE_NAME,
      telephone: s.phone || undefined,
      medicalSpecialty: 'Cardiology',
      potentialAction: {
        '@type': 'ReserveAction',
        name:    'Book a cardiology consultation',
        target: {
          '@type':        'EntryPoint',
          urlTemplate:    absUrl(opts.path),
          inLanguage:     'en-IN',
          actionPlatform: [
            'https://schema.org/DesktopWebPlatform',
            'https://schema.org/MobileWebPlatform',
          ],
        },
        result: { '@type': 'Reservation', name: 'Cardiology appointment' },
      },
    },
  }
}

// ── Helpers ────────────────────────────────────────────────────────────────
export function stripHtml(html: string) {
  return (html || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
}

export function wordCount(html: string) {
  return stripHtml(html).split(/\s+/).filter(Boolean).length
}

export function schemaScript(schema: object) {
  return JSON.stringify(schema)
}
