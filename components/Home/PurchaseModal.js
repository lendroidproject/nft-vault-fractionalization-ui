import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom'
import styled from 'styled-components'
import Button from 'components/common/Button'
import Input from 'components/common/Input'
import BigNumber from 'bignumber.js'

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
    z-index: 101;
    opacity: 1;
    background: var(--color-opacity09);
  }
`

const Content = styled.div`
  width: 520px;
  max-width: 95%;
  background-color: var(--color-white);
  box-shadow: inset 0 1px 3px 0 rgba(0,0,0,0.5), 6px 2px 4px 0 rgba(0,0,0,0.5);
  padding: 35px 30px 30px;
  position: relative;
  .btn-close {
    position: absolute;
    top: 15px;
    right: 15px;
    border-radius: 50%;
    background-color: #fff;
  }
  .modal-header {
    h1 {
      margin: 0px 0 20px;
    }
  }
  .modal-body {
    padding: 30px 0;
  }
  .message {
    font-size: 16px;
    color: var(--color-dark-grey);
    margin-top: 8px;
    margin-bottom: 20px;
    line-height: 24px;

    &.error {
      color: var(--color-red);
    }
  }
  .modal-footer {
    text-align: right;
    button {
      margin-left: 20px;
      width: 160px;
    }
  }
`

function PurchaseModal({ token0Name, token1Name, token1Balance = 0, token0PerToken1, purchaseTx = '', show, onHide, onContinue }) {
  const [token0Amount, setToken0Amount] = useState(1)
  
  const handleChange = (e) => {
    if (e.target.value) {
      const amount = Math.floor(e.target.value)
      setToken0Amount(amount)
    }
  }

  const token1Amount = new BigNumber((token0Amount || 0)).multipliedBy(token0PerToken1).toNumber()
  const isValid = token1Amount && token1Amount <= token1Balance;

  useEffect(() => {
    if (show) {
      setToken0Amount(1)
      document.getElementById('token0Amount').focus()
    }
  }, [show])

  return ReactDOM.createPortal(
    (<Wrapper className={`flex-all ${show ? 'show' : 'hide'}`} onMouseDown={() => onHide && onHide()}>
      <Content onMouseDown={e => e.stopPropagation()}>
        <button className="btn-close" onClick={() => onHide && onHide()}>
          <img src="/assets/close-btn.svg" alt="Close" />
        </button>
        <div className="modal-header">
          <h1 className="modal-title center">Purchase {token0Name}</h1>
        </div>
        <div className="modal-body">
          <Input label={`Enter ${token0Name} amount to purchase`} id="token0Amount" value={token0Amount} onChange={handleChange} type="number" min={1} step={1} autoFocus />
          <div className={`message${isValid ? ' ' : ' error'}`}>
            {token1Name} required: <b className="col-black">{token1Amount}</b><br />
            {!isValid && `Insufficient ${token1Name} balance.`}
          </div>
        </div>
        <div className="modal-footer">
          <Button className="btn-outline" onClick={() => onHide && onHide()}><span>Cancel</span></Button>
          <Button onClick={() => onContinue && onContinue(token1Amount)} disabled={!isValid || purchaseTx}><span>Continue</span></Button>
        </div>
      </Content>
    </Wrapper>),
    document.body
  )
}

export default PurchaseModal