import { useEffect, useState } from 'react'
import styled from 'styled-components'
import { connect } from 'react-redux'
import Button from 'components/common/Button'
import qs from 'qs';
import AssetList from 'components/Home/AssetList'
import { getAssets } from 'utils/api'
import { format } from 'utils/number'
import { addressLink, openseaLink } from 'utils/etherscan'
import B20Spinner from 'components/common/B20Spinner'

const Wrapper = styled.div`
  background: var(--color-white);
  padding: 24px 35px 20px;
  width: 1216px;
  max-width: 100%;
  border: 1px solid #979797;
  position: relative;
  .home-header {
    position: relative;
    margin-bottom: 20px;
    .header-title {
      padding-bottom: 8px;
    }
  }
  .home-body {
    .body-title {
      margin-bottom: 8px;
    }
    .body-right {
      width: calc(100% - 360px);
    }
    .body-left {
      width: 310px;
    }
    .desc {
      padding-bottom: 24px;
      margin-bottom: 10px;
    }
    .subscriptions {
      padding: 20px;
      box-shadow: 0 2px 15px 0 rgba(0,0,0,0.14);
      background-color: #FBFBFB;
      border: 1px solid #E0E0E0;
      border-radius: 4px;
      margin-bottom: 24px;
      > div {
        margin-bottom: 20px;
        &:last-of-type {
          margin-bottom: 0;
        }
      }
      p {
        font-size: 12px;
        margin-bottom: 5px;
      }
    }
    .balance {
      padding: 20px;
      box-shadow: 0 2px 15px 0 rgba(0,0,0,0.14);
      background-color: #F2F2F2;
      border: 1px solid #E2E2E2;
      border-radius: 4px;
      margin-bottom: 24px;
      > div {
        margin-bottom: 16px;
        &:last-of-type {
          margin-bottom: 0;
        }
      }
      p {
        font-size: 12px;
      }
      .balance-desc {
        font-size: 15px;
        line-height: 18px;
      }
      .asset-balance {
        font-size: 18px;
        line-height: 21px;
      }
    }

    .asset-icon {
      border-radius: 50%;
      width: 24px;
      height: 24px;
      margin-right: 6px;
      vertical-align: bottom;
    }

    @media (max-width: 991px) {
      .body-content {
        flex-direction: column;
      }
      .body-right,
      .body-left {
        width: 100%;
        margin-bottom: 40px;
      }
    }
  }
  .border-bottom {
    border-bottom: 1px solid var(--color-border);
  }
  @media (max-width: 767px) {
    padding: 50px 20px 20px;
  }
`

export default connect((state) => state)(function Home({ metamask, library, eventTimestamp }) {
  const [assets, setAssets] = useState([])
  const [data, setData] = useState(null)

  const loading = !data
  const loadData = () => {
    const {
      totalAssets,
    } = library.methods.Vault
    const { getBlock } = library.methods.web3

    Promise.all([
      totalAssets(),
      getBlock(),
      // contributors(),
    ])
      .then(
        ([
          totalAssets,
          lastTimestamp,
          // contributors,
        ]) => {
          console.log({
            totalAssets,
            lastTimestamp,
          })
          setData({
            totalAssets,
            lastTimestamp: new Date(lastTimestamp * 1000),
            timestamp: Date.now(),
          })
        }
      )
      .catch(console.log)
  }
  useEffect(() => {
    if (library && !data && metamask.address) {
      loadData()
    }
  }, [library, data, metamask])
  useEffect(() => {
    if (eventTimestamp && data && eventTimestamp > data.timestamp) {
      loadData()
    }
  }, [eventTimestamp, data])

  useEffect(() => {
    if (data?.totalAssets && Number(data.totalAssets) > 0) {
      const queryAssets = async function () {
        try {
          const tokenAssets = await library.methods.Vault.assets(0, data.totalAssets)
          const result = await getAssets(
            {
              token_ids: tokenAssets.map(({ tokenId }) => tokenId),
              asset_contract_addresses: tokenAssets.map(({ tokenAddress }) => tokenAddress),
              limit: 50,
              offset: 0
            },
            {
              paramsSerializer: params => {
                return qs.stringify(params, { arrayFormat: "repeat" })
              }
            }
          )
          if (result?.data?.assets) {
            const assets = result.data.assets.map(asset => {
              const matching = tokenAssets.find((e) => e.tokenId === asset.token_id)
              asset.category = matching ? matching.category : 'Other'
              return asset
            })
            setAssets(assets)
          }
        } catch (err) {
          console.log(err)
        }
      }
      queryAssets()
    }
  }, [data?.totalAssets])

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
        <div className="body-content flex justify-between">
          <div className="body-right">
            <div className="body-title">
              <h4 className="uppercase">B20 Buyout</h4>
            </div>
            <div className="desc">
              Welcome to the Big B.20 Buyout. With a minimum bid of $12 mn, you can begin the buyout process. for the entire bundle.
              <br />
              <br />
              Your bid will stand for 14 days, during which time someone else can outbid you,
              or the community can veto the bid with a 25% consensus. Good luck!
            </div>
            <div className="item-list">
              <AssetList assets={assets} loading={!assets.length} />
            </div>
          </div>
          <div className="body-left">
            <div className="subscriptions">
              <div>
                <p>Buyout Clock</p>
                <h2 className="col-green light">
                  Begins on the 3rd of March, 2021, at 12am GMT
                </h2>
              </div>
              {/* <div>
                <p>Total Contributions:</p>
                <h2>
                  <img className="asset-icon" src="/assets/dai.svg" alt="DAI" />1000 DAI
                </h2>
              </div> */}
            </div>
            <div className="balance">
              <div>
                <h4 className="light balance-desc">
                  To participate, you need DAI, B20 or a combination of the two.
                </h4>
              </div>
              {/* <div><h3 className="col-blue">You have</h3></div>
              <div>
                <h3 className="light asset-balance">
                  <img className="asset-icon" src="/assets/dai.svg" alt="DAI" /> 320,0000
                </h3>
              </div>
              <div>
                <h3 className="light asset-balance">
                  <img className="asset-icon" src="/assets/b20.svg" alt="B20" /> 20,0000
                </h3>
              </div> */}
            </div>
          </div>
        </div>
      </div>
    </Wrapper>
  )
})
