import React from 'react'
import styled from 'styled-components'
import Spinner from './Spinner'

const TxLoader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  h3 {
    font-weight: normal;
  }
`

export default ({ label, options = [], loading, ...props }) =>
  loading ? (
    <TxLoader>
      <Spinner />
      <h3>{label || 'Please wait...'}</h3>
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
