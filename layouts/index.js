import styled from 'styled-components'
import { connect } from 'react-redux'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Button from 'components/common/Button'
import Account from './Account'

const Wrapper = styled.div`
  background: url('/assets/bg.jpg') rgba(5,5,5,.4);
  background-repeat: no-repeat;
  background-size: cover;
  background-blend-mode: overlay;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  padding: 20px 30px;
  .app-header {
    max-width: 1216px;
    width: 100%;
    margin-bottom: 10px;
    padding: 0 0 0 35px;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    .app-logo{
      > img {
        width: 70px;
      }
    }
    .app-menu {
      button {
        margin: 10px 5px;
        background: rgba(255,255,255,0.2);
        border: 2px solid var(--color-pink);
        border-radius: 4px;
        min-width: 145px;
        padding: 8px 16px;

        &.active {
          background: var(--color-pink);
        }

        &:last-of-type {
          margin-right: 0;
        }
      }
    }
  }
  @media(max-width: 767px) {
    padding: 20px 20px;
    .app-header {
      padding: 0 20px;
    }
  }
`

export default connect((state) => state)(function Layout({ children, metamask }) {
  const router = useRouter()
  return (
    <Wrapper>
      <div className="app-header">
        <div className="app-logo">
          <img src="/assets/logo.svg" alt="B20" />
        </div>
        <div className="app-menu">
          <Link href="/">
            <Button className={router.pathname === '/' ? 'active' : 'inactive'}>Buyout</Button>
          </Link>
          <Link href="/about">
            <Button className={router.pathname === '/about' ? 'active' : 'inactive'}>Know B20</Button>
          </Link>
          <Link href="/market1">
            <Button className={router.pathname === '/market1' ? 'active' : 'inactive'}>Sale 1</Button>
          </Link>
          <Link href="/market2">
            <Button className={router.pathname === '/market2' ? 'active' : 'inactive'}>Sale 2</Button>
          </Link>
        </div>
      </div>
      {metamask && metamask.connected && children}
      <Account />
    </Wrapper>
  )
})
