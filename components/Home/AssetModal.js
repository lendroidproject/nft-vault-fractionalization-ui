import React from 'react'
import ReactDOM from 'react-dom'
import styled from 'styled-components'

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
  padding: 35px 80px 30px;
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
    font-size: 16px;
    line-height: 24px;
    color: var(--color-white);
    padding: 4px 50px;
    top: 16px;
    position: absolute;
    margin: 0 50px;
    transform: translateY(-100%);
  }
  .pagination {
    margin-top: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    h2 {
      margin: 0 10px;
    }
    > img {
      width: 32px;
      cursor: pointer;
      &.disabled {
        opacity: 0.6;
      }
    }
  }
`
const DEFAULT_IMAGE_URL = '/assets/default-asset-img.jpg';

function AssetModal({ asset, total, show, onHide, onPrev, onNext }) {
  return ReactDOM.createPortal(
    (<Wrapper className={`flex-all ${show ? 'show' : 'hide'}`} onMouseDown={() => onHide && onHide()}>
      <Content className="center flex-center flex-column justify-center" onMouseDown={e => e.stopPropagation()}>
        <button className="btn-close" onClick={() => onHide && onHide()}>
          <img src="/assets/close-btn.svg" alt="Close" />
        </button>
        <div className="category">{asset.category}</div>
        <img src={asset.image_url || asset.asset_contract?.image_url || DEFAULT_IMAGE_URL} />
        <div>
          <h3 className="light">{asset.name}</h3>
          {(asset.asset_contract && asset.asset_contract.name) && (
            <h4 className="light">by {asset.asset_contract.name}</h4>
          )}
          <div className="pagination">
            <img src="/assets/arrow-left-darker.svg" className={asset.orderId === 1 ? 'disabled' : ''} onClick={() => onPrev && onPrev()}/>
            <h2>{asset.orderId}/{total}</h2>
            <img src="/assets/arrow-right-darker.svg" className={asset.orderId === total ? 'disabled' : ''} onClick={() => onNext && onNext()}/>
          </div>
        </div>
      </Content>
    </Wrapper>),
    document.body
  )
}

export default AssetModal