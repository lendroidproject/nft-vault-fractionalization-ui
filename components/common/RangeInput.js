import React from 'react'
import styled from 'styled-components'

import Slider from 'rc-slider'
import 'rc-slider/assets/index.css'
import { format } from 'utils/number'

const Wrapper = styled.div`
  width: 100%;
  position: relative;

  label {
    display: flex;
    align-items: center;

    img {
      border-radius: 50%;
      width: 24px;
      margin-right: 6px;
    }
  }

  h2 {
    margin: 5px 0;
  }

  .rc-slider {
    margin-bottom: 10px;
    &-rail {
      height: 10px;
      background-color: var(--color-dark);
    }
    &-track {
      height: 10px;
      background: var(--linear-gradient4);
    }
    &-handle {
      width: 30px;
      height: 30px;
      margin-top: -10px;
      border-color: var(--color-white);
      background: var(--linear-gradient1);
      cursor: pointer;
    }
  }
`

const RangeInput = ({ label, icon, min = 0, max, value, decimals = 0, approve, disabled, onChange }) => {
  return (
    <Wrapper className={`slider`}>
      <label>
        <img src={icon} /> {label}
      </label>
      <h2 className={`light ${disabled ? '' : 'center'}`}>{approve ? approve : format(value || min, decimals)}</h2>
      {!disabled && <Slider {...{ min, max, value, onChange }} />}
    </Wrapper>
  )
}

export default RangeInput
