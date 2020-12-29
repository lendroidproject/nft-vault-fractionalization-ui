import { useEffect, useState } from 'react'
import styled from 'styled-components'
import { connect } from 'react-redux'
import Button from 'components/common/Button'
import ItemList from './ItemList'
import AssetModal from './AssetModal'
import { getAssets } from 'utils/api'
import { format } from 'utils/number'
import { addressLink, openseaLink } from 'utils/etherscan'
import Spinner from 'components/common/Spinner'

const HomeWrapper = styled.div`
  background: var(--color-white);
  padding: 52px 35px 20px;
  width: 1216px;
  max-width: 100%;
  border: 1px solid #979797;
  .home-header {
    position: relative;
    .header-title {
      padding-bottom: 8px;
    }
    .header-stats {
      margin: 30px 0;
    }
    .header-logo {
      position: absolute;
      right: -16px;
      top: -130px;
    }
    .status-tag {
      background-color: var(--color-green);
      color: var(--color-white);
      margin-left: 20px;
      font-size: 10px;
      line-height: 12px;
      border-radius: 5px;
      padding: 6px 12px;
      display: inline-block;
      vertical-align: text-bottom;
      font-weight: normal;
    }
  }
  .home-body {
    .body-title {
      padding-bottom: 8px;
      margin-bottom: 12px;
    }
    .body-right {
      width: 790px;
    }
    .body-left {
      width: 310px;
    }
    .desc {
      margin-bottom: 24px;
    }
    .subscriptions {
      padding: 20px;
      border: 1px solid var(--color-border);
      border-radius: 4px;
      margin-bottom: 24px;
      > div {
        margin-bottom: 24px;
        &:last-of-type {
          margin-bottom: 0;
        }
      }
      p {
        font-size: 12px;
      }
    }
    .misc {
      h2 {
        margin-bottom: 20px;
      }
      .external-links {
        margin-bottom: 24px;
        > div {
          margin-bottom: 15px;
        }
        a {
          text-decoration: none;
          img {
            margin-left: 4px;
            vertical-align: bottom;
          }
        }
      }
      .contributions {
        margin-bottom: 78px;
      }
    }
  }
  .gradient-box {
    display: flex;
    position: relative;
    color: var(--color-black);
    background: #f9ffff;
    border: solid 2px transparent; /* !importanté */
    border-radius: 4px;
    text-decoration: none;
    font-size: 14px;
    line-height: 17px;

    &:before {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      z-index: 0;
      margin: -2px; /* !importanté */
      border-radius: inherit; /* !importanté */
      background: linear-gradient(to bottom, #ddb2ea, #b0f0f6);
    }

    span {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #f9ffff;
      padding: 7px 9px;
      border-radius: 2px;
      width: 100%;
      z-index: 0;
    }
  }
  .border-bottom {
    border-bottom: 1px solid var(--color-border);
  }
`
export default connect((state) => state)(function Home({ metamask, library }) {
  const [assets, setAssets] = useState([])
  const [showAssetModal, setShowAssetModal] = useState(false)
  const [selectedAsset, setSelectedAsset] = useState()
  const [selectedCategory, setSelectedCategory] = useState()

  const handleClickAsset = (category, item) => {
    setSelectedCategory(category)
    setSelectedAsset(item)
    setShowAssetModal(true)
  }

  const handleCloseAssetModal = () => {
    setSelectedAsset(false)
  }

  useEffect(() => {
    const queryAssets = async function () {
      const result = await getAssets({ limit: 50, offset: 0 })
      setAssets(result.data.assets)
    }
    queryAssets()
  }, [])

  const [data, setData] = useState(null)
  const loading = !data
  useEffect(() => {
    if (library && loading) {
      const {
        contributors,
        endTimestamp,
        shardPerWeiContributed,
        totalCapWeiAmount,
        totalWeiContributed,
      } = library.methods.ShardGenerationEvent
      const { balanceOf, name } = library.methods.ShardToken
      const { assets } = library.methods.Vault
      const toNumber = library.web3.utils.fromWei

      Promise.all([
        contributors(),
        endTimestamp(),
        shardPerWeiContributed(),
        totalCapWeiAmount(),
        totalWeiContributed(),
        balanceOf(),
        name(),
        assets(),
        library.methods.web3.getBlock(),
      ])
        .then(
          ([
            contributors,
            endTimestamp,
            shardPerWeiContributed,
            totalCapWeiAmount,
            totalWeiContributed,
            balanceOf,
            name,
            assets,
            lastTimestamp,
          ]) => {
            // const data = {
            //   name: 'B20 SHARD',
            //   total: 1000000,
            //   available: 2333,
            //   price: 0.1,
            //   deadline: new Date(),
            // }
            // const subscription = {
            //   totalContribution: 20.25,
            //   totalShards: 27000,
            //   subscribers: 8,
            // }
            // const numberInside = 35

            setData({
              name,
              total: toNumber(shardPerWeiContributed) * toNumber(totalWeiContributed),
              available: toNumber(balanceOf),
              price: toNumber(totalCapWeiAmount),
              deadline: new Date(endTimestamp * 1000),
              totalContribution: toNumber(totalWeiContributed),
              totalShards: toNumber(shardPerWeiContributed) * toNumber(totalWeiContributed),
              subscribers: contributors.length,
              contributors,
              numberInside: assets.length,
              assets,
              lastTimestamp: new Date(lastTimestamp * 1000),
            })
          }
        )
        .catch(console.log)
    }
  }, [library, loading])

  const [purchaseTx, setPurchseTx] = useState('')
  const handlePurchase = () => {
    const { contributeWei } = library.methods.ShardGenerationEvent
    contributeWei({ from: metamask.address, gas: 3000000, value: library.web3.utils.toWei(Math.random().toString()) })
      .send()
      .on('transactionHash', function (hash) {
        setPurchseTx(hash)
      })
      .on('receipt', function (receipt) {
        console.log(receipt)
        setPurchseTx('')
      })
      .on('error', (err) => {
        console.log(err)
        setPurchseTx('')
      })
  }

  if (loading) return <Spinner />

  return (
    <HomeWrapper>
      <div className="home-header">
        <div className="header-logo">
          <img src="/assets/b20.svg" alt="B20" />
        </div>
        <div className="header-title border-bottom">
          <h1>
            B20 SHARD: WHALEBUNDLES
            {(data.lastTimestamp.getTime() < data.deadline.getTime()) && (<span className="status-tag">Status: LIVE</span>)}
          </h1>
        </div>
        <div className="header-stats flex-wrap justify-between">
          <div>
            <p>Shard name:</p>
            <h4 className="light">{data.name}</h4>
          </div>
          <div>
            <p>Shards available:</p>
            <h4 className="light">
              {format(data.available)} / {format(data.total)}
            </h4>
          </div>
          <div>
            <p>Price per Shard:</p>
            <h4 className="light">{format(data.price, 0)} ETH</h4>
          </div>
          <div>
            <p>Valuation:</p>
            <h4 className="light">{format(data.total * data.price)}</h4>
          </div>
          <div>
            <p>Deadline:</p>
            <h4 className="light">{data.deadline.toString()}</h4>
          </div>
        </div>
      </div>
      <div className="home-body">
        <div className="body-title border-bottom">
          <h4 className="col-blue uppercase">Description</h4>
        </div>
        <div className="body-content flex justify-between">
          <div className="body-right">
            <div className="desc">
              Sed ut perspiciatis, unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam
              rem aperiam eaque ipsa, quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt,
              explicabo. Nemo enim ipsam voluptatem,.
              <br />
              <br />
              Quia voluptas sit, aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos, qui ratione
              voluptatem sequi nesciunt, neque porro quisquam est, qui dolorem ipsum, quia dolor sit amet consectetur
              adipisci[ng]velit, sed quia non numquam [do] eius modi tempora inci[di]dunt, ut labore et dolore.
            </div>
            <div className="item-list">
              <ItemList items={assets} onClickItem={handleClickAsset} />
            </div>
          </div>
          <div className="body-left">
            <div className="subscriptions">
              <div>
                <p>Total ETH Contributed:</p>
                <h4 className="light">{format(data.totalContribution)}</h4>
              </div>
              <div>
                <p>Total Shards Subscribed:</p>
                <h4 className="light">{format(data.totalShards)}</h4>
              </div>
              <div>
                <p># Subscribers:</p>
                <h4 className="light">{format(data.subscribers, 0)}</h4>
              </div>
            </div>
            <div className="misc">
              <h2>Number Inside : {data.numberInside}</h2>
              <div className="external-links">
                <div>
                  <a href={addressLink(library.addresses.ShardToken, metamask.network)} target="_blank">
                    Shard Token <img src="/assets/external-link.svg" />
                  </a>
                </div>
                {/* <div><a href="#" target="_blank">NFT Details <img src="/assets/external-link.svg" /></a></div> */}
                <div>
                  <a href={openseaLink(library.addresses.Vault, metamask.network)} target="_blank">
                    Opensea <img src="/assets/external-link.svg" />
                  </a>
                </div>
              </div>
              <div className="contributions">
                <a className="gradient-box" href="#" target="_blank">
                  <span>
                    Contributions <img src="/assets/external-link-black.svg" />
                  </span>
                </a>
              </div>
              <div className="purcahse">
                {(data.lastTimestamp.getTime() < data.deadline.getTime()) && (
                  <Button className="full-width" onClick={handlePurchase} disabled={purchaseTx}>
                    Purchase
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {selectedAsset && (
        <AssetModal
          category={selectedCategory}
          asset={selectedAsset}
          show={showAssetModal}
          onHide={handleCloseAssetModal}
        />
      )}
    </HomeWrapper>
  )
})
