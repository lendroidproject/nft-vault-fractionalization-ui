import { useEffect, useState, useCallback, useMemo } from 'react'
import Link from 'next/link'
import styled from 'styled-components'
import { connect } from 'react-redux'
import BigNumber from 'bignumber.js'
import qs from 'qs'
import Button from 'components/common/Button'
import Vault from 'components/Home/Vault'
import { getAssets } from 'utils/api'
import { format } from 'utils/number'
import { addressLink, openseaLink, networks, connectNetworks, txLink } from 'utils/etherscan'
import { getDuration, useTicker } from 'utils/hooks'
import { shorten } from 'utils/string'
import Gauge from 'components/common/Gauge'

const STATUS = Object.freeze({
  STATUS_NOT_STARTED: -1, // Buyout not started yet
  STATUS_INITIAL: 0, // Buyout started but no bid yet
  STATUS_ACTIVE: 1, // Buyout started and an active bid
  STATUS_REVOKED: 2, // Buyout revoked
  STATUS_ENDED: 3, // Buyout ended
  STATUS_TIMEOUT: 4, // Internal status for "buying out time ended but auction not ended for some reason.
})

const Wrapper = styled.div`
  flex: 1;
  overflow: auto;

  background: var(--color-white);
  padding: 20px 35px;
  width: 1216px;
  max-width: 100%;
  border: 1px solid #979797;
  position: relative;
  .home-header {
    position: relative;
    margin-bottom: 20px;
    .header-title {
      padding-bottom: 12px;
    }
    .home-title {
      font-size: 36px;
      line-height: 43px;
    }
  }
  .home-body {
    .body-title {
      margin-bottom: 16px;
    }
    .content-wrapper {
      max-width: 904px;
      margin: auto;
    }
    .bg-wave {
      margin: 0 -35px;
      padding: 35px;
      background: url(/assets/bg-waves.jpg);
      background-size: cover;
    }
    .desc {
      padding-bottom: 24px;
      margin-bottom: 10px;
    }
    .info-wrapper {
      display: flex;
      background-color: #fbfbfb;
      border: 1px solid #e0e0e0;
      border-radius: 4px;
      margin-bottom: 24px;
      box-shadow: 0 2px 15px 0 rgba(0, 0, 0, 0.14);
      padding: 20px;
    }
    .info-left {
      margin-right: auto;
      padding: 0 20px;
    }
    .info-right {
      border-left: 1px solid var(--color-border);
      padding: 0 20px;
    }
    .subscriptions {
      display: flex;
      justify-content: space-between;
      > div {
        margin-right: 20px;
        &:last-of-type {
          margin-bottom: 0;
        }
      }
      p {
        font-size: 12px;
      }
      h2 {
        font-size: 18px;
      }
      h2 span {
        font-size: 12px;
      }
      a {
        text-decoration: none;
      }
    }
    .balance {
      padding: 20px;
      box-shadow: 0 2px 15px 0 rgba(0, 0, 0, 0.14);
      background-color: #f2f2f2;
      border: 1px solid #e2e2e2;
      border-radius: 4px;
      margin-bottom: 24px;
      > div {
        margin-bottom: 12px;
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

    .launch-app {
      margin-top: 45px;
    }

    .bid-desc {
      margin: 24px 0 20px;
      color: var(--color-dark-grey);
    }

    .or-divider {
      margin: 5px 0;
    }

    .asset-icon {
      border-radius: 50%;
      width: 24px;
      height: 24px;
      margin-right: 6px;
      vertical-align: middle;
    }

    .misc {
      h1 {
        margin-top: 40px;
        margin-bottom: 24px;
      }
      .external-links {
        text-align: center;
        > div {
          margin-bottom: 15px;
        }
        a {
          text-decoration: none;
          font-size: 16px;
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
  .border-bottom {
    border-bottom: 1px solid var(--color-border);
  }
  @media (max-width: 767px) {
    padding: 50px 20px 20px;
  }
`

const RefreshTimer = styled.span`
  position: absolute;
  right: 0;
  bottom: 10px;
  color: #8a4ad0;
  font-size: 14px;

  display: flex;
  align-items: center;

  svg {
    width: 35px;
    height: 35px;
    margin-left: 0px;

    text {
      fill: #ce1fca;
    }

    ellipse {
      fill: #6622cc;
      opacity: 0.2;
      animation: color-change 12s infinite;
      animation-delay: calc(var(--nth-child) / 2 * 1s);
    }
    @keyframes color-change {
      0% {
        fill: #6622cc;
        opacity: 0.2;
      }
      3.33% {
        fill: #ce1fca;
        opacity: 1;
      }
      50% {
        fill: #ce1fca;
        opacity: 1;
      }
      96.66% {
        fill: #6622cc;
        opacity: 0.2;
      }
      100% {
        fill: #6622cc;
        opacity: 0.2;
      }
    }
  }
`

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

const BUYOUT_START_TIME = new Date('12 April 2021 00:00 GMT')

export default connect((state) => state)(function Home({ library, eventTimestamp }) {
  const [now] = useTicker()
  const [assets, setAssets] = useState([])
  const [data, setData] = useState(null)
  // const buyoutStatus = now < BUYOUT_START_TIME.getTime() ? STATUS.STATUS_NOT_STARTED : data?.buyoutInfo?.status
  const buyoutStatus = data?.buyoutInfo?.status

  const countDown = getCountDownTimer(BUYOUT_START_TIME.getTime())

  const loadData = (first) => {
    const {
      symbol: symbol0,
      totalSupply: token0TotalSupply,
    } = library.methods.Token0
    const {
      symbol: symbol2,
      // totalSupply: token1TotalSupply,
    } = library.methods.Token2
    const {
      EPOCH_PERIOD,
      HEART_BEAT_START_TIME,
      epochs,
      status,
      startThreshold,
      highestBidder,
      highestBidValues,
      currentBidId,
      currentEpoch,
      currentBidToken0Staked,
      stopThresholdPercent,
      redeemToken2Amount,
    } = library.methods.Buyout
    const { getBlock } = library.methods.web3

    const resolveOnly = (promise, defaults = '0') =>
      new Promise((resolve) =>
        promise.then(resolve).catch((err) => {
          resolve(defaults)
        })
      )

    Promise.all([
      getBlock(),
      // contributors(),
      first
        ? Promise.all([
            resolveOnly(EPOCH_PERIOD()),
            resolveOnly(HEART_BEAT_START_TIME()),
            resolveOnly(stopThresholdPercent()),
            symbol0(),
            symbol2(),
          ])
        : Promise.resolve(null),
      Promise.all([
        resolveOnly(epochs(1)),
        resolveOnly(status(), -1),
        resolveOnly(startThreshold()),
        resolveOnly(currentBidToken0Staked()),
        token0TotalSupply(),
        resolveOnly(highestBidder()),
        resolveOnly(highestBidValues(0)),
        resolveOnly(currentBidId()),
        resolveOnly(currentEpoch()),
        resolveOnly(redeemToken2Amount()),
      ]),
    ])
      .then(
        ([
          lastTimestamp,
          // contributors,
          buyoutInfo,
          [
            epochs,
            status,
            startThreshold,
            currentBidToken0Staked,
            token0TotalSupply,
            bidder,
            bidValue,
            currentBidId,
            currentEpoch,
            redeemToken2Amount,
          ],
        ]) => {
          const newData = {
            ...data,
            lastTimestamp: new Date(lastTimestamp * 1000),
            timestamp: Date.now(),
            bidder,
            bidValue: library.web3.utils.fromWei(bidValue),
            totalSupply: [library.web3.utils.fromWei(token0TotalSupply)],
            currentBidId,
            currentEpoch,
            redeemToken2Amount: library.web3.utils.fromWei(redeemToken2Amount),
            rate: new BigNumber(redeemToken2Amount).dividedBy(token0TotalSupply).toNumber(),
            buyoutInfo: {
              ...(data && data.buyoutInfo),
              epochs: Number(epochs),
              status: Number(status),
              startThreshold: new BigNumber(library.web3.utils.fromWei(startThreshold)).plus('250000').toString(10),
              currentBidToken0Staked: Number(library.web3.utils.fromWei(currentBidToken0Staked)),
            },
          }
          if (buyoutInfo) {
            const [EPOCH_PERIOD, HEART_BEAT_START_TIME, stopThresholdPercent, symbol0, symbol2] = buyoutInfo
            newData.buyoutInfo = {
              ...newData.buyoutInfo,
              EPOCH_PERIOD,
              HEART_BEAT_START_TIME,
              endTime: (+HEART_BEAT_START_TIME + EPOCH_PERIOD * epochs) * 1000,
              stopThresholdPercent,
              symbol: [symbol0, symbol2],
            }
          } else {
            newData.buyoutInfo.endTime =
              (+data.buyoutInfo.HEART_BEAT_START_TIME + data.buyoutInfo.EPOCH_PERIOD * epochs) * 1000
          }
          // Please see the "STATUS_TIMEOUT" explanation above
          if (newData?.buyoutInfo?.status === STATUS.STATUS_ACTIVE && now > newData?.buyoutInfo?.endTime) {
            newData.buyoutInfo.status = STATUS.STATUS_TIMEOUT
          }
          setData(newData)
        }
      )
      .catch(console.log)
  }

  const vetoMeter = useMemo(() => {
    if (data?.totalSupply[0] && data?.buyoutInfo?.currentBidToken0Staked && data?.buyoutInfo?.stopThresholdPercent) {
      const numerator = data?.buyoutInfo?.currentBidToken0Staked
      const denominator = (data.totalSupply[0] * data.buyoutInfo.stopThresholdPercent) / 100
      return [numerator, denominator, (numerator / denominator) * 100]
    }
    return [0, 0, 0]
  }, [data?.totalSupply[0], data?.buyoutInfo?.currentBidToken0Staked, data?.buyoutInfo?.stopThresholdPercent])

  useEffect(() => {
    if (library && !data) {
      loadData(true)
    }
  }, [library, data])
  useEffect(() => {
    if (eventTimestamp && data && eventTimestamp > data.timestamp) {
      loadData()
    }
  }, [eventTimestamp, data])

  useEffect(() => {
    if (library?.methods?.Vault) {
      const queryAssets = async function () {
        try {
          const assetsCount = await library.methods.Vault.totalAssets()
          const tokenAssets = await library.methods.Vault.assets(0, assetsCount)
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
  }, [library?.methods?.Vault])

  return (
    <Wrapper>
      <div className="home-header">
        <div className="header-title border-bottom">
          <h1 className="col-pink center home-title">THE BIG B.20 BUYOUT</h1>
        </div>
      </div>
      <div className="home-body">
        <div className="body-content">
          <div className="content-wrapper center">
            <div className="body-title">
              <h1>Vesting, drip distribution and buyout</h1>
            </div>
            <div className="desc">
              Apart from the 16% public sale, all other allocations had a three-month vesting period.
              However, the tokens were not locked up in the conventional sense. The first 10% of the tokens were made immediately available.
              The smart contract enabled a linear 'drip distribution', where the remaining 90% was made available at the rate of 1% a day.
              <br/><br/>
              To ensure that the B.20 project left all avenues of financial upsides open for its patrons, a buyout clause was built in.
              Successful buyouts would transfer the proceeds to all B20 token holders, pro rata.
            </div>
          </div>
          <div className="bg-wave">
            <div className="content-wrapper">
              <div className="info-wrapper">
                <div className="info-left">
                  <h3 className="light bid-desc">
                    To place a bid, you need DAI and 1% of all B20. To veto a bid, you just need B20.
                    A bid is vetoed if 12% of all B20 is staked.
                  </h3>
                  {buyoutStatus === STATUS.STATUS_NOT_STARTED ? (
                    <div className="subscriptions">
                      <div>
                        <h3 className="light">Buyout begins in</h3>
                        <div className="count-down">
                          <h2 className="col-green light">{countDown ? countDown.timer : ''}</h2>
                        </div>
                      </div>
                    </div>
                  ) : buyoutStatus === STATUS.STATUS_TIMEOUT ? (
                    <div className="subscriptions">
                      <div>
                        <p>Buyout Clock</p>
                        <h2 className="light" style={{ fontSize: '125%' }}>
                          Buyout has ended with a winning bid of {format(data.bidValue, 2)} by &nbsp;
                          <a href={addressLink(data.bidder, library?.wallet?.network)} target="_blank">
                            {shorten(data.bidder, 10)}
                          </a>.
                          <br />
                          B20 redemption will be enabled soon.
                        </h2>
                      </div>
                    </div>
                  ) : buyoutStatus === STATUS.STATUS_ENDED ? (
                    <div className="subscriptions">
                      <div>
                        <p>Buyout Clock</p>
                        <h2 className="light" style={{ fontSize: '125%' }}>
                          {data ? `B20 is available for redemption @ ${format(data.rate, 2)} DAI per B20` : '---'}
                        </h2>
                      </div>
                    </div>
                  ) : (
                    <div className="subscriptions">
                      <div>
                        <p>Buyout Clock</p>
                        {data ? (
                          buyoutStatus === STATUS.STATUS_ACTIVE ? (
                            <h2 className="col-green light">Ends in {getDuration(now, data.buyoutInfo.endTime)}</h2>
                          ) : (
                            <h2 className="light">Awaiting minimum bid of {format(data.buyoutInfo.startThreshold)} DAI</h2>
                          )
                        ) : (
                          <h2 className="light">...</h2>
                        )}
                      </div>
                      {buyoutStatus === STATUS.STATUS_ACTIVE && (
                        <div>
                          <p>Highest Bid:</p>
                          <h2>
                            {buyoutStatus === STATUS.STATUS_ACTIVE ? (
                              <>
                                <img className="asset-icon" src="/assets/dai.svg" alt="DAI" />
                                {format(data.bidValue, 0)} DAI &nbsp;&nbsp;
                                <span>
                                  by{' '}
                                  <a href={addressLink(data.bidder, library?.wallet?.network)} target="_blank">
                                    {shorten(data.bidder)}
                                  </a>
                                </span>
                              </>
                            ) : (
                              '---'
                            )}
                          </h2>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="info-right">
                  <div>
                    <Gauge value={vetoMeter[2]} max={vetoMeter[1]} />
                  </div>
                </div>
              </div>
            </div>
            <div className="content-wrapper">
              <div className="item-list">
                <Vault assets={assets} loading={!assets.length} />
              </div>
              <div className="center launch-app">
                <Link href="/buyout">
                  <Button>Launch App</Button>
                </Link>
              </div>
            </div>
          </div>
          <div className="content-wrapper center">
            <div className="misc">
              <h1>NFTs in the Bundle: {assets.length}</h1>
              <div className="external-links flex justify-around">
                <div>
                  <a href={addressLink(library?.addresses?.Token0, library?.wallet?.network)} target="_blank">
                    B20 token contract <img src="/assets/external-link.svg" />
                  </a>
                </div>
                <div>
                  <a href={addressLink(library?.addresses?.Buyout, library?.wallet?.network)} target="_blank">
                    Buyout Contract <img src="/assets/external-link.svg" />
                  </a>
                </div>
                <div>
                  <a href={openseaLink(library?.addresses?.Vault, library?.wallet?.network)} target="_blank">
                    View Bundle on Opensea <img src="/assets/external-link.svg" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Wrapper>
  )
})
