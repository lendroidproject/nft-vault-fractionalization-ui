import styled from 'styled-components'
import Account from './Account'

const Wrapper = styled.div`
  background: url('/assets/bg.jpg');
  background-repeat: no-repeat;
  background-size: cover;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  .app-logo {
    max-width: 1216px;
    width: 100%;
    margin-bottom: 10px;
    padding: 0 35px;
    > img {
      width: 70px;
    }
    
  }
  @media(max-width: 767px) {
    padding: 20px 20px;
    .app-logo {
      padding: 0 20px;
    }
  }
`

export default function Layout({ children }) {
  return (
    <Wrapper>
      <div className="app-logo">
        <img src="/assets/logo.svg" alt="B20" />
      </div>
      {children}
      <Account />
    </Wrapper>
  )
}
