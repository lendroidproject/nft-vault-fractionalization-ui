import styled from 'styled-components'

const Wrapper = styled.div`
  background: var(--color-white);
  padding: 24px 35px 20px;
  width: 1216px;
  max-width: 100%;
  border: 1px solid #979797;
  position: relative;
  min-height: 630px;
  .home-header {
    position: relative;
    .header-title {
      padding-bottom: 8px;
    }
  }
  .home-body {
    padding: 32px 0;
    h1, p {
      color: var(--color-black);
    }
    a {
      color: var(--color-pink);
      text-decoration: underline;
      font-size: 16px;
    }
  }
  .border-bottom {
    border-bottom: 1px solid var(--color-border);
  }
  @media (max-width: 767px) {
    padding: 50px 20px 20px;
  }
`

export default function Buyout() {
  return (
    <Wrapper>
      <div className="home-header">
        <div className="header-title border-bottom">
          <h1 className="col-pink">
            THE BIG B.20 BUYOUT
          </h1>
        </div>
      </div>
      <div className="home-body">
        <h1 className="center">Coming Soon...</h1>
      </div>
    </Wrapper>
  )
}
