import React from 'react'
import styled from 'styled-components'
import DoubleMarquee from 'react-double-marquee'

const Wrapper = styled.div`
  font-size: 15px;
  line-height: 22px;
  padding: 3px;
  white-space: nowrap;
  position: absolute;
  top: 0;
  width: 100vw;
  transform-origin: top left;
  text-transform: capitalize;
  background: var(--color-white);
  z-index: ${(props) => 4 - props.dir};
  ${(props) =>
    props.dir === 1 &&
    `
    left: 100%;
    width: 100vh;
    transform: rotate(90deg);
  `}
  ${(props) =>
    props.dir === 2 &&
    `
    top: 100vh;
  `}
  ${(props) =>
    props.dir === 3 &&
    `
    left: 0;
    top: 100vh;
    width: 100vh;
    transform: rotate(270deg);
  `}
`

export default function Marquee({ dir = 0, text }) {
  return (
    <Wrapper dir={dir} className="marquee">
      <DoubleMarquee speed={0.04} delay={0} direction="left" childMargin={5}>
        {text}
      </DoubleMarquee>
    </Wrapper>
  )
}
