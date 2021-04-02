import React, { useEffect, useState, useCallback } from 'react'
import ReactDOM from 'react-dom'
import styled from 'styled-components'
import Button from 'components/common/Button'
import Input from 'components/common/NumberInput'
import { format } from 'utils/number'
import RangeInput from 'components/common/RangeInput'
import { useThrottle } from 'utils/hooks'

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
  }
  .form-input{
    margin-bottom: 30px;
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
  .message {
    font-size: 11px;
    color: var(--color-grey);
    margin: 8px 0;
    line-height: 17px;
    display: flex;
    justify-content: space-between;
  }
  .modal-footer {
    margin-top: 36px;
    text-align: center;
    button {
      min-width: 175px;
    }
  }
  .error {
    color: var(--color-red);
  }
`

const MIN_B20_AMOUNT = 500000

function BidModal({
  minTotal = 0,
  b20Balance = 0,
  daiBalance = 0,
  b20Allowance = 0,
  daiAllowance = 0,
  getRequiredB20,
  show,
  onHide,
  onContinue,
  onApproveB20,
  onApproveDai,
  contract,
}) {
  const [agree, setAgree] = useState(false)
  useEffect(() => {
    setAgree(false)
  }, [show])

  const [formData, setFormData] = useState({
    total: {
      value: '',
      hasError: false,
      isValid: false,
      error: '',
    },
    dai: {
      value: 0,
      hasError: false,
      isValid: false,
      error: '',
    },
    b20: {
      value: 0,
      hasError: false,
      isValid: false,
      error: '',
    },
  })

  const totalValidator = useCallback((value) => value >= minTotal, [minTotal])
  const daiValidator = useCallback((value) => value >= 0 && value <= formData.total.value, [formData.total.value])
  const b20Validator = useCallback((value) => value >= MIN_B20_AMOUNT && value <= b20Balance, [formData.b20.value])

  const validators = {
    total: totalValidator,
    dai: daiValidator,
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
      total: {
        value: minTotal ? minTotal : '',
        hasError: false,
        isValid: true,
        error: '',
      },
      dai: {
        value: 0,
        hasError: false,
        isValid: false,
        error: '',
      },
      b20: {
        value: 0,
        hasError: false,
        isValid: false,
        error: '',
      },
    })
  }

  const labelTotal = (
    <div className="input-label">
      <span>
        <img src="/assets/dai.svg" alt="DAI" />&nbsp;+&nbsp;<img src="/assets/b20.svg" alt="B20" />
        &nbsp;&nbsp;Total Bid Value
      </span>
    </div>
  )

  const labelDai = (
    <div className="input-label">
      <span>
        <img src="/assets/dai.svg" alt="DAI" />&nbsp;&nbsp;DAI
      </span>
      {(true || daiAllowance < formData.dai.value) && (
        <Button className="btn-approve" onClick={() => onApproveDai && onApproveDai(formData.dai.value)}>
          Approve DAI
        </Button>
      )}
    </div>
  )

  const labelB20 = (
    <div className="input-label">
      <span>
        <img src="/assets/b20.svg" alt="B20" />&nbsp;&nbsp;B20
      </span>
      {(true || b20Allowance < formData.b20.value) && (
        <Button className="btn-approve" onClick={() => onApproveB20 && onApproveB20(formData.b20.value)}>
          Approve B20
        </Button>
      )}
    </div>
  )

  const [getB20] = useThrottle(async () => {
    const result = await getRequiredB20(formData.total.value, formData.dai.value)
    handleChange('b20', Number(result))
  }, 0.25 * 1000)
  useEffect(() => {
    getB20()
  }, [getRequiredB20, formData.total.value, formData.dai.value])

  useEffect(() => {
    if (show) {
      resetForm()
    }
  }, [show])

  const isValid = !(
    daiAllowance < formData.dai.value ||
    b20Allowance < formData.b20.value ||
    !formData.total.isValid ||
    !formData.dai.isValid ||
    !formData.b20.isValid
  )

  return ReactDOM.createPortal(
    <Wrapper className={`flex-all ${show ? 'show' : 'hide'}`}>
      <Content onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-body">
          <button className="btn-close" onClick={() => onHide && onHide()}>
            <img src="/assets/arrow-right-black.svg" />
            Go Back
          </button>
          <div className="modal-header">
            <h1 className="col-blue modal-title">Buyout</h1>
          </div>
          <div className="modal-content">
            <div className="form-input">
              <RangeInput
                label={labelTotal}
                inputProps={{
                  className: 'center'
                }}
                min={minTotal}
                max={10**9}
                value={formData.total.value}
                onChange={(v) => handleChange('total', v)}
              />
              <div className={`message${formData.total.hasError ? ' error' : ''}`}>
                <span>Min. Required: {format(minTotal)}</span>
                {/* {errors.total && `Insufficient ${token1Name} balance.`} */}
              </div>
            </div>
            <div className="form-input">
              <RangeInput
                label={labelDai}
                inputProps={{
                  className: 'center'
                }}
                max={formData.total.value}
                value={formData.dai.value}
                onChange={(v) => handleChange('dai', v)}
              />
              <div className={`message${formData.dai.hasError ? ' error' : ''}`}>
                <span>Max: {format(formData.total.value)}</span>
                <span>Balance: {format(daiBalance, 2)}</span>
              </div>
            </div>
            <div className="form-input">
              <RangeInput
                label={labelB20}
                value={formData.b20.value}
                decimals={2}
                disabled
              />
              <div className={`message${formData.b20.hasError ? ' error' : ''}`}>
                <span>Min. Required: {format(MIN_B20_AMOUNT)}</span>
                <span>Balance: {format(b20Balance, 2)}</span>
                {/* {errors.total && `Insufficient ${token1Name} balance.`} */}
              </div>
            </div>
            <div className="form-input">
              <p className={`terms${isValid && !agree ? ' error' : ''}`} style={{ fontSize: '88%', lineHeight: 1.5 }}>
                <input type="checkbox" checked={agree} onChange={() => setAgree(!agree)} />
                Your DAI and B20 will be locked up in the{' '}
                <a href={contract} target="_blank">
                  Buyout contract
                </a>{' '}
                until either your bid is vetoed or a higher bid is placed.
              </p>
            </div>
            <div className="modal-footer">
              <Button
                onClick={() => onContinue && onContinue(formData.total.value, formData.dai.value)}
                disabled={!isValid || !agree}
              >
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

export default BidModal
