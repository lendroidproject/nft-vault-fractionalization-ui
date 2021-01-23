import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom'
import styled from 'styled-components'
import { format } from 'utils/number'
import Spinner from 'components/common/Spinner'

export const PAGE_SIZE = 14

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

  .status-tag {
    background-color: var(--color-green);
    color: var(--color-white);
    font-size: 10px;
    line-height: 12px;
    border-radius: 5px;
    padding: 6px 12px;
    display: inline-block;
    vertical-align: text-bottom;
    font-weight: normal;
    &.active {
      background-color: var(--color-green);
    }
    &.inactive {
      background-color: #989898;
    }
  }
`

const Content = styled.div`
  width: 1040px;
  max-width: 90%;
  background-color: var(--color-white);
  box-shadow: inset 0 1px 3px 0 rgba(0, 0, 0, 0.5), 6px 2px 4px 0 rgba(0, 0, 0, 0.5);
  padding: 30px 40px;
  position: relative;

  .padded,
  table th,
  table td {
    padding: 0 13px;
  }

  h1 {
    font-size: 24px;
    line-height: 29px;
    margin-bottom: 5px;
  }

  h2 {
    font-size: 18px;
    line-height: 26px;
    margin-top: 27px;
    margin-bottom: 13px;
  }

  .btn-close {
    border-radius: 50%;
    background-color: #fff;
    padding: 0;
  }

  table {
    margin-top: 20px;
    position: relative;
    width: 100%;
    thead {
      text-align: left;
      font-size: 16px;
      line-height: 19px;
      color: var(--color-white);
      position: relative;
      z-index: 1;
      tr {
        height: 36px;
        background: linear-gradient(90deg, #2fd2dd 0%, #c170d0 100%);
        border-radius: 4px;
      }
    }
    tbody {
      font-size: 12px;
      color: var(--color-black);
      tr {
        height: 29px;
        &.sep {
          height: 16px;
        }
        &.bg {
          background: linear-gradient(90deg, #f2e7c9 0%, #e1f7ff 100%);
          position: absolute;
          display: block;
          left: 0;
          right: 0;
          height: 29px;
          border-radius: 4px;
          top: calc(36px + 16px + var(--nth-child) * 29px);
        }
        &:not(.bg) td {
          position: relative;
          z-index: 1;
        }
        &.loading {
          position: absolute;
          left: 0;
          top: 36px;
          width: 100%;
          height: calc(100% - 36px);
          z-index: 1;
          border-radius: 4px;
          overflow: hidden;

          td {
            display: block;
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            padding: 0;
          }
        }
      }
    }
  }

  .pagination {
    margin-top: 27px;
    > * {
      margin: 0 5px;
      cursor: pointer;
      transition: all 0.2s;
    }
    span {
      font-size: 18px;
      line-height: 21px;
      font-weight: bold;
      color: var(--color-menu);
      width: 20px;
      text-align: center;
      &.active {
        color: var(--color-pink);
      }
    }
  }
`

const bgArr = new Array(PAGE_SIZE / 2).fill(0)

function ContributionsModal({ show, onHide, total, onPage, toNumber, token1PerToken0, token0Name, token0Symbol, token1Symbol, marketStatus }) {
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const totalPages = Math.ceil(total / PAGE_SIZE)
  const [pages, setPages] = useState(new Array(5).fill(0))
  const [contributions, setContributions] = useState(new Array(PAGE_SIZE).fill(null))

  useEffect(() => {
    setLoading(true)
    onPage(page)
      .then((contributors) => {
        setContributions([...contributors, ...new Array(PAGE_SIZE - contributors.length).fill(null)])
        const totalPages = Math.ceil(total / PAGE_SIZE)
        setPages([
          page - 2 < 0 ? 0 : page - 1,
          page - 1 < 0 ? 0 : page,
          page + 1,
          page + 1 >= totalPages ? 0 : page + 2,
          page + 2 >= totalPages ? 0 : page + 3,
        ])
        console.log(contributors)
      })
      .catch(console.log)
      .finally(() => setLoading(false))
  }, [total, page])

  return ReactDOM.createPortal(
    <Wrapper className={`flex-all ${show ? 'show' : 'hide'}`} onMouseDown={() => onHide && onHide()}>
      <Content onMouseDown={(e) => e.stopPropagation()}>
        <div className="flex-start justify-between">
          <div className="modal-header padded">
            <h1>{token0Name} Purchase List</h1>
            {marketStatus === 1 ? (
              <span className="status-tag active">Status: LIVE</span>
            ) : (
              <span className="status-tag inactive">Status: CLOSED</span>
            )}
          </div>
          <button className="btn-close" onClick={() => onHide && onHide()}>
            <img src="/assets/close-btn.svg" alt="Close" />
          </button>
        </div>
        <div className="modal-body">
          <table cellPadding={0} cellSpacing={0}>
            <thead>
              <tr>
                <th>Wallet</th>
                <th>{token0Symbol} Purchased</th>
                <th>{token1Symbol} Paid</th>
              </tr>
            </thead>
            <tbody>
              {bgArr.map((_, idx) => (
                <tr key={idx} className="bg">
                  <td colSpan={3} />
                </tr>
              ))}
              <tr className="sep">
                <td colSpan={3} />
              </tr>
              {contributions.map((item, idx) => (
                <tr key={item ? item.address : idx}>
                  <td>{item ? item.address : ' '}</td>
                  <td>{item ? format(toNumber(item.token1Amount) / token1PerToken0) : ' '}</td>
                  <td>{item ? format(toNumber(item.token1Amount)) : ' '}</td>
                </tr>
              ))}
              {loading && (
                <tr className="loading">
                  <td colSpan={3}>
                    <Spinner />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="pagination flex-center justify-center">
            <img
              src={`/assets/arrow-left-${page <= 0 ? 'lighter' : 'darker'}.svg`}
              onClick={() => {
                if (page <= 0) return
                setPage(page - 1)
              }}
            />
            {pages.map((item, idx) => (
              <span
                className={item === page + 1 ? 'active' : ''}
                key={idx}
                onClick={() => item && page !== item - 1 && setPage(item - 1)}
              >
                {item ? item : ' '}
              </span>
            ))}
            <img
              src={`/assets/arrow-right-${page + 1 >= totalPages ? 'lighter' : 'darker'}.svg`}
              onClick={() => {
                if (page + 1 >= totalPages) return
                setPage(page + 1)
              }}
            />
          </div>
        </div>
      </Content>
    </Wrapper>,
    document.body
  )
}

export default ContributionsModal
