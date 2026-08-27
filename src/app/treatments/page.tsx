import { redirect } from 'next/navigation'

// Legacy /treatments route — the public site lists treatments under /diseases.
// Redirect (301) so old links, bookmarks and search engines land correctly.
export default function TreatmentsPage() {
  redirect('/diseases')
}
