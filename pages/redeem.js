import React from 'react'
import { useRouter } from 'next/router'

import SEO from 'layouts/seo'
import Redeem from 'components/Redeem'

export default function HomePage() {
  const router = useRouter()
  return (
    <>
      <SEO title="Home" />
      <Redeem />
    </>
  )
}
