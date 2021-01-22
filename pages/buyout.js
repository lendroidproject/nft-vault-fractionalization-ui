import React from 'react'
import { useRouter } from 'next/router'

import SEO from 'layouts/seo'
import Home from 'components/Home'

export default function HomePage() {
  const router = useRouter()
  return (
    <>
      <SEO title="Home" />
      <Home />
    </>
  )
}
