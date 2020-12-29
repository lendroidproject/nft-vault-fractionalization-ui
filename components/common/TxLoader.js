import React from 'react'
import styled from 'styled-components'
import Spinner from './Spinner'

const TxLoader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  a {
    margin-top: 10px;
  }

  ul {
    list-style: none;
    padding-left: 0;
  }
`

export default ({ label, info, options = [], txHash, ...props }) =>
  txHash ? (
    <TxLoader>
      <Spinner />
      {info ? <p>{label}</p> : <h3>{label}</h3>}
      {Array.isArray(txHash) ? (
        txHash.map((tx) => (
          <a key={tx} href={tx} target="_blank">
            View on Etherscan
          </a>
        ))
      ) : (
        <a href={txHash} target="_blank">
          View on Etherscan
        </a>
      )}
      {options.length > 0 && (
        <ul>
          {options.map((option, idx) => (
            <li key={idx}>{option}</li>
          ))}
        </ul>
      )}
    </TxLoader>
  ) : (
    <div {...props} />
  )
