import styled from 'styled-components'
import Button from 'components/common/Button'

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
  .card {
    width: 423px;
    border: 1px solid #E0E0E0;
    border-radius: 4px;
    background-color: #FBFBFB;
    box-shadow: 0 2px 15px 0 rgba(0,0,0,0.14);
    margin: 24px auto;
    padding: 20px;
    .redeem-bg {
      border-radius: 4px;
      border: 6px solid #D8D8D8;
      background-color: #D8D8D8;
      margin-bottom: 16px;
      display: flex;
      > img {
        max-width: 100%;
      }
    }
    .last-buyout {
      margin-top: 20px;
      > div {
        margin-bottom: 10px;
      }
    }
    .card-body{
      margin-bottom:30px;
      p {
        font-size: 11px;
        line-height: 13px;
        color: var(--color-grey);
      }
    }
    .card-footer {
      text-align: center;
    }
  }
  .border-bottom {
    border-bottom: 1px solid var(--color-border);
  }
  @media (max-width: 767px) {
    padding: 50px 20px 20px;
  }
`

export default function Redeem() {
  return (
    <Wrapper>
      <div className="home-header">
        <div className="header-title border-bottom">
          <h1 className="col-pink">
            REDEEM
          </h1>
        </div>
      </div>
      <div className="home-body">
        <div className="card">
          <div className="card-body">
            <div className="redeem-bg">
              <img src="/assets/redeem-bg.png" alt="Redeem" />
            </div>
            <h2>B20 KEYS</h2>
            <p>
              This most epic of bundles - composed of 20 iconic Beeple 1/1 everydays, grand museums on sprawling lands in Cryptovoxels,
              Decentraland and Somnium - has now been bought out. The financial upside belongs to all B20 token holders.
            </p>
            <div className="last-buyout">
              <div className="flex justify-between flex-center">
                <h3 className="light label">Buyout Ended on:</h3>
                <h3 className="value col-red">23:01:2021</h3>
              </div>
              <div className="flex justify-between flex-center">
                <h3 className="light label">This Edition Last Sold For:</h3>
                <h2 className="value">1200 DAI</h2>
              </div>
            </div>
          </div>
          <div className="card-footer">
            <Button>REDEEM B20</Button>
          </div>
        </div>
      </div>
    </Wrapper>
  )
}
