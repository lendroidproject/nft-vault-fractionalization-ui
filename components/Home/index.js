import { useEffect, useState } from 'react'
import styled from 'styled-components'
import { connect } from 'react-redux'
import Button from 'components/common/Button'
import qs from 'qs'
import AssetList from 'components/Home/AssetList'
import ContributionsModal, { PAGE_SIZE } from './ContributionsModal'
import { getAssets } from 'utils/api'
import { format } from 'utils/number'
import { addressLink, openseaLink, networks, connectNetworks, txLink } from 'utils/etherscan'
import { shorten } from 'utils/string'
import B20Spinner from 'components/common/B20Spinner'
import PurchaseModal from 'components/Home/PurchaseModal'
import SpinnerModal from 'components/common/SpinnerModal'
import { useTicker } from 'utils/hooks'

const HomeWrapper = styled.div`
  flex: 1;
  overflow: auto;

  background: var(--color-white);
  padding: 24px 35px 20px;
  width: 1216px;
  max-width: 100%;
  border: 1px solid #979797;
  position: relative;
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
      &.active {
        background-color: var(--color-green);
      }
      &.inactive {
        background-color: #989898;
      }
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
      box-shadow: 0 2px 15px 0 rgba(0, 0, 0, 0.14);
      background-color: #fbfbfb;
      border: 1px solid #e0e0e0;
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
        margin-bottom: 58px;
      }
      .btn-end {
        background: #989898;
        opacity: 1;
        cursor: default;
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

const MIN_ALLOWANCE = 10 ** 8

const getCountDownTimer = (endTime) => {
  let remainingTime = Math.floor((endTime - Date.now()) / 1000)
  const finished = remainingTime <= 0
  if (finished) {
    return {
      finished,
      timer: `${0}D : ${0}H: ${0}M : ${0}S`,
    }
  }
  const days = Math.floor(remainingTime / 86400)
  remainingTime -= days * 86400
  const hours = Math.floor(remainingTime / 3600)
  remainingTime -= hours * 3600
  const mins = Math.floor(remainingTime / 60)
  remainingTime -= mins * 60
  const secs = remainingTime
  return {
    finished,
    timer: `${days} D : ${hours.toString().padStart(2, '0')} H: ${mins
      .toString()
      .padStart(2, '0')} M : ${secs.toString().padStart(2, '0')} S`,
  }
}

let timerHandle

export default connect((state) => state)(function Home({ metamask, library, eventTimestamp }) {
  const [assets, setAssets] = useState([])
  const [showContributors, setShowContributors] = useState()
  const [showPurchase, setShowPurchase] = useState(false)
  const [countDown, setCountDown] = useState()
  const toNumber = library && library.web3.utils.fromWei
  const validNetwork = library && networks.includes(library.wallet.network)
  const [now] = useTicker(5)

  const [data, setData] = useState(null)
  const loading = !data
  const loadData = () => {
    if (!library || !validNetwork) return
    const {
      // contributors,
      totalCap,
      totaltoken1Paid,
      totalBuyers,
      token1PerToken0,
      marketStart,
      marketClosed,
      marketStatus,
    } = library.methods.Market
    const { balanceOf, name, symbol: token0Symbol } = library.methods.Token0
    const { symbol: contributeToken, balanceOf: token1Balance, getAllowance: allowance } = library.methods.Token1
    const { totalAssets } = library.methods.Vault
    const { getBlock } = library.methods.web3

    Promise.all([
      name(),
      token0Symbol(),
      balanceOf(),
      contributeToken(),
      token1Balance(metamask.address),
      allowance(metamask.address),
      totalCap(),
      totaltoken1Paid(),
      token1PerToken0(),
      totalBuyers(),
      totalAssets(),
      getBlock(),
      marketStart(),
      marketClosed(),
      marketStatus(),
      // contributors(),
    ])
      .then(
        ([
          name,
          token0Symbol,
          balanceOf,
          contributeToken,
          token1Balance,
          allowance,
          totalCap,
          totaltoken1Paid,
          token1PerToken0,
          totalBuyers,
          totalAssets,
          lastTimestamp,
          marketStart,
          marketClosed,
          marketStatus,
          // contributors,
        ]) => {
          setData({
            name,
            token0Symbol,
            balanceOf: toNumber(balanceOf),
            contributeToken,
            token1Balance: toNumber(token1Balance),
            allowance: toNumber(allowance),
            totalCap: toNumber(totalCap),
            totaltoken1Paid: toNumber(totaltoken1Paid),
            token1PerToken0: toNumber(token1PerToken0),
            totalBuyers,
            totalAssets,
            lastTimestamp: new Date(lastTimestamp * 1000),
            marketStart: new Date(marketStart * 1000),
            marketClosed,
            marketStatus: Number(marketStatus),
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
    library && loadData()
  }, [now])
  useEffect(() => {
    if (data?.marketStart) {
      if (timerHandle) {
        clearInterval(timerHandle)
      }
      const countDown = getCountDownTimer(data?.marketStart)
      setCountDown(countDown)
      if (!countDown.finished) {
        timerHandle = setInterval(() => {
          const countDown = getCountDownTimer(data?.marketStart)
          setCountDown(countDown)
          if (countDown.finished && timerHandle) clearInterval(timerHandle)
        }, 1000)
      }
      return () => {
        if (timerHandle) clearInterval(timerHandle)
      }
    }
  }, [data?.marketStart])

  const [purchaseTx, setPurchaseTx] = useState('')
  const handleUnlock = () => {
    const { approve } = library.methods.Token1
    approve(library.web3.utils.toWei(MIN_ALLOWANCE.toString()), {
      from: metamask.address,
    })
      .send()
      .on('transactionHash', function (hash) {
        setPurchaseTx(hash)
      })
      .on('receipt', function (receipt) {
        setPurchaseTx('')
        setData({
          ...data,
          allowance: MIN_ALLOWANCE,
        })
      })
      .on('error', (err) => {
        setPurchaseTx('')
        console.log(err)
      })
  }
  const handlePurchase = (token1Amount) => {
    const { contributeWei } = library.methods.Market
    setShowPurchase(false)
    contributeWei(library.web3.utils.toWei(token1Amount.toString()), {
      from: metamask.address,
    })
      .send()
      .on('transactionHash', function (hash) {
        setPurchaseTx(hash)
      })
      .on('receipt', function (receipt) {
        setPurchaseTx('')
      })
      .on('error', (err) => {
        console.log(err)
        setPurchaseTx('')
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
              offset: 0,
            },
            {
              paramsSerializer: (params) => {
                return qs.stringify(params, { arrayFormat: 'repeat' })
              },
            }
          )
          if (result?.data?.assets) {
            const assets = result.data.assets.map((asset) => {
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

  if (!validNetwork)
    return (
      <HomeWrapper className="bg-opacity-07 flex-all">
        <h3>{connectNetworks()}</h3>
      </HomeWrapper>
    )
  if (loading) return <B20Spinner style={{ marginTop: 200 }} />

  const token0Total = data.totalCap / data.token1PerToken0
  const token0Sold = data.totaltoken1Paid / data.token1PerToken0
  const token0Remaining = token0Total - token0Sold

  return (
    <HomeWrapper>
      <div className="home-header">
        <div className="header-title border-bottom">
          <h1 className="col-pink">MARKET</h1>
        </div>
        <div className="header-stats flex-wrap justify-between">
          <div>
            <p>Key name:</p>
            <h4 className="light">{data.name}</h4>
          </div>
          <div>
            <p>Keys available:</p>
            <h4 className="light">
              {format(token0Remaining, 2)} of {format(token0Total, 2)}
            </h4>
          </div>
          <div>
            <p>Price per Key:</p>
            <h4 className="light">
              {format(data.token1PerToken0)} {data.contributeToken}
            </h4>
          </div>
          <div>
            <p>Individual cap:</p>
            <h4 className="light">
              {1000} {data.contributeToken}
            </h4>
          </div>
          <div>
            <p>Valuation:</p>
            <h4 className="light">{format(data.totalCap)}</h4>
          </div>
          <div>
            <p>Status:</p>
            {data.marketStatus === 1 ? (
              <span className="status-tag active">Live</span>
            ) : (
              <span className="status-tag inactive">Closed</span>
            )}
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
              B.20 is a Metapurse project that tokenizes one of the most historic and valuable art projectsin the NFT
              space - The Beeple 20 Collection and the newly built VR museums it lives in - to share it with the
              metaverse.
              <br />
              <br />
              B20s are the tokens that represent ownership of this bundle. They are the keys that allow you to unlock
              the financial upside of the bundle, including from a possible buyout.
            </div>
            <div className="item-list">
              <AssetList assets={assets} loading={!assets.length} />
            </div>
          </div>
          <div className="body-left">
            <div className="subscriptions">
              <div>
                <p>Total Purchases in {data.contributeToken}:</p>
                <h4 className="light">{format(data.totaltoken1Paid)}</h4>
              </div>
              <div>
                <p>Total Keys Purchased:</p>
                <h4 className="light">{format(data.totaltoken1Paid / data.token1PerToken0, 2)}</h4>
              </div>
              <div>
                <p>Keymasters:</p>
                <h4 className="light">{format(data.totalBuyers)}</h4>
              </div>
            </div>
            <div className="misc">
              <h2>NFTs in the Bundle: {data.totalAssets}</h2>
              <div className="external-links">
                <div>
                  <a href={addressLink(library.addresses.Token0, metamask.network)} target="_blank">
                    {data.name} token contract <img src="/assets/external-link.svg" />
                  </a>
                </div>
                <div>
                  <a href={addressLink(library.addresses.Market, metamask.network)} target="_blank">
                    Sale Contract <img src="/assets/external-link.svg" />
                  </a>
                </div>
                <div>
                  <a href={openseaLink(library.addresses.Vault, metamask.network)} target="_blank">
                    View Bundle on Opensea <img src="/assets/external-link.svg" />
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
                    PURCHASES <img src="/assets/external-link-black.svg" />
                  </span>
                </a>
              </div>
              <div className="purcahse">
                {!Number(data.allowance) || Number(data.allowance) < Number(data.token1Balance) ? (
                  <Button className="full-width" onClick={handleUnlock} disabled={!!purchaseTx}>
                    UNLOCK
                  </Button>
                ) : (
                  <>
                    {data.marketClosed ? (
                      // <h4 className="col-red">Sale Has Ended</h4>
                      <Button className="full-width btn-end" disabled={true}>
                        Sale Has Ended
                      </Button>
                    ) : countDown && !countDown.finished ? (
                      <div className="count-down">
                        <h4 className="col-pink">Sale Begins In:</h4>
                        <h2 className="col-green light">{countDown ? countDown.timer : ''}</h2>
                      </div>
                    ) : (
                      <Button className="full-width" onClick={() => setShowPurchase(true)} disabled={!!purchaseTx}>
                        PURCHASE
                      </Button>
                    )}
                  </>
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
          token0Name={data.name}
          token0Symbol={data.token0Symbol}
          token1Symbol={data.contributeToken}
          marketStatus={data.marketStatus}
          token1PerToken0={data.token1PerToken0}
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
        token1PerToken0={data.token1PerToken0}
        purchaseTx={purchaseTx}
        show={showPurchase}
        onHide={() => setShowPurchase(false)}
        onContinue={handlePurchase}
      />
      <SpinnerModal show={!!purchaseTx}>
        <h3 className="col-white">
          <br />
          <br />
          Transaction hash:
          <br />
          <a className="col-white light" href={txLink(purchaseTx, library.wallet.network)} target="_blank">
            {shorten(purchaseTx, 32)}
          </a>
        </h3>
      </SpinnerModal>
    </HomeWrapper>
  )
})
