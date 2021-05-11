import React from 'react'
import styled from 'styled-components'
import Slider from 'rc-slider'
import NumberFormat from 'react-number-format'
import 'rc-slider/assets/index.css'

const Wrapper = styled.div`
  width: 100%;
  position: relative;

  .input-wrapper {
    position: relative;
    input {
      margin: 5px 0 8px;
      font-size: 20px;
      font-weight: normal;
      line-height: 24px;
      color: var(--color-black);
      border: none;
      max-width: 100%;
      width: 100%;
      background: transparent;
    }
    .input-editable {
      position: absolute;
      right: 5px;
      width: 16px;
      top: 10px;
      opacity: 0.9;
      pointer-events: none;
    }
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

const RangeInput = ({
  label = null,
  min = 0,
  max,
  value,
  disabled,
  readOnly,
  onChange,
  inputProps = {},
  sliderProps = {},
}) => {
  return (
    <Wrapper className={`slider`}>
      <label>{label}</label>
      <div className="input-wrapper">
        <NumberFormat
          {...inputProps}
          value={value}
          thousandSeparator=","
          decimalSeparator="."
          disabled={!!disabled}
          readOnly={!!readOnly}
          onValueChange={({ floatValue }) => onChange && onChange(floatValue)}
        />
        {!disabled && !readOnly && <img className="input-editable" src="/assets/edit.svg" alt="Edit" />}
      </div>
      {!disabled && !readOnly && <Slider {...sliderProps} {...{ min, max, value, onChange, step: 0.01 }} />}
    </Wrapper>
  )
}

export default RangeInput
