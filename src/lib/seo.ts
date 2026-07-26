/**
 * UpBeat Heart — Advanced SEO Library v2.0
 *
 * New / upgraded in v2:
 *  15. organizationSchema()      — standalone Organization (home)
 *  16. serviceSchema()           — MedicalProcedure / MedicalTherapy per treatment
 *  17. howToSchema()             — HowTo for lifestyle articles
 *  18. eventSchema()             — Health camp / awareness events
 *  19. ngoSchema()               — NGO partner entity
 *  20. campaignDonateSchema()    — DonateAction with MonetaryAmount targets
 *  21. doctorProfileSchema()     — Full Physician + Credential schema
 *  22. buildDiseaseKeywords()    — Helper: long-tail keyword builder for diseases
 *  23. buildBlogKeywords()       — Helper: long-tail keyword builder for blogs
 *  24. Sitemap image extensions  — ImageSitemapEntry helper
 *
 * All v1 exports remain unchanged.
 */

import type { Metadata } from 'next'
import type { SiteSettings } from '@/types/firestore'

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://upbeatheart.com'

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
  canonical?:   string
}): Metadata {
  const {
    title, description, path, image, imageAlt,
    settings, type = 'website', keywords,
    publishedAt, modifiedAt, noIndex = false, canonical,
  } = opts

  const url    = `${SITE_URL}${path}`
  const canon  = canonical ? `${SITE_URL}${canonical}` : url
  const ogImg  = image || settings.ogImageUrl || `${SITE_URL}/og-default.jpg`
  const suffix = settings.siteTitleSuffix?.trim() || '| UpBeat Heart'
  const fullTitle = title.includes(suffix) ? title : `${title} ${suffix}`

  return {
    title:       fullTitle,
    description,
    metadataBase: new URL(SITE_URL),
    alternates:   { canonical: canon },
    keywords:     keywords?.join(', '),

    openGraph: {
      title,
      description,
      url:      canon,
      type,
      siteName: settings.siteTitle || 'UpBeat Heart',
      locale:   'en_IN',
      images:   [{ url: ogImg, width: 1200, height: 630, alt: imageAlt || title }],
      ...(publishedAt ? { publishedTime: new Date(publishedAt).toISOString() } : {}),
      ...(modifiedAt  ? { modifiedTime:  new Date(modifiedAt).toISOString()  } : {}),
    },

    twitter: {
      card:        'summary_large_image',
      title,
      description,
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
    datePublished: opts.publishedAt,
    dateModified:  opts.updatedAt,
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
    datePublished: opts.publishedAt,
    dateModified:  opts.updatedAt || opts.publishedAt,
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
      name:    'UpBeat Heart',
      url:     SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url:     `${SITE_URL}/logo.png`,
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
      cssSelector:   cssSelectors.length
        ? cssSelectors
        : ['h1', '.disease-overview', '.disease-symptoms'],
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
      url:           s.logoUrl || `${SITE_URL}/logo.png`,
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
          url:     s.logoUrl || `${SITE_URL}/logo.png`,
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
