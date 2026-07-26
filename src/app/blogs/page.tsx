import { Suspense } from 'react'
import type { Metadata } from 'next'
import { getPublishedBlogs } from '@/lib/firestore/blogs'
import { getSiteSettings } from '@/lib/firestore/settings'
import BlogsListClient from '@/components/blogs/BlogsListClient'

export const revalidate = 300

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()
  return {
    title: `Health Articles & Cardiology Insights | ${settings?.siteTitle ?? 'UpBeat Heart'}`,
    description: 'Expert-written cardiology articles, heart health tips, and medical insights by our specialist cardiologist.',
    openGraph: {
      title: 'Medical Insights & Cardiology Articles',
      description: 'Evidence-based cardiology content, written and verified by our specialist.',
      type: 'website',
    },
  }
}

export default async function BlogsPage() {
  const blogs = await getPublishedBlogs(50)
  return (
    <main className="min-h-screen bg-bg">
      {/* Hero */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0 gradient-dark opacity-95" />
        {/* ECG decoration */}
        <svg className="absolute bottom-0 left-0 w-full opacity-10" viewBox="0 0 1200 80" preserveAspectRatio="none">
          <polyline
            points="0,40 100,40 130,10 150,70 170,10 190,70 210,40 300,40 330,10 350,70 370,10 390,70 410,40 1200,40"
            fill="none" stroke="#18B8E6" strokeWidth="2"
          />
        </svg>
        <div className="container-max px-4 md:px-8 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-cyan text-[11px] font-bold uppercase tracking-widest mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan animate-pulse" />
            Medical Insights
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight tracking-tight max-w-3xl">
            Articles & Health Tips
          </h1>
          <p className="text-white/70 text-lg mt-4 max-w-xl leading-relaxed">
            Evidence-based cardiology content, written and verified by our specialist cardiologist.
          </p>
        </div>
      </section>

      {/* Blogs list with filters — client component */}
      <Suspense fallback={<BlogsListSkeleton />}>
        <BlogsListClient blogs={blogs} />
      </Suspense>
    </main>
  )
}

function BlogsListSkeleton() {
  return (
    <section className="py-16">
      <div className="container-max px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
              <div className="h-48 skeleton" />
              <div className="p-5 space-y-3">
                <div className="h-3 w-20 skeleton rounded-full" />
                <div className="h-5 skeleton rounded-lg" />
                <div className="h-4 skeleton rounded-lg" />
                <div className="h-4 w-3/4 skeleton rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
