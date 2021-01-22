import React from 'react'
import { useRouter } from 'next/router'

import SEO from 'layouts/seo'
import Buyout from 'components/Buyout'

export default function HomePage() {
  const router = useRouter()
  return (
    <>
      <SEO title="Home" />
      <Buyout />
    </>
  )
}
