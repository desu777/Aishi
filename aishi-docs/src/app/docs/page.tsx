import { redirect } from 'next/navigation'

export default function DocsIndexRedirect() {
  // Keep /docs working by redirecting to rendered index.mdx
  redirect('/docs/index')
}

