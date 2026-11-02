'use client'

import Link from 'next/link'
import { ArrowRight, Calendar } from 'lucide-react'
import type { Blog } from '@/types/firestore'
import LazyImage from '@/components/ui/LazyImage'
import { cld } from '@/lib/cloudinary'
import useScrollReveal, { type ScrollDirection } from '@/hooks/useScrollReveal'
import Reveal from '@/components/ui/Reveal'

interface Props { blogs: Blog[] }

function BlogCard({ blog, featured = false, visible = false, direction, delay = 0 }: {
  blog: Blog; featured?: boolean; visible?: boolean; direction?: ScrollDirection; delay?: number
}) {
  const date = blog.publishedAt
    ? new Date(blog.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : ''

  return (
    <Reveal
      effect="skew-rise"
      delay={delay}
      visible={visible}
      direction={direction}
      className={featured ? 'md:col-span-2' : undefined}
    >
      <Link
        href={`/blogs/${blog.slug}`}
        className={`group flex flex-col h-full bg-white rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-[0_12px_40px_rgba(21,101,216,0.14)] hover:border-primary/30 hover:-translate-y-1 transition-all duration-300 ${featured ? 'md:flex-row' : ''}`}
      >
        {/* Image — admin crops blog covers to 1200×630, so the card keeps that
            ratio instead of a fixed height that would chop the artwork. */}
        <div className={`relative overflow-hidden bg-bg shrink-0 ${featured ? 'md:w-5/12 h-52 md:h-auto' : 'aspect-[1200/630]'}`}>
          {blog.coverImage ? (
            <LazyImage
              src={cld.cover(blog.coverImage)}
              alt={blog.title}
              revealBlur
              revealScale
              className="w-full h-full object-cover group-hover:scale-[1.07] transition-transform duration-700 ease-out"
            />
          ) : (
            <div className="w-full h-full gradient-primary opacity-40 flex items-center justify-center">
              <span className="text-white/30 text-6xl font-extrabold">{blog.title.charAt(0)}</span>
            </div>
          )}
          {/* Hover gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-navy/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          {/* Category pill — slides down on hover */}
          {blog.category && (
            <div className="absolute top-3 left-3 transform -translate-y-1 group-hover:translate-y-0 transition-transform duration-200">
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-primary text-white shadow-md">
                {blog.category}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className={`flex flex-col flex-1 p-5 ${featured ? 'md:p-7' : ''}`}>
          {/* Meta */}
          <div className="flex items-center gap-3 mb-3">
            {date && (
              <span className="flex items-center gap-1 text-[11px] text-text-secondary font-medium">
                <Calendar size={10} />
                {date}
              </span>
            )}
            {blog.tags?.[0] && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-bg border border-border text-text-secondary font-semibold">
                {blog.tags[0]}
              </span>
            )}
          </div>

          {/* Title — color shifts on hover */}
          <h3 className={`font-extrabold text-navy leading-tight mb-2 group-hover:text-primary transition-colors duration-200 ${featured ? 'text-xl md:text-2xl' : 'text-sm'}`}>
            {blog.title}
          </h3>

          {/* Excerpt */}
          {blog.excerpt && (
            <p className={`text-text-secondary leading-relaxed flex-1 ${featured ? 'text-sm line-clamp-3' : 'text-[12px] line-clamp-2'}`}>
              {blog.excerpt}
            </p>
          )}

          {/* Gradient bottom line — grows on hover */}
          <div className="relative mt-4 overflow-hidden">
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-border rounded-full">
              <div className="h-full gradient-primary w-0 group-hover:w-full transition-all duration-400 rounded-full" />
            </div>
            <div className="flex items-center gap-1.5 pb-2 text-[12px] font-bold text-primary group-hover:gap-2.5 transition-all duration-200">
              Read Article
              <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform duration-150" />
            </div>
          </div>
        </div>
      </Link>
    </Reveal>
  )
}

export default function BlogsPreview({ blogs }: Props) {
  // Signature effect: cards rise out of a skew, header drops in from above.
  const { ref, visible, direction } = useScrollReveal<HTMLElement>({ offset: 0.08 })
  if (!blogs.length) return null

  const [featured, ...rest] = blogs

  return (
    <section ref={ref} className="py-10 md:py-12 bg-bg overflow-hidden">
      <div className="container-max px-4 md:px-8">

        {/* Header — fade down */}
        <Reveal
          effect="fade-down"
          visible={visible}
          direction={direction}
          className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-7"
        >
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/6 border border-primary/15 text-primary text-[11px] font-bold uppercase tracking-widest mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              Medical Insights
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-navy leading-tight tracking-tight">
              Latest Articles &amp; Health Tips
            </h2>
            <p className="text-text-secondary text-base mt-2 leading-relaxed">
              Evidence-based cardiology content, written and verified by our specialist.
            </p>
          </div>
          <Link
            href="/blogs"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm border-2 border-primary/25 text-primary hover:bg-primary hover:text-white hover:-translate-y-0.5 transition-all duration-200 shrink-0"
          >
            View All Articles
            <ArrowRight size={15} />
          </Link>
        </Reveal>

        {/* Grid — staggered reveal */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {featured && <BlogCard blog={featured} featured visible={visible} direction={direction} delay={100} />}
          {rest.slice(0, 2).map((blog, i) => (
            <BlogCard key={blog.id} blog={blog} visible={visible} direction={direction} delay={200 + i * 120} />
          ))}
        </div>
      </div>
    </section>
  )
}
