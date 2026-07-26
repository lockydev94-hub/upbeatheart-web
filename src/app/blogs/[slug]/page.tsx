import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getBlogBySlug, getPublishedBlogs, getAllBlogSlugs } from '@/lib/firestore/blogs'
import { getSiteSettings } from '@/lib/firestore/settings'
import BlogDetailContent from '@/components/blogs/BlogDetailContent'
import { articleSchema, breadcrumbSchema, buildMetadata, wordCount } from '@/lib/seo'
import type { Blog } from '@/types/firestore'

export const revalidate = 1800

export async function generateStaticParams() {
  const slugs = await getAllBlogSlugs()
  return slugs.map(slug => ({ slug }))
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const [blog, settings] = await Promise.all([
    getBlogBySlug(params.slug),
    getSiteSettings(),
  ])
  if (!blog || !settings) return { title: 'Article Not Found' }

  return buildMetadata({
    title:       blog.seo?.metaTitle || blog.title,
    description: blog.seo?.metaDescription || blog.excerpt,
    path:        `/blogs/${params.slug}`,
    canonical:   blog.seo?.canonical ? blog.seo.canonical.replace('https://upbeatheart.com', '') : undefined,
    image:       blog.coverImage || settings.ogImageUrl,
    imageAlt:    blog.title,
    settings,
    type:        'article',
    publishedAt: blog.publishedAt ? String(blog.publishedAt) : undefined,
    keywords:    blog.tags || [],
  })
}

export default async function BlogSlugPage({ params }: { params: { slug: string } }) {
  const [blog, allBlogs, settings] = await Promise.all([
    getBlogBySlug(params.slug),
    getPublishedBlogs(6),
    getSiteSettings(),
  ])
  if (!blog) notFound()

  // Related: same category, exclude current
  const related = allBlogs.filter(b => b.id !== blog.id && b.category === blog.category).slice(0, 3)
  const fallbackRelated = related.length ? related : allBlogs.filter(b => b.id !== blog.id).slice(0, 3)

  // JSON-LD schemas using seo.ts helpers
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://upbeatheart.com'
  const art = articleSchema({
    title:       blog.title,
    description: blog.excerpt,
    slug:        params.slug,
    coverImage:  blog.coverImage || undefined,
    publishedAt: blog.publishedAt ? String(blog.publishedAt) : undefined,
    authorName:  settings?.doctorName ?? 'Dr. Specialist',
    authorTitle: settings?.doctorTitle ?? 'Consultant Cardiologist',
    category:    blog.category,
    tags:        blog.tags,
    wordCount:   wordCount(blog.content || ''),
  })
  const breadcrumb = breadcrumbSchema([
    { name: 'Home',   url: siteUrl },
    { name: 'Blogs',  url: `${siteUrl}/blogs` },
    { name: blog.title },
  ])

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(art) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <BlogDetailContent blog={blog} related={fallbackRelated} settings={settings} />
    </>
  )
}
