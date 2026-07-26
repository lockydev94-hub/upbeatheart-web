/**
 * UpBeat Heart — Dynamic Sitemap v2
 * Covers static pages + disease + blog + campaign pages with correct priorities/dates
 */

import type { MetadataRoute } from 'next'
import { getAllDiseaseSlugsWithDates } from '@/lib/firestore/diseases'
import { getAllBlogSlugsWithDates }    from '@/lib/firestore/blogs'
import { getPublishedCampaigns }       from '@/lib/firestore/campaigns'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://upbeatheart.com'

export const revalidate = 3600   // rebuild sitemap every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date().toISOString()

  // ── Static pages ──────────────────────────────────────────────────────────
  const statics: MetadataRoute.Sitemap = [
    { url: SITE_URL,                           lastModified: now, changeFrequency: 'daily',   priority: 1.0  },
    { url: `${SITE_URL}/about`,                lastModified: now, changeFrequency: 'monthly', priority: 0.8  },
    { url: `${SITE_URL}/appointment`,          lastModified: now, changeFrequency: 'weekly',  priority: 0.9  },
    { url: `${SITE_URL}/patient-assistance`,   lastModified: now, changeFrequency: 'daily',   priority: 0.85 },
    { url: `${SITE_URL}/diseases`,             lastModified: now, changeFrequency: 'weekly',  priority: 0.8  },
    { url: `${SITE_URL}/blogs`,                lastModified: now, changeFrequency: 'daily',   priority: 0.75 },
    { url: `${SITE_URL}/gallery`,              lastModified: now, changeFrequency: 'weekly',  priority: 0.6  },
    { url: `${SITE_URL}/reviews`,              lastModified: now, changeFrequency: 'weekly',  priority: 0.65 },
    { url: `${SITE_URL}/ngo`,                  lastModified: now, changeFrequency: 'monthly', priority: 0.6  },
    { url: `${SITE_URL}/contact`,              lastModified: now, changeFrequency: 'monthly', priority: 0.7  },
    { url: `${SITE_URL}/faq`,                  lastModified: now, changeFrequency: 'monthly', priority: 0.5  },
    { url: `${SITE_URL}/donate`,               lastModified: now, changeFrequency: 'weekly',  priority: 0.7  },
    { url: `${SITE_URL}/privacy`,              lastModified: now, changeFrequency: 'yearly',  priority: 0.3  },
    { url: `${SITE_URL}/terms`,                lastModified: now, changeFrequency: 'yearly',  priority: 0.3  },
  ]

  // ── Dynamic: disease / treatment pages (highest SEO value) ───────────────
  let diseaseSlugs: { slug: string; updatedAt?: string }[] = []
  try { diseaseSlugs = await getAllDiseaseSlugsWithDates() } catch {}

  const diseasePages: MetadataRoute.Sitemap = diseaseSlugs.map(d => ({
    url:             `${SITE_URL}/diseases/${d.slug}`,
    lastModified:    d.updatedAt || now,
    changeFrequency: 'monthly' as const,
    priority:        0.9,
  }))

  // ── Dynamic: blog pages ───────────────────────────────────────────────────
  let blogSlugs: { slug: string; publishedAt?: string }[] = []
  try { blogSlugs = await getAllBlogSlugsWithDates() } catch {}

  const blogPages: MetadataRoute.Sitemap = blogSlugs.map(b => ({
    url:             `${SITE_URL}/blogs/${b.slug}`,
    lastModified:    b.publishedAt || now,
    changeFrequency: 'monthly' as const,
    priority:        0.7,
  }))

  // ── Dynamic: campaign pages ───────────────────────────────────────────────
  let campaigns: { slug?: string; id: string; updatedAt?: string }[] = []
  try { campaigns = await getPublishedCampaigns(100) } catch {}

  const campaignPages: MetadataRoute.Sitemap = campaigns
    .filter(c => c.slug || c.id)
    .map(c => ({
      url:             `${SITE_URL}/patient-assistance/${c.slug || c.id}`,
      lastModified:    c.updatedAt || now,
      changeFrequency: 'weekly' as const,
      priority:        0.75,
    }))

  return [...statics, ...diseasePages, ...blogPages, ...campaignPages]
}
