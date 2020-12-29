import React from 'react'
import { connect } from 'react-redux'
import Marquee from './Marquee'

export default connect(({ metamask }) => ({ metamask }))(function PriceMarquee({ metamask }) {
  // const text = `$HRIMP BALANCE - ${(metamask.$HRIMP || 0).toFixed(2)} $HRIMP PRICE ${
  //   metamask.shrimpPrice || 0.2909
  // } $HRIMP TOTAL SUPPLY ${(metamask.s$HRIMP || 0).toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,')} LST PRICE ${
  //   metamask.lstPrice || '1.234'
  // }.`
  const text = `
    $HRIMP BALANCE - ${(metamask.$HRIMP || 0).toFixed(2)}
    $HRIMP CURRENT SUPPLY ${(metamask.s$HRIMP || 0).toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,')}
    LST BALANCE ${(metamask.LST || 0).toFixed(2)}
    ETH BALANCE ${(metamask.balance || 0).toString().match(/^-?\d+(?:\.\d{0,8})?/)[0]}.
  `

  return (
    <>
      <Marquee text={`${text} ${text} ${text}`} />
      <Marquee text={`${text} ${text} ${text}`} dir={1} />
      <Marquee text={`${text} ${text} ${text}`} dir={3} />
    </>
  )
})
