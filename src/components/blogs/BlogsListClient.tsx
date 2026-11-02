'use client'
import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Calendar, ArrowRight, Search, Tag, X, Clock } from 'lucide-react'
import type { Blog } from '@/types/firestore'
import LazyImage from '@/components/ui/LazyImage'
import { cld } from '@/lib/cloudinary'

const ALL = 'All'

interface Props { blogs: Blog[] }

export default function BlogsListClient({ blogs }: Props) {
  const [search, setSearch]   = useState('')
  const [activeCategory, setCategory] = useState(ALL)

  // Derive unique categories from blogs
  const categories = useMemo(() => {
    const cats = Array.from(new Set(blogs.map(b => b.category).filter(Boolean)))
    return [ALL, ...cats]
  }, [blogs])

  const filtered = useMemo(() => {
    return blogs.filter(b => {
      const matchCat  = activeCategory === ALL || b.category === activeCategory
      const matchSearch = !search.trim() ||
        b.title.toLowerCase().includes(search.toLowerCase()) ||
        b.excerpt?.toLowerCase().includes(search.toLowerCase()) ||
        b.tags?.some(t => t.toLowerCase().includes(search.toLowerCase()))
      return matchCat && matchSearch
    })
  }, [blogs, search, activeCategory])

  const [featured, ...rest] = filtered

  return (
    <section className="py-12 md:py-16">
      <div className="container-max px-4 md:px-8">

        {/* Filter bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-10">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary" />
            <input
              type="text"
              placeholder="Search articles…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/25 text-text-primary placeholder:text-text-secondary"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-error">
                <X size={14} />
              </button>
            )}
          </div>

          {/* Category tabs */}
          <div className="flex items-center gap-2 flex-wrap">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                  activeCategory === cat
                    ? 'bg-primary text-white border-primary shadow-md shadow-primary/20'
                    : 'bg-white text-text-secondary border-border hover:border-primary/40 hover:text-primary'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        {search && (
          <p className="text-sm text-text-secondary mb-6">
            {filtered.length} article{filtered.length !== 1 ? 's' : ''} found for &quot;{search}&quot;
          </p>
        )}

        {filtered.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-16 h-16 rounded-full bg-bg border border-border flex items-center justify-center mx-auto mb-4">
              <Search size={24} className="text-text-secondary" />
            </div>
            <h3 className="text-lg font-bold text-navy mb-2">No articles found</h3>
            <p className="text-text-secondary text-sm">Try a different search term or category.</p>
            <button onClick={() => { setSearch(''); setCategory(ALL) }} className="mt-4 text-primary text-sm font-semibold hover:underline">
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Featured — first blog spans full row on lg */}
            {featured && <BlogCard blog={featured} featured />}
            {rest.map(blog => (
              <BlogCard key={blog.id} blog={blog} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

function BlogCard({ blog, featured = false }: { blog: Blog; featured?: boolean }) {
  const date = blog.publishedAt
    ? new Date(blog.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : ''
  const wordCount = blog.content ? blog.content.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length : 0
  const readTime  = Math.max(1, Math.ceil(wordCount / 200))

  return (
    <Link
      href={`/blogs/${blog.slug}`}
      className={`group flex flex-col bg-white rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-[0_8px_40px_rgba(21,101,216,0.13)] hover:border-primary/20 transition-all duration-300 ${featured ? 'md:flex-row lg:col-span-3 md:col-span-2' : ''}`}
    >
      {/* Cover image — 1200×630 is the ratio the admin crop produces */}
      <div className={`relative overflow-hidden bg-bg shrink-0 ${featured ? 'h-56 md:h-auto md:w-5/12 lg:w-2/5' : 'aspect-[1200/630]'}`}>
        {blog.coverImage ? (
          <LazyImage
            src={cld.cover(blog.coverImage)}
            alt={blog.title}
            revealBlur revealScale
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full gradient-primary opacity-60 flex items-center justify-center">
            <span className="text-white/30 text-7xl font-extrabold select-none">{blog.title.charAt(0)}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-navy/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        {blog.category && (
          <div className="absolute top-3 left-3">
            <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-primary text-white shadow">
              {blog.category}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className={`flex flex-col flex-1 p-5 ${featured ? 'md:p-8 lg:p-10' : ''}`}>
        {/* Meta */}
        <div className="flex items-center gap-3 mb-3 flex-wrap">
          {date && (
            <span className="flex items-center gap-1 text-[11px] text-text-secondary font-medium">
              <Calendar size={11} /> {date}
            </span>
          )}
          <span className="flex items-center gap-1 text-[11px] text-text-secondary font-medium">
            <Clock size={10} /> {readTime} min
          </span>
          {blog.tags?.slice(0, 2).map(tag => (
            <span key={tag} className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-bg border border-border text-text-secondary font-semibold">
              <Tag size={9} /> {tag}
            </span>
          ))}
        </div>

        {/* Title */}
        <h2 className={`font-extrabold text-navy leading-tight mb-3 group-hover:text-primary transition-colors ${featured ? 'text-2xl md:text-3xl' : 'text-base'}`}>
          {blog.title}
        </h2>

        {/* Excerpt */}
        {blog.excerpt && (
          <p className={`text-text-secondary leading-relaxed flex-1 ${featured ? 'text-base line-clamp-3' : 'text-[13px] line-clamp-2'}`}>
            {blog.excerpt}
          </p>
        )}

        {/* CTA */}
        <div className="flex items-center gap-1.5 mt-5 text-[12px] font-bold text-primary group-hover:gap-3 transition-all">
          Read Article
          <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </Link>
  )
}
