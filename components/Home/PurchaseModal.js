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
  width: 423px;
  max-width: 95%;
  padding: 26px 30px 30px;
  position: relative;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background-color: #fbfbfb;
  box-shadow: 0 2px 15px 0 rgba(0, 0, 0, 0.14);
  .btn-close {
    position: absolute;
    top: 20px;
    right: 20px;
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
    font-size: 14px;
    color: var(--color-dark-grey);
    margin-top: 8px;
    margin-bottom: 20px;
    line-height: 17px;

    &.error {
      color: var(--color-red);
    }
  }
  .asset-icon {
    border-radius: 12px;
  }
  .modal-footer {
    text-align: center;
    button {
      width: 200px;
    }
  }
`

function PurchaseModal({
  token0Name,
  token1Name,
  token1Balance = 0,
  token1PerToken0,
  purchaseTx = '',
  show,
  onHide,
  onContinue,
}) {
  const [token0Amount, setToken0Amount] = useState('')

  const handleChange = (e) => {
    if (!e.target.value || (!Number.isNaN(Number(e.target.value)) && /^\s*[1-9]\d*(\.\d{0,2})?\s*$/.test(e.target.value))) {
      setToken0Amount(e.target.value)
    }
  }

  const token1Amount = new BigNumber(token0Amount || 0).multipliedBy(token1PerToken0).toNumber()
  const isSufficientBalance = token1Amount <= token1Balance
  const isValid = !!token1Amount && isSufficientBalance

  useEffect(() => {
    if (show) {
      setToken0Amount('')
      document.getElementById('token0Amount').focus()
    }
  }, [show])

  const inputSuffix = () => <img className="asset-icon suffix" src="/assets/b20.svg" alt="B20" />

  return ReactDOM.createPortal(
    <Wrapper className={`flex-all ${show ? 'show' : 'hide'}`} onMouseDown={() => onHide && onHide()}>
      <Content onMouseDown={(e) => e.stopPropagation()}>
        <button className="btn-close" onClick={() => onHide && onHide()}>
          <img src="/assets/close-btn.svg" alt="Close" />
        </button>
        <div className="modal-header">
          <h3 className="col-blue modal-title">PURCHASE {token0Name}</h3>
        </div>
        <div className="modal-body">
          <Input
            id="token0Amount"
            label={`No of ${token0Name} tokens`}
            value={token0Amount}
            onChange={handleChange}
            suffix={inputSuffix}
          />
          <div className={`message${!isSufficientBalance ? ' error' : ''}`}>
            {token1Name} required: <b className="col-black">{token1Amount}</b>
            <br />
            {!isSufficientBalance && `Insufficient ${token1Name} balance.`}
          </div>
        </div>
        <div className="modal-footer">
          {/* <Button className="btn-outline" onClick={() => onHide && onHide()}><span>Cancel</span></Button> */}
          <Button onClick={() => onContinue && onContinue(token1Amount)} disabled={!isValid || purchaseTx}>
            <span>CONTINUE</span>
          </Button>
        </div>
      </Content>
    </Wrapper>,
    document.body
  )
}

export default PurchaseModal
