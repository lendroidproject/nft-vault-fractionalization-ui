import { useEffect, useState } from 'react'
import styled from 'styled-components'
import Button from 'components/common/Button'
import ItemList from './ItemList'
import AssetModal from './AssetModal'
import { getAssets } from 'utils/api'

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
    background: #F9FFFF;
    border: solid 2px transparent; /* !importanté */
    border-radius: 4px;
    text-decoration: none;
    font-size: 14px;
    line-height: 17px;
  
    &:before {
      content: '';
      position: absolute;
      top: 0; right: 0; bottom: 0; left: 0;
      z-index: 0;
      margin: -2px; /* !importanté */
      border-radius: inherit; /* !importanté */
      background: linear-gradient(to bottom, #ddb2ea, #b0f0f6);
    }

    span {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #F9FFFF;
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
export default function Home() {
  const [assets, setAssets] = useState([])
  const [showAssetModal, setShowAssetModal] = useState(false)
  const [selectedAsset, setSelectedAsset] = useState()
  const [selectedCategory, setSelectedCategory] = useState()

  const shardData = {
    name: 'B20 SHARD',
    total: 1000000,
    available: 2333,
    price: 0.1,
    deadline: new Date()
  }
  const subscription = {
    totalContribution: 20.25,
    totalShards: 27000,
    subscribers: 8
  }
  const numberInside = 35

  const handleClickAsset = (category, item) => {
    setSelectedCategory(category)
    setSelectedAsset(item)
    setShowAssetModal(true)
  }

  const handleCloseAssetModal = () => {
    setSelectedAsset(false)
  }

  useEffect(() => {
    const queryAssets = async function() {
      const result = await getAssets({ limit: 50, offset: 0 })
      setAssets(result.data.assets)
    }
    queryAssets()
  }, [])

  console.log(assets)

  return (
    <HomeWrapper>
      <div className="home-header">
        <div className="header-logo">
          <img src="/assets/b20.svg" alt="B20" />
        </div>
        <div className="header-title border-bottom">
          <h1>B20 SHARD: WHALEBUNDLES</h1>
        </div>
        <div className="header-stats flex-wrap justify-between">
          <div>
            <p>Shard name:</p>
            <h4 className="light">{shardData.name}</h4>
          </div>
          <div>
            <p>Shards available:</p>
            <h4 className="light">{shardData.available} / {shardData.total}</h4>
          </div>
          <div>
            <p>Price per Shard:</p>
            <h4 className="light">{shardData.price} ETH</h4>
          </div>
          <div>
            <p>Valuation:</p>
            <h4 className="light">{shardData.total * shardData.price}</h4>
          </div>
          <div>
            <p>Deadline:</p>
            <h4 className="light">{shardData.deadline.toString()}</h4>
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
              Sed ut perspiciatis, unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam eaque ipsa, quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt, explicabo. Nemo enim ipsam voluptatem,.
              <br/><br/>
              Quia voluptas sit, aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos, qui ratione voluptatem sequi nesciunt, neque porro quisquam est, qui dolorem ipsum, quia dolor sit amet consectetur adipisci[ng]velit, sed quia non numquam [do] eius modi tempora inci[di]dunt, ut labore et dolore.
            </div>
            <div className="item-list">
              <ItemList items={assets} onClickItem={handleClickAsset} />
            </div>
          </div>
          <div className="body-left">
            <div className="subscriptions">
              <div>
                <p>Total ETH Contributed:</p>
                <h4 className="light">{subscription.totalContribution}</h4>
              </div>
              <div>
                <p>Total Shards Subscribed:</p>
                <h4 className="light">{subscription.totalShards}</h4>
              </div>
              <div>
                <p># Subscribers:</p>
                <h4 className="light">{subscription.subscribers}</h4>
              </div>
            </div>
            <div className="misc">
              <h2>Number Inside : {numberInside}</h2>
              <div className="external-links">
                <div><a href="#" target="_blank">Shard Token <img src="/assets/external-link.svg" /></a></div>
                {/* <div><a href="#" target="_blank">NFT Details <img src="/assets/external-link.svg" /></a></div> */}
                <div><a href="#" target="_blank">Opensea <img src="/assets/external-link.svg" /></a></div>
              </div>
              <div className="contributions">
                <a className="gradient-box" href="#" target="_blank">
                  <span>Contributions <img src="/assets/external-link-black.svg" /></span>
                </a>
              </div>
              <div className="purcahse">
                <Button className="full-width">Purchase</Button>
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
}
