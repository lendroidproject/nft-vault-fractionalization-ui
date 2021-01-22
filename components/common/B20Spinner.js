import styled from 'styled-components'

const B20SpinnerWrapper = styled.div`
  display: inline-block;
  max-width: 300px;

  >img {
    max-width: 100%;
  }
`;

export default function B20Spinner(props) {
  return(
    <B20SpinnerWrapper {...props}>
      <img src="/assets/B20-spinner.gif" />  
    </B20SpinnerWrapper>
  )
}