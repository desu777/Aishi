import { redirect } from 'next/navigation'

export default function DocsPage() {
  // Redirect to the main documentation index
  redirect('/docs/index')
}