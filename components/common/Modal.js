import React from 'react'
import ReactDOM from 'react-dom'
import styled from 'styled-components'
import { useMounted } from 'utils/hooks'

export const Overlay = styled.div`
  z-index: 11;
  position: fixed;
  left: 0;
  top: 0;
  width: 100vw;
  height: 100vh;
  background: var(--color-opacity09);
`

export const Content = styled.div`
  margin: auto;
`

export default function Modal({ show, onClose, closeOnOutside, ...props }) {
  const [mouted] = useMounted()
  if (!mouted || !show) return null
  return ReactDOM.createPortal(
    <Overlay onClick={closeOnOutside && onClose} className="modal flex align-center justify-center">
      <Content className="flex-all" onClick={(e) => e.stopPropagation()} {...props} />
    </Overlay>,
    document.body
  )
}
