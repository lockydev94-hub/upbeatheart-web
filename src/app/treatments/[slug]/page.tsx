import { redirect } from 'next/navigation'

// Legacy /treatments/[slug] route → /diseases/[slug]
export default function TreatmentsSlugPage({ params }: { params: { slug: string } }) {
  redirect(`/diseases/${params.slug}`)
}
