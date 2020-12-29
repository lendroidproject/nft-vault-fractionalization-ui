import React from 'react'
import ReactDOM from 'react-dom'
import styled from 'styled-components'
import Button from 'components/common/Button'
import Table from 'components/common/Table'

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
  max-width: 608px;
  background-color: var(--color-white);
  box-shadow: inset 0 1px 3px 0 rgba(0, 0, 0, 0.5), 6px 2px 4px 0 rgba(0, 0, 0, 0.5);
  padding: 30px 40px;
  position: relative;

  h1 {
    margin-top: 24px;
    margin-bottom: 0;
    font-size: 24px;
    line-height: 36px;
    color: var(--color-yellow);
  }

  > img {
    width: 240px;
    margin-bottom: 24px;
  }

  h4 {
    font-size: 12px;
  }

  .btn-close {
    position: absolute;
    top: 7px;
    right: 13px;
    border-radius: 50%;
    background-color: #fff;
  }

  .category {
    border: 1px solid #FFFFFF;
    border-radius: 9px;
    background-color: #0D35FA;
    font-size: 20px;
    line-height: 24px;
    color: var(--color-white);
    padding: 4px 50px;
    top: 0;
    position: absolute;
    transform: translateY(-50%);
  }

  .pagination {
    margin-top: 20px;
    display: flex;
    align-items: center;
    h2 {
      margin: 0 10px;
    }
    > img {
      width: 32px;
    }
  }
`
function ContributionsModal({ show, onHide }) {
  return ReactDOM.createPortal((
    <Wrapper className={`flex-all ${show ? 'show' : 'hide'}`} onMouseDown={() => onHide && onHide()}>
      <Content className="center flex-center flex-column justify-center" onMouseDown={e => e.stopPropagation()}>
        <button className="btn-close" onClick={() => onHide && onHide()}>
          <img src="/assets/close-btn.svg" alt="Close" />
        </button>
        <div className="modal-header">
          <h1>B20 SHARD: WHALEBUNDLES</h1>
          <span className="status-tag">Status: LIVE</span>
        </div>
        <div className="modal-body">
          <h2 className="col-blue">Contributions</h2>
        </div>
      </Content>
    </Wrapper>
    ),
    document.body
  )
}

export default ContributionsModal