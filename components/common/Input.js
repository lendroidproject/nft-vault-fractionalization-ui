import React, { useState } from 'react'
import styled from 'styled-components'
import { CopyToClipboard } from 'react-copy-to-clipboard'

const Wrapper = styled.div`
  width: 100%;
  position: relative;

  label {
    display: block;
    margin-bottom: 12px;
  }

  input {
    width: 100%;
    padding: 9px 10px;
    border-radius: 4px;
    border: 1px solid var(--color-border);
    background-color: var(--color-black);
    color: var(--color-white);
    ${(props) => (props.suffix ? 'padding-right: 50px' : '')}

    &:disabled {
      text-overflow: ellipsis;
    }
  }

  .suffix {
    position: absolute;
    right: 0;
    bottom: 0;
    width: 43px;
    height: 40px;
    border-left: 1px solid var(--color-border);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .error {
    position: absolute;
    color: red;
    font-size: 11px;
    top: 100%;
    margin-top: 5px;
  }

  .copy {
    position: absolute;
    padding: 5px;
    height: 24px;
    border-radius: 5px;
    right: 6px;
    top: 6px;

    &.copied {
      opacity: 0;
    }
  }

  .suggestions {
    position: absolute;
    z-index: 1;
    background: white;
    border: 1px solid var(--color-border);
    border-radius: 4px;
    left: 0;
    right: 0;
    top: 100%;
    margin: 0;
    padding: 0;
    list-style: none;

    li {
      padding: 8px;
      cursor: pointer;

      &:hover,
      &.active {
        background: var(--color-border);
      }
    }
  }

  input.blue {
    padding: 15px 25px;
    background: var(--color-bordered);
    border-color: var(--color-bordered);

    + img {
      background: transparent;
      padding: 0;
      border-radius: 0;
      top: calc(50% - 12px);
      right: 15px;
    }
  }
`

const Input = (
  { label, icon, suffix, error, copyable, suggestions, wrapperClass = '', children, ...props }
) => {
  const [focus, setFocus] = useState(false)
  const [copied, setCopied] = useState(false)

  return (
    <Wrapper className={`input ${wrapperClass}`} suffix={!!suffix}>
      {label && <label>{label}</label>}
      <input
        {...props}
        onFocus={() => setFocus(true)}
        onBlur={() => {
          setTimeout(() => setFocus(false), 150)
        }}
      />
      {children}
      {suffix && suffix({ focus })}
      {error && <p className="error">{error}</p>}
      {copyable && (
        <CopyToClipboard
          text={props.value}
          onCopy={() => {
            setCopied(true)
            setTimeout(() => setCopied(false), 3 * 1000)
          }}
        >
          <img src="/assets/copy.svg" alt="" className={`copy cursor ${copied ? 'copied' : ''}`} />
        </CopyToClipboard>
      )}
      {focus && suggestions && suggestions.length > 0 && (
        <ul className="suggestions">
          {suggestions.map((suggestion) => (
            <li
              key={suggestion}
              onClick={() => props.onChange && props.onChange({ target: { value: suggestion } })}
              className={suggestion === props.value ? 'active' : ''}
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </Wrapper>
  )
};

export default Input;
