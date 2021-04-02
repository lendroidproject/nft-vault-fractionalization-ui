import React from 'react'
import styled from 'styled-components'
import Slider from 'rc-slider'
import NumberFormat from 'react-number-format'
import 'rc-slider/assets/index.css'
import { format } from 'utils/number'
import Input from './NumberInput'

const Wrapper = styled.div`
  width: 100%;
  position: relative;

  input {
    margin: 5px 0 8px;
    font-size: 20px;
    font-weight: normal;
    line-height: 24px;
    color: var(--color-black);
    border: none;
    max-width: 100%;
    background: transparent;
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

const RangeInput = ({ label = null, min = 0, max, value, disabled, onChange, inputProps = {}, sliderProps = {} }) => {
  return (
    <Wrapper className={`slider`}>
      <label>
        {label}
      </label>
      <NumberFormat
        {...inputProps}
        value={value}
        thousandSeparator=","
        decimalSeparator="."
        disabled={!!disabled}
        onValueChange={({ floatValue }) => onChange && onChange(floatValue)}
      />
      {!disabled && <Slider {...sliderProps} {...{ min, max, value, onChange }} />}
    </Wrapper>
  )
}

export default RangeInput
