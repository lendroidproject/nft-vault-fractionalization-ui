import styled from 'styled-components'

const Button = styled.button`
  background: var(--linear-gradient1);
  color: var(--color-white);
  font-size: 20px;
  font-weight: 700;
  line-height: 24px;
  padding: 7px 20px;
  border-radius: 4px;
  outline: none;

  &.full-width {
    width: 100%;
  }
`;

export default Button;
