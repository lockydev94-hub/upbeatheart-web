'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Calendar } from 'lucide-react'
import type { Blog } from '@/types/firestore'
import LazyImage from '@/components/ui/LazyImage'

interface Props { blogs: Blog[] }

function useScrollReveal(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, visible }
}

function BlogCard({ blog, featured = false, visible = false, delay = 0 }: {
  blog: Blog; featured?: boolean; visible?: boolean; delay?: number
}) {
  const date = blog.publishedAt
    ? new Date(blog.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : ''

  return (
    <Link
      href={`/blogs/${blog.slug}`}
      className={`group flex flex-col bg-white rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-[0_12px_40px_rgba(21,101,216,0.14)] hover:border-primary/30 hover:-translate-y-1 transition-all duration-300 ${featured ? 'md:flex-row md:col-span-2' : ''}`}
      style={{
        opacity:    visible ? 1 : 0,
        transform:  visible ? 'none' : 'translateY(28px)',
        transition: `opacity 0.55s cubic-bezier(0.22,1,0.36,1) ${delay}ms, transform 0.55s cubic-bezier(0.22,1,0.36,1) ${delay}ms, box-shadow 0.25s ease, border-color 0.25s ease`,
      }}
    >
      {/* Image */}
      <div className={`relative overflow-hidden bg-bg shrink-0 ${featured ? 'md:w-5/12 h-52 md:h-auto' : 'h-44'}`}>
        {blog.coverImage ? (
          <LazyImage
            src={blog.coverImage}
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
  )
}

export default function BlogsPreview({ blogs }: Props) {
  const { ref, visible } = useScrollReveal()
  if (!blogs.length) return null

  const [featured, ...rest] = blogs

  return (
    <section className="py-16 md:py-24 bg-bg">
      <div className="container-max px-4 md:px-8">

        {/* Header — fade down */}
        <div
          className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10"
          style={{
            opacity:    visible ? 1 : 0,
            transform:  visible ? 'none' : 'translateY(-20px)',
            transition: 'opacity 0.6s cubic-bezier(0.22,1,0.36,1), transform 0.6s cubic-bezier(0.22,1,0.36,1)',
          }}
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
        </div>

        {/* Grid — staggered reveal */}
        <div ref={ref} className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {featured && <BlogCard blog={featured} featured visible={visible} delay={100} />}
          {rest.slice(0, 2).map((blog, i) => (
            <BlogCard key={blog.id} blog={blog} visible={visible} delay={200 + i * 120} />
          ))}
        </div>
      </div>
    </section>
  )
}
