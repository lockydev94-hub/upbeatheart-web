import { getSiteSettings }      from '@/lib/firestore/settings'
import { getPublishedDiseases }  from '@/lib/firestore/diseases'
import { getPublishedCampaigns } from '@/lib/firestore/campaigns'
import { getPublishedReviews }   from '@/lib/firestore/reviews'
import { getPublishedGallery }   from '@/lib/firestore/gallery'
import { getPublishedBlogs }     from '@/lib/firestore/blogs'
import { getApprovedNGOs }       from '@/lib/firestore/ngos'
import { homePageGraph, buildMetadata } from '@/lib/seo'
import type { Metadata } from 'next'

import HeroSection       from '@/components/home/HeroSection'
import StatsStrip        from '@/components/home/StatsStrip'
import VideoSection      from '@/components/home/VideoSection'
import DiseasesSection   from '@/components/home/DiseasesSection'
import CampaignHighlight from '@/components/home/CampaignHighlight'
import NGOSection        from '@/components/home/NGOSection'
import BlogsPreview      from '@/components/home/BlogsPreview'
import ReviewsCarousel   from '@/components/home/ReviewsCarousel'
import GallerySection    from '@/components/home/GallerySection'
import AppointmentCTA    from '@/components/home/AppointmentCTA'
import DonateSection     from '@/components/home/DonateSection'

export const revalidate = 60

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSiteSettings()
  return buildMetadata({
    title:       s.siteTitle || 'UpBeat Heart',
    description: s.siteDescription || `Expert cardiology care by ${s.doctorName}. Book appointments, learn about heart conditions, and access patient assistance programs.`,
    path:        '/',
    image:       s.ogImageUrl,
    settings:    s,
    type:        'website',
    keywords: [
      'cardiologist',
      'cardiology',
      'heart specialist',
      'heart doctor',
      s.doctorName,
      s.hospitalName,
      'heart treatment India',
      'cardiac care',
      'heart disease specialist',
      'patient assistance cardiology',
    ].filter(Boolean) as string[],
  })
}

export default async function HomePage() {
  const [settings, diseases, campaigns, reviews, gallery, blogs, ngos] = await Promise.all([
    getSiteSettings(),
    getPublishedDiseases(20),
    getPublishedCampaigns(3),
    getPublishedReviews(),
    getPublishedGallery(),
    getPublishedBlogs(3),
    getApprovedNGOs(),
  ])

  const s = settings.homeSections

  // Rich @graph structured data for home page
  const graph = homePageGraph(settings)

  return (
    <>
      {/* ── Structured Data: Full @graph (Physician + Org + WebSite + WebPage) ── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
      />

      <main>
        {/* 1. Hero — always visible */}
        <HeroSection settings={settings} diseases={diseases} />

        {/* 2. Stats strip */}
        {s.stats       && <StatsStrip />}

        {/* 3. Patient Education video */}
        {s.video       && <VideoSection settings={settings} />}

        {/* 4. Diseases section */}
        {s.diseases    && <DiseasesSection diseases={diseases} />}

        {/* 5. Active patient assistance campaigns */}
        {s.campaigns   && <CampaignHighlight campaigns={campaigns} />}

        {/* 6. NGO partners */}
        {s.ngo         && <NGOSection ngos={ngos} />}

        {/* 7. Latest blogs */}
        {s.blogs       && <BlogsPreview blogs={blogs} />}

        {/* 8. Gallery section */}
        {s.gallery     && <GallerySection items={gallery} />}

        {/* 9. Patient reviews carousel */}
        {s.reviews     && <ReviewsCarousel reviews={reviews} />}

        {/* 10. Donate section */}
        {s.donate      && <DonateSection settings={settings} />}

        {/* 11. Book appointment CTA */}
        {s.appointment && <AppointmentCTA settings={settings} />}
      </main>
    </>
  )
}
