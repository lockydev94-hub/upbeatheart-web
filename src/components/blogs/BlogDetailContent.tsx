'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Calendar, Tag, Share2, Facebook, Twitter, LinkIcon, CheckCircle, Clock, ChevronRight, Home } from 'lucide-react'
import type { Blog } from '@/types/firestore'
import LazyImage from '@/components/ui/LazyImage'

interface Props {
  blog: Blog
  related: Blog[]
  settings: any
}

export default function BlogDetailContent({ blog, related, settings }: Props) {
  const date = blog.publishedAt
    ? new Date(blog.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : ''

  const wordCount = blog.content.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length
  const readTime  = Math.max(1, Math.ceil(wordCount / 200))

  const contentRef = useRef<HTMLDivElement>(null)

  // Activate image sliders in rich content
  useEffect(() => {
    if (!contentRef.current) return
    const sliders = contentRef.current.querySelectorAll<HTMLElement>('.blog-slider')
    sliders.forEach(slider => {
      const track = slider.querySelector<HTMLElement>('.blog-slider-track')
      if (!track) return
      const imgs = track.querySelectorAll('img')
      let cur = 0
      const dots: HTMLSpanElement[] = []
      const goTo = (n: number) => {
        cur = Math.max(0, Math.min(imgs.length - 1, n))
        track.style.transform = `translateX(-${cur * 100}%)`
        dots.forEach((d, i) => d.classList.toggle('active', i === cur))
      }
      const dotsWrap = document.createElement('div')
      dotsWrap.className = 'blog-slider-dots'
      imgs.forEach((_, i) => {
        const d = document.createElement('span')
        if (i === 0) d.className = 'active'
        d.onclick = () => goTo(i)
        dotsWrap.appendChild(d)
        dots.push(d)
      })
      slider.appendChild(dotsWrap)
      const prev = slider.querySelector<HTMLButtonElement>('.prev')
      const next = slider.querySelector<HTMLButtonElement>('.next')
      if (prev) prev.onclick = () => goTo(cur - 1)
      if (next) next.onclick = () => goTo(cur + 1)
    })
  }, [blog.content])

  const shareUrl = typeof window !== 'undefined' ? window.location.href : `https://upbeatheart.com/blogs/${blog.slug}`

  const [copied, setCopied] = useState(false)
  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <main className="min-h-screen bg-bg">

      {/* ── Breadcrumb ─────────────────────────────────────────────────────── */}
      <nav aria-label="Breadcrumb" className="bg-white border-b border-border">
        <div className="container-max px-4 md:px-8 py-3">
          <ol className="flex items-center gap-1.5 flex-wrap" itemScope itemType="https://schema.org/BreadcrumbList">
            <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem" className="flex items-center gap-1.5">
              <Link
                href="/"
                itemProp="item"
                className="flex items-center gap-1 text-text-secondary hover:text-primary transition-colors text-xs font-medium"
              >
                <Home size={12} />
                <span itemProp="name">Home</span>
              </Link>
              <meta itemProp="position" content="1" />
            </li>

            <li className="flex items-center">
              <ChevronRight size={12} className="text-border" />
            </li>

            <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem" className="flex items-center gap-1.5">
              <Link
                href="/blogs"
                itemProp="item"
                className="text-text-secondary hover:text-primary transition-colors text-xs font-medium"
              >
                <span itemProp="name">Articles</span>
              </Link>
              <meta itemProp="position" content="2" />
            </li>

            <li className="flex items-center">
              <ChevronRight size={12} className="text-border" />
            </li>

            <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem" className="flex items-center min-w-0">
              {blog.category && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/8 text-primary border border-primary/15 mr-2 shrink-0">
                  {blog.category}
                </span>
              )}
              <span
                itemProp="name"
                className="text-xs font-semibold text-navy truncate max-w-[200px] md:max-w-xs lg:max-w-lg"
                title={blog.title}
              >
                {blog.title}
              </span>
              <meta itemProp="position" content="3" />
            </li>
          </ol>
        </div>
      </nav>

      {/* Hero — cover image + gradient overlay */}
      <div className="relative h-[55vh] min-h-[340px] max-h-[520px] overflow-hidden">
        {blog.coverImage ? (
          <LazyImage
            src={blog.coverImage}
            alt={blog.title}
            revealBlur revealScale
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full gradient-dark" />
        )}
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/60 to-transparent" />

        {/* Hero content */}
        <div className="absolute bottom-0 left-0 right-0 z-10 pb-10 pt-16">
          <div className="container-max px-4 md:px-8 max-w-4xl">
            {blog.category && (
              <span className="inline-block text-[11px] font-extrabold px-3 py-1 rounded-full bg-primary text-white mb-4 uppercase tracking-widest">
                {blog.category}
              </span>
            )}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white leading-tight tracking-tight mb-4">
              {blog.title}
            </h1>
            <div className="flex items-center gap-4 flex-wrap">
              {date && (
                <span className="flex items-center gap-1.5 text-white/60 text-sm font-medium">
                  <Calendar size={13} /> {date}
                </span>
              )}
              <span className="flex items-center gap-1.5 text-white/60 text-sm font-medium">
                <Clock size={13} /> {readTime} min read
              </span>
              {blog.tags?.slice(0, 3).map(tag => (
                <span key={tag} className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full bg-white/15 text-white/80 font-semibold backdrop-blur-sm">
                  <Tag size={10} /> {tag}
                </span>
              ))}
              {/* Doctor verified badge */}
              <span className="flex items-center gap-1.5 text-green text-[11px] font-bold">
                <CheckCircle size={13} /> Doctor Verified
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Article body */}
      <div className="container-max px-4 md:px-8 py-12 max-w-[1200px]">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10">

          {/* Main article */}
          <article>
            {/* Excerpt */}
            {blog.excerpt && (
              <p className="text-lg text-text-secondary leading-relaxed mb-8 pb-8 border-b border-border font-medium">
                {blog.excerpt}
              </p>
            )}

            {/* Author strip */}
            <div className="flex items-center gap-4 mb-10 p-5 bg-white rounded-2xl border border-border shadow-sm">
              {settings?.doctorPhotoUrl ? (
                <div className="relative w-14 h-14 rounded-full shrink-0 overflow-hidden border-2 border-primary/20">
                  <LazyImage
                    src={settings.doctorPhotoUrl}
                    alt={settings.doctorName}
                    revealBlur
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-14 h-14 rounded-full gradient-primary flex items-center justify-center text-white font-extrabold text-xl shrink-0">
                  {(settings?.doctorName ?? 'D').charAt(0)}
                </div>
              )}
              <div>
                <p className="font-bold text-navy text-sm">{settings?.doctorName ?? 'Dr. Specialist'}</p>
                <p className="text-text-secondary text-xs mt-0.5">{settings?.doctorTitle ?? 'Consultant Cardiologist'}</p>
                {settings?.doctorQuals && (
                  <p className="text-text-secondary text-[11px] mt-0.5 opacity-70">{settings.doctorQuals}</p>
                )}
              </div>
              <div className="ml-auto shrink-0 hidden sm:block">
                <span className="text-[10px] font-bold px-3 py-1.5 rounded-full bg-green/10 text-green border border-green/20">
                  ✓ Verified Content
                </span>
              </div>
            </div>

            {/* Rich HTML content */}
            <div
              ref={contentRef}
              className="blog-content prose-blog"
              dangerouslySetInnerHTML={{ __html: injectHeadingIds(blog.content) }}
            />

            {/* Tags */}
            {blog.tags?.length > 0 && (
              <div className="mt-12 pt-8 border-t border-border">
                <p className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-3">Tags</p>
                <div className="flex flex-wrap gap-2">
                  {blog.tags.map(tag => (
                    <span key={tag} className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary/8 border border-primary/20 text-primary text-xs font-semibold">
                      <Tag size={10} /> {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Share */}
            <div className="mt-8 pt-8 border-t border-border">
              <p className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-4">Share this article</p>
              <div className="flex items-center gap-3">
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1877F2] text-white text-xs font-bold hover:opacity-90 transition"
                >
                  <Facebook size={14} /> Facebook
                </a>
                <a
                  href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(blog.title)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1DA1F2] text-white text-xs font-bold hover:opacity-90 transition"
                >
                  <Twitter size={14} /> Twitter
                </a>
                <button
                  onClick={copyLink}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${copied ? 'bg-green/10 border border-green/30 text-green' : 'bg-bg border border-border text-text-secondary hover:border-primary/40 hover:text-primary'}`}
                >
                  {copied ? <CheckCircle size={14} /> : <LinkIcon size={14} />}
                  {copied ? 'Copied!' : 'Copy Link'}
                </button>
              </div>
            </div>

            {/* Appointment CTA */}
            <div className="mt-12 rounded-2xl overflow-hidden">
              <div className="gradient-dark p-8 text-center">
                <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-2">Concerned about your heart?</p>
                <h3 className="text-2xl md:text-3xl font-extrabold text-white mb-3">
                  Book a Consultation Today
                </h3>
                <p className="text-white/70 text-sm mb-6 max-w-sm mx-auto">
                  Our specialist cardiologist is available for in-person and online consultations.
                </p>
                <Link
                  href="/appointment"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-green text-white font-bold text-sm hover:bg-green-light transition shadow-lg"
                >
                  Book Appointment <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </article>

          {/* Sidebar */}
          <aside className="space-y-6 sticky top-24 self-start">

            {/* Table of contents (auto-generated from h2/h3 in content) */}
            <TOCWidget html={blog.content} />

            {/* Related articles */}
            {related.length > 0 && (
              <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
                <div className="p-5 border-b border-border">
                  <h3 className="text-sm font-extrabold text-navy">Related Articles</h3>
                </div>
                <div className="divide-y divide-border">
                  {related.map(b => (
                    <RelatedCard key={b.id} blog={b} />
                  ))}
                </div>
              </div>
            )}

            {/* WhatsApp CTA */}
            {settings?.whatsapp && (
              <a
                href={`https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('Hi, I read your article "' + blog.title + '" and have a question.')}`}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 p-5 bg-green/8 border border-green/20 rounded-2xl group hover:bg-green/15 transition"
              >
                <div className="w-10 h-10 rounded-xl bg-green flex items-center justify-center shrink-0 text-white text-lg font-bold">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-green">Chat on WhatsApp</p>
                  <p className="text-xs text-text-secondary">Ask about this article</p>
                </div>
                <ArrowRight size={14} className="ml-auto text-green group-hover:translate-x-0.5 transition-transform" />
              </a>
            )}
          </aside>
        </div>
      </div>
    </main>
  )
}

// Slug helper for TOC anchors
function toAnchor(text: string, index: number) {
  return `toc-${index}-${text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`
}

// Inject id attributes into h2/h3 tags so TOC links work
export function injectHeadingIds(html: string): string {
  let i = 0
  return html.replace(/<h([23])([^>]*)>(.*?)<\/h[23]>/gi, (_m, level, attrs, inner) => {
    const text = inner.replace(/<[^>]+>/g, '')
    const anchor = toAnchor(text, i++)
    return `<h${level}${attrs} id="${anchor}">${inner}</h${level}>`
  })
}

// Auto-generated TOC from content headings
function TOCWidget({ html }: { html: string }) {
  const matches = Array.from(html.matchAll(/<h([23])[^>]*>(.*?)<\/h[23]>/gi))
  const headings = matches.map((m, i) => ({
    level: parseInt(m[1]),
    text:  m[2].replace(/<[^>]+>/g, ''),
    anchor: toAnchor(m[2].replace(/<[^>]+>/g, ''), i),
  })).slice(0, 8)

  if (headings.length < 2) return null

  const scrollTo = (anchor: string) => {
    const el = document.getElementById(anchor)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
      <div className="p-5 border-b border-border">
        <h3 className="text-sm font-extrabold text-navy">In this Article</h3>
      </div>
      <nav className="p-4">
        <ul className="space-y-2">
          {headings.map((h, i) => (
            <li key={i} className={h.level === 3 ? 'pl-4' : ''}>
              <button
                onClick={() => scrollTo(h.anchor)}
                className="flex items-start gap-2 text-xs text-text-secondary hover:text-primary transition-colors cursor-pointer leading-snug group w-full text-left"
              >
                <span className="w-1 h-1 rounded-full bg-primary/40 group-hover:bg-primary shrink-0 mt-1.5 transition-colors" />
                {h.text}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}

function RelatedCard({ blog }: { blog: Blog }) {
  return (
    <Link href={`/blogs/${blog.slug}`} className="flex items-center gap-3 p-4 hover:bg-bg transition group">
      <div className="relative w-16 h-14 rounded-xl overflow-hidden shrink-0 bg-bg border border-border">
        {blog.coverImage ? (
          <LazyImage
            src={blog.coverImage}
            alt={blog.title}
            revealBlur revealScale
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full gradient-primary opacity-50 flex items-center justify-center text-white font-extrabold">
            {blog.title.charAt(0)}
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-navy leading-snug line-clamp-2 group-hover:text-primary transition-colors">
          {blog.title}
        </p>
        {blog.category && (
          <span className="text-[10px] text-text-secondary font-medium mt-1 block">{blog.category}</span>
        )}
      </div>
    </Link>
  )
}
