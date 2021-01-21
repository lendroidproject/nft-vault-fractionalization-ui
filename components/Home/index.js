import { useEffect, useState } from 'react'
import styled from 'styled-components'
import { connect } from 'react-redux'
import Button from 'components/common/Button'
import qs from 'qs';
import AssetList from './AssetList'
import ContributionsModal, { PAGE_SIZE } from './ContributionsModal'
import { getAssets } from 'utils/api'
import { format } from 'utils/number'
import { addressLink, openseaLink } from 'utils/etherscan'
import Spinner from 'components/common/Spinner'
import PurchaseModal from './PurchaseModal'

const HomeWrapper = styled.div`
  background: var(--color-white);
  padding: 24px 35px 20px;
  width: 1216px;
  max-width: 100%;
  border: 1px solid #979797;
  position: relative;
  .spinner {
    z-index: 1000;
    position: fixed;
  }
  .home-header {
    position: relative;
    .header-title {
      padding-bottom: 8px;
    }
    .header-stats {
      p {
        font-size: 12px;
      }
      margin: 20px 0;
      > div {
        margin: 10px 0;
      }
    }
    .status-tag {
      background-color: var(--color-green);
      color: var(--color-white);
      font-size: 12px;
      line-height: 15px;
      border-radius: 5px;
      padding: 1px 24px;
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
      background: var(--linear-gradient1);
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
  @media (max-width: 767px) {
    padding: 50px 20px 20px;
  }
`

const MIN_ALLOWANCE = 10 ** 8;

export default connect((state) => state)(function Home({ metamask, library, eventTimestamp }) {
  const [assets, setAssets] = useState([])
  
  const [showContributors, setShowContributors] = useState()
  const [showPurchase, setShowPurchase] = useState(false)
  const toNumber = library && library.web3.utils.fromWei

  const [data, setData] = useState(null)
  const loading = !data
  const loadData = () => {
    const {
      // contributors,
      contributions,
      marketEnd,
      totalCap,
      totaltoken1Paid,
      totalBuyers,
      token0PerToken1,
    } = library.methods.Market
    const { balanceOf, name } = library.methods.Token0
    const { name: contributeToken, balanceOf: token1Balance, getAllowance: allowance } = library.methods.Token1
    const {
      totalAssets,
    } = library.methods.Vault
    const { getBlock } = library.methods.web3

    Promise.all([
      name(),
      balanceOf(),
      contributeToken(),
      token1Balance(metamask.address),
      allowance(metamask.address),
      contributions(metamask.address),
      marketEnd(),
      totalCap(),
      totaltoken1Paid(),
      token0PerToken1(),
      totalBuyers(),
      totalAssets(),
      getBlock(),
      // contributors(),
    ])
      .then(
        ([
          name,
          balanceOf,
          contributeToken,
          token1Balance,
          allowance,
          contributions,
          marketEnd,
          totalCap,
          totaltoken1Paid,
          token0PerToken1,
          totalBuyers,
          totalAssets,
          lastTimestamp,
          // contributors,
        ]) => {
          console.log({
            name,
            balanceOf,
            contributeToken,
            token1Balance,
            allowance,
            contributions,
            marketEnd,
            totalCap,
            totaltoken1Paid,
            token0PerToken1,
            totalBuyers,
            totalAssets,
            lastTimestamp,
          })
          setData({
            name,
            balanceOf: toNumber(balanceOf),
            contributeToken,
            token1Balance: toNumber(token1Balance),
            allowance: toNumber(allowance),
            contributions: {
              hasWithdrawn: contributions.token0Withdrawn,
              weiContributed: toNumber(contributions.token1Amount),
            },
            deadline: new Date(marketEnd * 1000),
            totalCap: toNumber(totalCap),
            totaltoken1Paid: toNumber(totaltoken1Paid),
            token0PerToken1: toNumber(token0PerToken1),
            totalBuyers,
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

  const [purchaseTx, setPurchaseTx] = useState('')
  const handleUnlock = () => {
    const { approve } = library.methods.Token1
    approve(library.web3.utils.toWei(MIN_ALLOWANCE.toString()), {
      from: metamask.address,
    })
      .send()
      .on('transactionHash', function (hash) {
      })
      .on('receipt', function (receipt) {
        setData({
          ...data,
          allowance: MIN_ALLOWANCE
        })
      })
      .on('error', (err) => {
        console.log(err)
      })
  }
  const handlePurchase = (token1Amount) => {
    const { contributeWei } = library.methods.Market
    contributeWei(library.web3.utils.toWei(token1Amount.toString()), {
      from: metamask.address,
    })
      .send()
      .on('transactionHash', function (hash) {
        setPurchaseTx(hash)
        setShowPurchase(false)
      })
      .on('receipt', function (receipt) {
        setPurchaseTx('')
      })
      .on('error', (err) => {
        console.log(err)
        setPurchaseTx('')
      })
  }
  const [claimTx, setClaimTx] = useState('')
  const handleClaim = () => {
    const { claimShards } = library.methods.Market
    claimShards({ from: metamask.address })
      .send()
      .on('transactionHash', function (hash) {
        setClaimTx(hash)
      })
      .on('receipt', function (receipt) {
        setClaimTx('')
      })
      .on('error', (err) => {
        console.log(err)
        setClaimTx('')
      })
  }

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

  if (loading) return <Spinner />

  const token0Total = data.totalCap / data.token0PerToken1;
  const token0Sold = data.totaltoken1Paid / data.token0PerToken1;
  const token0Remaining = token0Total - token0Sold;

  return (
    <HomeWrapper>
      <div className="home-header">
        <div className="header-title border-bottom">
          <h1 className="col-pink">
            Market
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
              {format(token0Remaining, 2)} of {format(token0Total, 2)}
            </h4>
          </div>
          <div>
            <p>Price per Shard:</p>
            <h4 className="light">
              {format(data.token0PerToken1)} {data.contributeToken}
            </h4>
          </div>
          <div>
            <p>Valuation:</p>
            <h4 className="light">{format(data.totalCap)}</h4>
          </div>
          <div>
            <p>Deadline:</p>
            <h4 className="light">{data.deadline.toISOString()}</h4>
          </div>
          <div>
            <p>Status:</p>
            {data.lastTimestamp.getTime() < data.deadline.getTime() && <span className="status-tag">Live</span>}
          </div>
        </div>
      </div>
      <div className="home-body">
        <div className="body-title border-bottom">
          <h4 className="uppercase">Description</h4>
        </div>
        <div className="body-content flex justify-between">
          <div className="body-right">
            <div className="desc">
              B.20 is a Metapurse project that tokenizes one of the most historic and valuable art projectsin the NFT space -
              The Beeple 20 Collection and the newly built VR museums it lives in - to share it with the metaverse. 
              <br />
              <br />
              B20s are the tokens that represent ownership of this bundle.
              They are the keys that allow you to unlock the financial upside of the bundle, including from a possible buyout.
            </div>
            <div className="item-list">
              <AssetList assets={assets} />
            </div>
          </div>
          <div className="body-left">
            <div className="subscriptions">
              <div>
                <p>Total {data.contributeToken} Contributed:</p>
                <h4 className="light">{format(data.totaltoken1Paid)}</h4>
              </div>
              <div>
                <p>Total Shards Subscribed:</p>
                <h4 className="light">{format(data.totaltoken1Paid / data.token0PerToken1, 2)}</h4>
              </div>
              <div>
                <p># Subscribers:</p>
                <h4 className="light">{format(data.totalBuyers)}</h4>
              </div>
            </div>
            <div className="misc">
              <h2>Number Inside : {data.totalAssets}</h2>
              <div className="external-links">
                <div>
                  <a href={addressLink(library.addresses.Token0, metamask.network)} target="_blank">
                    {data.name} token contract <img src="/assets/external-link.svg" />
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
                <a
                  className="gradient-box"
                  href="/"
                  onClick={(e) => {
                    e.preventDefault()
                    setShowContributors(true)
                  }}
                >
                  <span>
                    Contributions <img src="/assets/external-link-black.svg" />
                  </span>
                </a>
              </div>
              <div className="purcahse">
                {data.lastTimestamp.getTime() < data.deadline.getTime() ? (
                  <>
                    {Number(data.allowance) < Number(data.token1Balance) ? (
                      <Button className="full-width" onClick={handleUnlock}>
                        Unlock
                      </Button>
                    ) : (
                      <Button className="full-width" onClick={() => setShowPurchase(true)} disabled={purchaseTx}>
                        Purchase
                      </Button>
                    )}
                  </>
                ) : (
                  !data.contributions.hasWithdrawn &&
                  data.contributions.weiContributed > 0 && (
                    <Button className="full-width" onClick={handleClaim} disabled={claimTx}>
                      Claim Shards
                    </Button>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {showContributors && (
        <ContributionsModal
          total={data.totalBuyers}
          toNumber={toNumber}
          onPage={(page) => {
            const { contributors } = library.methods.Market
            return contributors(page * PAGE_SIZE, Math.min(data.totalBuyers - page * PAGE_SIZE, PAGE_SIZE))
          }}
          show={showContributors}
          onHide={() => setShowContributors(false)}
        />
      )}
      <PurchaseModal
        token0Name={data.name}
        token1Name={data.contributeToken}
        token1Balance={data.token1Balance}
        token0PerToken1={data.token0PerToken1}
        purchaseTx={purchaseTx}
        show={showPurchase}
        onHide={() => setShowPurchase(false)}
        onContinue={handlePurchase}
      />
      {(purchaseTx || claimTx) && <Spinner />}
    </HomeWrapper>
  )
})
