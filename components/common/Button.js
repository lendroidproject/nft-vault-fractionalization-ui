import styled from 'styled-components'

const Button = styled.button`
  background: var(--linear-gradient1);
  color: var(--color-white);
  font-size: 20px;
  font-weight: 700;
  line-height: 24px;
  padding: 9px 20px;
  border-radius: 4px;
  outline: none;

  &.full-width {
    width: 100%;
  }
  &.btn-icon {
    width: 30px;
    height: 30px;
    border-radius: 50%;
  }
  &.btn-outline {
    position: relative;
    color: var(--color-black);
    background: linear-gradient(to bottom,#ddb2ea,#b0f0f6);
    border-radius: 4px;
    font-size: 20px;
    line-height: 24px;
    padding: 2px;
    span {
      display: inline-block;
      align-items: center;
      justify-content: space-between;
      background: #f9ffff;
      padding: 5px 9px;
      border-radius: 2px;
      box-sizing: border-box;
      width: 100%;
      height: 100%;
      z-index: 0;
    }
  }
  :disabled {
    opacity: 0.7
  }
`;

export default Button;
