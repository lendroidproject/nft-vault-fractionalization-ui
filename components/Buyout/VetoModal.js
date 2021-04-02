import React, { useEffect, useState, useCallback } from 'react'
import ReactDOM from 'react-dom'
import styled from 'styled-components'
import Button from 'components/common/Button'
import { format } from 'utils/number'
import RangeInput from 'components/common/RangeInput'
import Gauge from 'components/common/Gauge'

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
    width: 641px;
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
  .score {
    font-size: 18px;
    line-height: 1.5;
    background-color: #f0f7ff;
    color: #616161;
    padding: 15px;
    border-radius: 4px;
    margin-bottom: 18px;
  }
  .tabs {
    .tab-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 7px;
      .tab-btn {
        background: var(--color-white);
        border: 2px solid var(--color-blue);
        border-radius: 4px;
        color: var(--color-blue);
        padding: 9px 8px;
        min-width: 150px;
        font-size: 16px;
        text-transform: uppercase;
        &.selected {
          background: var(--color-blue);
          color: var(--color-white);
        }
      }
    }
  }
  .tab-panel {
    border: 1px solid #dfe3f7;
    border-radius: 4px;
    padding: 20px;
    min-height: 260px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .tab-panel-content {
    width: 324px;
    max-width: 100%;
    text-align: center;
  }
  .tab-desc {
    margin-bottom: 32px;
  }
`

function VetoModal({
  vetoDisabled = true,
  b20Staked = 0,
  lastVetoedBidId = 0,
  currentBidId = 0,
  epochPassed = true,
  b20Balance = 0,
  b20Allowance = 0,
  contract = '',
  show,
  onHide,
  onExtend,
  onVeto,
  onWithdraw,
  onApproveB20,
  gauge,
}) {
  const [formData, setFormData] = useState({
    b20: {
      value: 0,
      hasError: false,
      isValid: false,
      error: '',
    },
    agree: {
      value: false,
      hasError: false,
      isValid: false,
      error: '',
    },
  })
  const [curTab, setCurTab] = useState(0)
  const activeTab = b20Staked > 0 ? curTab : 0
  const b20Validator = useCallback(
    (value) => {
      if (value === 0) return false
      if (vetoDisabled) {
        return value <= b20Staked
      } else {
        switch (activeTab) {
          case 0:
            return value <= b20Balance
          case 1:
            return value <= b20Balance
          case 2:
            return value <= b20Staked
          default:
            return true
        }
      }
    },
    [b20Balance, b20Staked, activeTab, vetoDisabled]
  )
  const agreeValidator = useCallback((value) => !!value, [])
  const validators = {
    b20: b20Validator,
    agree: agreeValidator,
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
      agree: {
        value: false,
        hasError: false,
        isValid: false,
        error: '',
      },
    })
  }

  const bidDiff = currentBidId - lastVetoedBidId

  const extendVetoTab = {
    tabName: 'Extend Veto',
    tabContent: (
      <div className="tab-panel-content">
        {bidDiff === 0 ? (
          <h3 className="light tab-desc">You have already vetoed this bid.</h3>
        ) : (
          <>
            <h3 className="light tab-desc">
              Your last veto was {bidDiff} {bidDiff > 1 ? 'bids' : 'bid'} ago.
            </h3>
            <div className="form-input">
              <p className={`terms${formData.agree.isValid ? ' error' : ''}`} style={{ fontSize: '88%', lineHeight: 1.5 }}>
                <input type="checkbox" checked={formData.agree.value} onChange={() => handleChange('agree', !formData.agree.value)} />
                Your B20 will be locked up in the{' '}
                <a href={contract} target="_blank">
                  Buyout contract
                </a>{' '}
                until either your bid is vetoed or a higher bid is placed.
              </p>
            </div>
            <Button onClick={() => onExtend && onExtend()} disabled={!formData.agree.isValid}>
              <span>Continue Veto</span>
            </Button>
          </>
        )}
      </div>
    ),
  }
  const addVetoTab = {
    tabName: b20Staked > 0 ? 'Add More Veto' : 'Add Veto',
    tabContent: (
      <div className="tab-panel-content">
        <div className="form-input">
          <RangeInput
            label={(
              <div className="input-label">
                <span>
                  <img src="/assets/b20.svg" alt="B20" />&nbsp;&nbsp;B20
                </span>
                {b20Allowance < formData.b20.value && (
                  <Button className="btn-approve" onClick={() => onApproveB20 && onApproveB20(formData.b20.value)}>
                    Approve B20
                  </Button>
                )}
              </div>
            )}
            inputProps={{
              className: 'center'
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
        <div className="form-input">
          <p className={`terms${formData.agree.isValid ? ' error' : ''}`} style={{ fontSize: '88%', lineHeight: 1.5 }}>
            <input type="checkbox" checked={formData.agree.value} onChange={() => handleChange('agree', !formData.agree.value)} />
            Your B20 will be locked up in the{' '}
            <a href={contract} target="_blank">
              Buyout contract
            </a>{' '}
            until either your bid is vetoed or a higher bid is placed.
          </p>
        </div>
        <Button onClick={() => onVeto && onVeto(formData.b20.value)} disabled={!formData.b20.isValid || formData.b20.value > b20Allowance || !formData.agree.isValid}>
          {b20Staked > 0 ? 'Veto Some More' : 'Veto'}
        </Button>
      </div>
    ),
  }
  const withdrawTab = {
    tabName: 'Withdraw Stake',
    tabContent:
      epochPassed && bidDiff === 0 ? (
        <h3 className="light tab-desc">You cannot unstake until veto on current bid expires.</h3>
      ) : (
        <div className="tab-panel-content">
          <div className="form-input">
            <RangeInput
              label={(
                <div className="input-label">
                  <span>
                    <img src="/assets/b20.svg" alt="B20" />&nbsp;&nbsp;B20
                  </span>
                </div>
              )}
              inputProps={{
                className: 'center'
              }}
              max={b20Staked}
              value={formData.b20.value}
              onChange={(v) => handleChange('b20', v)}
            />
            <div className={`message${formData.b20.hasError ? ' error' : ''}`}>
              <span>Max: {format(b20Staked, 2)}</span>
              <span>Balance: {format(b20Balance, 2)}</span>
            </div>
          </div>
          <Button onClick={() => onWithdraw && onWithdraw(formData.b20.value)} disabled={!formData.b20.isValid}>
            <span>Withdraw Stake</span>
          </Button>
        </div>
      ),
  }

  const tabs = vetoDisabled ? [withdrawTab] : b20Staked > 0 ? [extendVetoTab, addVetoTab, withdrawTab] : [addVetoTab]

  useEffect(() => {
    if (show === true) {
      resetForm()
    }
  }, [activeTab, show])

  return ReactDOM.createPortal(
    <Wrapper className={`flex-all ${show ? 'show' : 'hide'}`}>
      <Content onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-body">
          <button className="btn-close" onClick={() => onHide && onHide()}>
            <img src="/assets/arrow-right-black.svg" />
            Go Back
          </button>
          <div className="modal-header">
            <h1 className="col-blue modal-title">Veto</h1>
          </div>
          <div className="modal-content">
            <div className="score flex-center justify-between">
              <div>
                Your Veto Score
                <br /> <span className="col-black">{format(b20Staked)}</span>
              </div>
              {gauge && <Gauge {...gauge} height={160} />}
            </div>
            <div className="tabs">
              <div className="tab-header">
                {tabs.map((tab, idx) =>
                  tab ? (
                    <Button
                      key={`tab-${idx}`}
                      className={`tab-btn ${idx === activeTab ? 'selected' : ''}`}
                      onClick={() => {
                        setCurTab(idx)
                        resetForm()
                      }}
                    >
                      {tab.tabName}
                    </Button>
                  ) : null
                )}
              </div>
              <div className="tab-panel">{(tabs[activeTab] || tabs[0]).tabContent}</div>
            </div>
          </div>
        </div>
      </Content>
    </Wrapper>,
    document.body
  )
}

export default VetoModal
