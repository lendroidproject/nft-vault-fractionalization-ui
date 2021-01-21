import React from 'react'
import { useRouter } from 'next/router'

import SEO from 'layouts/seo'
import KnowB20 from 'components/KnowB20'

export default function HomePage() {
  const router = useRouter()
  return (
    <>
      <SEO title="Home" />
      <KnowB20 />
    </>
  )
}
