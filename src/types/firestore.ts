// ─── Site Settings ────────────────────────────────────────────────────────────
// Mirrors EXACTLY the SiteSettings interface in admin-dashboard/src/pages/SettingsPage.tsx
// and the Firestore document at settings/site

export interface ClinicHour {
  day:    string   // 'Monday' | 'Tuesday' | ...
  open:   string   // '09:00'
  close:  string   // '17:00'
  closed: boolean
}

export interface SiteSettings {
  // ── Branding (Tab 1) ──────────────────────────────────────────────────────
  logoUrl:          string   // Cloudinary URL — upbeatheart/branding
  faviconUrl:       string   // Cloudinary URL — PNG 512×512
  ogImageUrl:       string   // Cloudinary URL — 1200×630

  // ── Doctor Profile (Tab 2) ────────────────────────────────────────────────
  doctorName:       string   // e.g. "Dr. Arun Kumar"
  doctorTitle:      string   // e.g. "Consultant Cardiologist"
  doctorBio:        string   // 2–4 sentences, max 500 chars
  doctorPhotoUrl:   string   // Cloudinary URL — headshot
  doctorQuals:      string   // e.g. "MBBS, MD, DM (Cardiology)"
  doctorExperience: string   // e.g. "15+ years"
  hospitalName:     string   // e.g. "CARE Hospitals"
  hospitalAddress:  string   // e.g. "4th Floor, Cardiac Wing, ..."

  // ── Contact (Tab 3) ───────────────────────────────────────────────────────
  phone:            string   // Primary — "+91 98765 43210"
  phoneAlt:         string   // Alternate
  whatsapp:         string   // WhatsApp number (may differ from phone)
  email:            string   // Primary email
  emailAlt:         string   // Appointments/admin email
  address:          string   // Full multiline address
  mapsEmbedUrl:     string   // Google Maps embed src
  mapsLink:         string   // "Get Directions" href
  clinicHours:      ClinicHour[]

  // ── Social Media (Tab 4) ──────────────────────────────────────────────────
  facebook:          string  // full URL or handle stored as-is
  instagram:         string
  youtube:           string
  linkedin:          string
  twitter:           string
  googleBusiness:    string  // Google Business Profile URL
  googleMapsProfile: string  // Google Maps Business Listing URL

  // ── Education Video (Doctor Profile Tab) ────────────────────────────────────
  educationVideoUrl:   string   // Cloudinary video URL OR YouTube URL
  educationVideoTitle: string   // Section heading
  educationVideoDesc:  string   // Section body text

  // ── Website / SEO (Tab 5) ─────────────────────────────────────────────────
  siteTitle:        string   // "UpBeat Heart"
  siteTitleSuffix:  string   // "| Cardiology Care"
  siteDescription:  string   // default meta description, 120–160 chars
  gaId:             string   // GA4 Measurement ID "G-XXXXXXXXXX"
  razorpayMode:     'test' | 'live'
  appointmentsOpen: boolean
  appointmentNote:  string   // shown when appointmentsOpen = false

  // ── Donations / Payment ──────────────────────────────────────────────────
  donationEnabled:     boolean
  razorpayKeyId:       string
  upiId:               string
  upiName:             string
  upiQrUrl:            string
  bankAccountName:     string
  bankAccountNumber:   string
  bankIfsc:            string
  bankName:            string
  bankBranch:          string

  // ── Home Page Section Visibility ────────────────────────────────────────────
  homeSections: {
    hero:        boolean
    stats:       boolean
    video:       boolean
    diseases:    boolean
    campaigns:   boolean
    ngo:         boolean
    blogs:       boolean
    gallery:     boolean
    reviews:     boolean
    donate:      boolean
    appointment: boolean
  }

  chequePayableTo:     string
  donationNote:        string

  // ── Meta (set by admin on save) ───────────────────────────────────────────
  updatedAt?: any
  updatedBy?: string
}

// ─── Appointment ──────────────────────────────────────────────────────────────
export interface Appointment {
  id?:           string
  patientName:   string
  patientPhone:  string
  patientEmail?: string
  preferredDate: string      // YYYY-MM-DD
  preferredTime: string
  reason:        string
  visitType:     'first' | 'followup'
  age?:          string
  gender?:       string
  reports?:      string[]    // Cloudinary URLs
  doctorId:      string
  doctorName:    string
  referredBy?:   string
  status:        'pending' | 'confirmed' | 'cancelled' | 'completed'
  paymentStatus: 'unpaid' | 'paid'
  patientId?:    string      // UBH-XXXXXX
  createdAt?:    any
}

// ─── Campaign ─────────────────────────────────────────────────────────────────
export interface Campaign {
  id:                string
  slug?:             string
  patientName:       string
  patientStory:      string
  diagnosis:         string
  treatmentRequired: string
  estimatedCost:     number
  amountRaised:      number
  photos:            string[]
  videos:            string[]
  consentSigned:     boolean
  hospital:          string
  doctorVerified:    boolean
  status:            'published' | 'active' | 'completed' | 'paused' | 'closed'
  updates:           { text: string; date: string }[]
  category?:         string
  tags?:             string[]
  createdAt?:        any
  updatedAt?:        any
}

// ─── Donation ─────────────────────────────────────────────────────────────────
export interface Donation {
  id?:                string
  campaignId:         string
  campaignName:       string
  donorName:          string
  donorEmail:         string
  donorPhone?:        string
  amount:             number
  razorpayPaymentId?: string
  razorpayOrderId?:   string
  status:             'created' | 'paid' | 'failed'
  anonymous:          boolean
  createdAt?:         any
}

// ─── Blog ─────────────────────────────────────────────────────────────────────
export interface Blog {
  id:          string
  title:       string
  slug:        string
  content:     string   // rich HTML
  excerpt:     string
  coverImage:  string
  category:    string
  tags:        string[]
  status:      string
  publishedAt?: any
  createdBy?:  string
  createdAt?:  any
  updatedAt?:  any
  seo: {
    metaTitle:       string
    metaDescription: string
    canonical:       string
  }
}

// ─── Disease / Treatment ──────────────────────────────────────────────────────
export interface Disease {
  id:                string
  title:             string
  slug:              string
  tagline?:          string
  category:          string
  icdCode?:          string
  overview:          string
  causes:            string
  riskFactors:       string[]
  symptoms:          string
  earlyWarningSigns: string[]
  diagnosis:         string
  treatment:         string
  precautions:       string
  lifestyle?:        string
  whenToSeeDoctor:   string[]
  faqs:              { q: string; a: string }[]
  relatedDiseases?:  string[]        // slugs of related disease docs
  coverImage:        { url: string; publicId?: string; alt?: string } | string | null
  images?:           { url: string; publicId?: string; caption: string; alt: string }[]
  videos?:           {
    cloudinaryUrl?:   string
    youtubeUrl?:      string
    title:            string
    description?:     string
    thumbnailUrl?:    string
    durationSeconds?: number
  }[]
  infographics?:     { url: string; publicId?: string; title: string }[]
  doctorVerified?:   boolean         // set by Doctor App on approval
  approvedBy?:       string
  approvedAt?:       any
  publishedAt?:      any
  updatedAt?:        any
  visitCount?:       number
  status?:           string
  seo: {
    metaTitle:       string
    metaDescription: string
    keywords?:       string[]
    focusKeyword?:   string
    canonical?:      string
    ogTitle?:        string
    ogDescription?:  string
    ogImage?:        string
  }
}

// ─── NGO ──────────────────────────────────────────────────────────────────────
export interface NGO {
  id:             string
  name:           string
  contactPerson:  string
  email:          string
  phone:          string
  address:        string
  description:    string
  website?:       string
  logoUrl?:       string
  photos?:        string[]
  status:         'pending' | 'approved' | 'active' | 'inactive'
  createdAt?:     string
}

// ─── Review ───────────────────────────────────────────────────────────────────
export interface Review {
  id:          string
  patientName: string
  rating:      number   // 1–5
  text:        string
  photoURL?:   string
  videoURL?:   string
  source:      'manual' | 'google'
  status:      'published'
  createdAt?:  any
}

// ─── Gallery ──────────────────────────────────────────────────────────────────
export interface GalleryItem {
  id:            string
  type:          'photo' | 'video'
  url:           string
  thumbnailUrl?: string
  caption:       string
  category:      'clinic' | 'health_camp' | 'community' | 'awards'
  duration?:     number
  status:        'published'
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────
export interface FAQItem {
  id:       string
  category: string
  question: string
  answer:   string
  order:    number
}

export interface LegalSection {
  id:      string
  heading: string
  body:    string
}
