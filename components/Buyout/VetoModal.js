import React, { useEffect, useState, useCallback } from 'react'
import ReactDOM from 'react-dom'
import styled from 'styled-components'
import Button from 'components/common/Button'
import { format } from 'utils/number'
import RangeInput from 'components/common/RangeInput'

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
  .score {
    font-size: 18px;
    background-color: #dfe3f7;
    text-align: center;
    color: var(--color-grey);
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

const MIN_B20_AMOUNT = 500000

function VetoModal({
  vetoDisabled = true,
  b20Staked = 0,
  lastVetoedBidId = 0,
  currentBidId = 0,
  epochPassed = true,
  b20Balance = 0,
  b20Allowance = 0,
  show,
  onHide,
  onExtend,
  onVeto,
  onWithdraw,
  onApproveB20,
}) {
  const [formData, setFormData] = useState({
    b20: {
      value: '',
      hasError: false,
      isValid: false,
      error: '',
    },
  })
  const [curTab, setCurTab] = useState(0)
  const activeTab = b20Staked > 0 ? curTab : 0
  const b20Validator = useCallback(
    (value) => {
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
    [b20Staked, activeTab, vetoDisabled]
  )
  const validators = {
    b20: b20Validator,
  }

  const handleChange = ({ floatValue: value }) => {
    const name = 'b20'
    const isValid = validators[name](value)
    setFormData({
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
        value: '',
        hasError: false,
        isValid: false,
        error: '',
      },
    })
  }

  const inputSuffix = () =>
    b20Allowance < formData.b20.value && (
      <Button className="btn-approve" onClick={() => onApproveB20 && onApproveB20(formData.b20.value)}>
        Approve
      </Button>
    )

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
            <Button onClick={() => onExtend && onExtend()}>
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
            label="B20"
            icon="/assets/b20.svg"
            max={b20Balance}
            value={formData.b20.value}
            onChange={(v) => handleChange({ floatValue: v })}
            approve={inputSuffix()}
          />
          <div className={`message${formData.b20.hasError ? ' error' : ''}`}>
            <span></span>
            <span>Balance: {format(b20Balance, 2)}</span>
          </div>
        </div>
        <Button onClick={() => onVeto && onVeto(formData.b20.value)} disabled={!formData.b20.isValid}>
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
              label="B20"
              icon="/assets/b20.svg"
              max={b20Staked}
              value={formData.b20.value}
              onChange={(v) => handleChange({ floatValue: v })}
              approve={inputSuffix()}
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
            <div className="score">
              Your Veto Score: <span className="col-black">{format(b20Staked)}</span>
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
