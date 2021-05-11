import React, { useEffect, useState, useMemo, useCallback } from 'react'
import ReactDOM from 'react-dom'
import styled from 'styled-components'
import Button from 'components/common/Button'
// import Input from 'components/common/NumberInput'
import RangeInput from 'components/common/RangeInput'
import { format } from 'utils/number'

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
  .modal-header {
    text-align: center;
    border-bottom: 2px solid var(--color-pink);
    margin: 12px auto 24px;
    width: 423px;
    max-width: 100%;
    h1 {
      font-size: 32px;
      padding-bottom: 24px;
    }
  }

  .modal-body {
    width: 423px;
    max-width: 100%;
    margin: auto;
    padding: 20px 24px 24px;
    position: relative;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    background-color: #fbfbfb;
    box-shadow: 0 6px 8px 0 rgba(0, 0, 0, 0.5);
  }

  .modal-content {
    width: 100%;
    border-radius: 4px;
    background-color: #fbfbfb;
    box-shadow: 0 2px 15px 0 rgba(0, 0, 0, 0.14);
    padding: 20px;
    margin-top: 25px;
  }
  .btn-close {
    font-size: 20px;
    font-weight: bold;
    letter-spacing: 0;
    line-height: 24px;
    background: transparent;
    padding: 0;
    > img {
      width: 33px;
      height: 16px;
      margin-right: 10px;
    }
  }
  .btn-approve {
    font-size: 12px;
    background: var(--color-pink);
    color: var(--color-white);
    line-height: 14px;
    padding: 5px;
    margin-right: 5px;
  }
  .input .suffix {
    width: unset;
    color: var(--color-grey);
    > img {
      width: 24px;
      border-radius: 12px;
    }
  }
  .message {
    font-size: 11px;
    color: var(--color-grey);
    margin-top: 8px;
    margin-bottom: 20px;
    line-height: 17px;
    display: flex;
    justify-content: space-between;

    &.error {
      color: var(--color-red);
    }
  }
  .modal-footer {
    margin-top: 36px;
    text-align: center;
    button {
      min-width: 175px;
    }
  }
  .input-label {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    span {
      display: flex;
      align-items: center;
    }
    img {
      border-radius: 50%;
      width: 24px;
    }
  }
`

function RedeemModal({ rate = 0, b20Balance = 0, b20Allowance = 0, show, onHide, onRedeem, onApproveB20 }) {
  const [formData, setFormData] = useState({
    b20: {
      value: '',
      hasError: false,
      isValid: false,
      error: '',
    },
  })

  const b20Validator = useCallback((value) => value >= 0, [])

  const validators = {
    b20: b20Validator,
  }

  const handleChange = (name, value) => {
    const isValid = validators[name](value)
    setFormData({
      ...formData,
      [name]: {
        value,
        hasError: !isValid,
        isValid,
        error: '',
      },
    })
  }

  const resetForm = () => {
    setFormData({
      b20: {
        value: 0,
        hasError: false,
        isValid: false,
        error: '',
      },
    })
  }

  // const b20InputSuffix = () => (
  //   <div className="suffix">
  //     {b20Allowance < formData.b20.value && (
  //       <Button className="btn-approve" onClick={() => onApproveB20 && onApproveB20(formData.b20.value)}>
  //         Approve
  //       </Button>
  //     )}
  //     <img className="asset-icon" src="/assets/b20.svg" alt="B20" />
  //   </div>
  // )
  const labelB20 = (
    <div className="input-label">
      <span>
        <img src="/assets/b20.svg" alt="B20" />
        &nbsp;&nbsp;B20
      </span>
      {b20Allowance < formData.b20.value && (
        <Button className="btn-approve" onClick={() => onApproveB20 && onApproveB20(formData.b20.value)}>
          Approve B20
        </Button>
      )}
    </div>
  )

  useEffect(() => {
    if (show) {
      resetForm()
    }
  }, [show])

  return ReactDOM.createPortal(
    <Wrapper className={`flex-all ${show ? 'show' : 'hide'}`}>
      <Content onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-body">
          <button className="btn-close" onClick={() => onHide && onHide()}>
            <img src="/assets/arrow-right-black.svg" />
            Go Back
          </button>
          <div className="modal-header">
            <h1 className="col-blue modal-title">Redeem</h1>
          </div>
          <div className="modal-content">
            <div className="form-input">
              {/* <Input
                id="b20"
                name="b20"
                label="B20"
                value={formData.b20.value}
                onValueChange={(v) => handleChange('b20', v)}
                pattern="/^\s*\d+(\.\d{1,2})?\s*$/"
                suffix={b20InputSuffix}
              /> */}
              <RangeInput
                label={labelB20}
                inputProps={{
                  className: 'center',
                }}
                max={b20Balance}
                value={formData.b20.value}
                onChange={(v) => handleChange('b20', v)}
              />
              <div className={`message${formData.b20.hasError ? ' error' : ''}`}>
                <span></span>
                <span>Balance: {format(b20Balance, 2)}</span>
              </div>
            </div>
            <h3 className="center">You will get {format(rate * formData.b20.value)} DAI.</h3>
            <div className="modal-footer">
              <Button onClick={() => onRedeem && onRedeem(formData.b20.value)} disabled={!formData.b20.isValid}>
                <span>Continue</span>
              </Button>
            </div>
          </div>
        </div>
      </Content>
    </Wrapper>,
    document.body
  )
}

export default RedeemModal
