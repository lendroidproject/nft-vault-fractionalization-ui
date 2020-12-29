import styled from 'styled-components'

const Wrapper = styled.div`
  background: url('/assets/bg.jpg');
  background-repeat: no-repeat;
  background-size: cover;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 100px 30px 20px;
`

export default function Layout({ children }) {
  return (
    <Wrapper>{children}</Wrapper>
  )
}
