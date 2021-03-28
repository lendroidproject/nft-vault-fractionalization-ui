import React from 'react'
import ReactDOM from 'react-dom'
import styled from 'styled-components'
import B20Spinner from 'components/common/B20Spinner'

const Wrapper = styled.div`
  position: fixed;
  z-index: -101;
  left: 0;
  top: 0;
  width: 100vw;
  height: 100vh;
  opacity: 0;
  background: transparent;
  transition: all 0.2s;
  &.show {
    z-index: 201;
    opacity: 1;
    background: var(--color-opacity09);
  }
`

const Content = styled.div`
  max-width: 424px;
  background: var(--linear-gradient1);
  padding: 0 60px 28px;
  position: relative;
  h2 {
    margin-bottom: 20px;
  }
`

function SpinnerModal({ show, children }) {
  if (typeof document === 'undefined') {
    return null;
  }
  return ReactDOM.createPortal(
    (<Wrapper className={`flex-all ${show ? 'show' : 'hide'}`}>
      <Content className="center flex-center flex-column justify-center">
        <B20Spinner style={{ maxWidth: 200 }}/>
        <h2 className="col-white">Loading. Please Wait.</h2>
        <h3 className="light col-white">Patience is a virtue. Not really. Just wanted to give you reading material while you wait anxiously.</h3>
        {children}
      </Content>
    </Wrapper>),
    document.body
  )
}

export default SpinnerModal