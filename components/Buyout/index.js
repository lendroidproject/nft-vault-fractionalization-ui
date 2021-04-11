import { useEffect, useState, useCallback, useMemo } from 'react'
import styled from 'styled-components'
import { connect } from 'react-redux'
import BigNumber from 'bignumber.js'
import qs from 'qs'
import Button from 'components/common/Button'
import AssetList from 'components/Markets/AssetList'
import { getAssets } from 'utils/api'
import { format } from 'utils/number'
import { addressLink, openseaLink, networks, connectNetworks, txLink } from 'utils/etherscan'
import { getDuration, useTicker } from 'utils/hooks'
import { shorten } from 'utils/string'
import BidModal from 'components/Buyout/BidModal'
import VetoModal from 'components/Buyout/VetoModal'
import RedeemModal from 'components/Buyout/RedeemModal'
import SpinnerModal from 'components/common/SpinnerModal'
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
      box-shadow: 0 2px 15px 0 rgba(0, 0, 0, 0.14);
      background-color: #fbfbfb;
      border: 1px solid #e0e0e0;
      border-radius: 4px;
      margin-bottom: 24px;
      text-align: center;
      > div {
        margin-bottom: 20px;
        &:last-of-type {
          margin-bottom: 0;
        }
      }
      p {
        font-size: 12px;
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

    .or-divider {
      margin: 5px 0;
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

const MIN_ALLOWANCE = 10 ** 10
const REFRESH_TIME = 60

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

const BUYOUT_START_TIME = new Date('12 April 2021 00:00 GMT');

export default connect((state) => state)(function Home({ metamask, library, eventTimestamp }) {
  const [now] = useTicker()
  const [assets, setAssets] = useState([])
  const [data, setData] = useState(null)
  const [showBidModal, setShowBidModal] = useState(false)
  const [showVetoModal, setShowVetoModal] = useState(false)
  const [showRedeemModa, setShowRedeemModal] = useState(false)
  const [pendingTx, setPendingTx] = useState('')

  const buyoutStatus = now < BUYOUT_START_TIME.getTime() ? STATUS.STATUS_NOT_STARTED : data?.buyoutInfo?.status
  const countDown = getCountDownTimer(BUYOUT_START_TIME.getTime())

  const loadData = (first) => {
    const {
      symbol: symbol0,
      balanceOf: balance0,
      getAllowance: allowance0,
      totalSupply: token0TotalSupply,
    } = library.methods.Token0
    const {
      symbol: symbol2,
      balanceOf: balance2,
      getAllowance: allowance2,
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
      token0Staked,
      lastVetoedBidId,
      currentBidToken0Staked,
      stopThresholdPercent,
      redeemToken2Amount,
    } = library.methods.Buyout
    const { getBlock } = library.methods.web3

    const resolveOnly = (promise, defaults = '0') => new Promise(resolve => promise.then(resolve).catch(() => resolve(defaults)))

    Promise.all([
      getBlock(),
      // contributors(),
      first
        ? Promise.all([
          resolveOnly(EPOCH_PERIOD()),
          resolveOnly(HEART_BEAT_START_TIME()),
          resolveOnly(stopThresholdPercent()),
          symbol0(),
          symbol2()
        ])
        : Promise.resolve(null),
      Promise.all([
        resolveOnly(epochs(1)),
        resolveOnly(status(), -1),
        resolveOnly(startThreshold()),
        resolveOnly(currentBidToken0Staked()),
        balance0(metamask.address),
        balance2(metamask.address),
        allowance0(metamask.address, library.addresses.Buyout),
        allowance2(metamask.address, library.addresses.Buyout),
        token0TotalSupply(),
        resolveOnly(highestBidder()),
        resolveOnly(highestBidValues(0)),
        resolveOnly(currentBidId()),
        resolveOnly(currentEpoch()),
        resolveOnly(token0Staked(metamask.address)),
        resolveOnly(lastVetoedBidId(metamask.address)),
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
            balance0,
            balance2,
            allowance0,
            allowance2,
            token0TotalSupply,
            bidder,
            bidValue,
            currentBidId,
            currentEpoch,
            token0Staked,
            lastVetoedBidId,
            redeemToken2Amount,
          ],
        ]) => {
          const newData = {
            ...data,
            lastTimestamp: new Date(lastTimestamp * 1000),
            timestamp: Date.now(),
            bidder,
            bidValue: library.web3.utils.fromWei(bidValue),
            balance: [library.web3.utils.fromWei(balance0), library.web3.utils.fromWei(balance2)],
            allowance: [library.web3.utils.fromWei(allowance0), library.web3.utils.fromWei(allowance2)],
            totalSupply: [library.web3.utils.fromWei(token0TotalSupply)],
            currentBidId,
            currentEpoch,
            token0Staked: library.web3.utils.fromWei(token0Staked),
            lastVetoedBidId,
            redeemToken2Amount: library.web3.utils.fromWei(redeemToken2Amount),
            rate: redeemToken2Amount / token0TotalSupply,
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

  const [timer, setTimer] = useState(REFRESH_TIME)
  useEffect(() => {
    if (timer > 0) {
      setTimer(timer - 1)
    } else {
      setTimer(REFRESH_TIME)
      loadData()
    }
  }, [now, setData])

  const handleBid = (total, token2) => {
    if (library?.methods?.Buyout?.placeBid && total && token2) {
      library.methods.Buyout.placeBid(
        library.web3.utils.toWei(total.toString()),
        library.web3.utils.toWei(token2.toString()),
        {
          from: metamask.address,
        }
      )
        .send()
        .on('transactionHash', function (hash) {
          setPendingTx(hash)
          setShowBidModal(false)
        })
        .on('receipt', function (receipt) {
          setPendingTx('')
          loadData()
        })
        .on('error', (err) => {
          setPendingTx('')
        })
    }
  }

  const handleVeto = (amount) => {
    if (library?.methods?.Buyout?.veto && amount) {
      library.methods.Buyout.veto(library.web3.utils.toWei(amount.toString()), {
        from: metamask.address,
      })
        .send()
        .on('transactionHash', function (hash) {
          setPendingTx(hash)
        })
        .on('receipt', function (receipt) {
          setPendingTx('')
          loadData()
        })
        .on('error', (err) => {
          setPendingTx('')
        })
    }
  }

  const handleExtend = () => {
    if (library?.methods?.Buyout?.extendVeto) {
      library.methods.Buyout.extendVeto({
        from: metamask.address,
      })
        .send()
        .on('transactionHash', function (hash) {
          setPendingTx(hash)
        })
        .on('receipt', function (receipt) {
          setPendingTx('')
          loadData()
        })
        .on('error', (err) => {
          setPendingTx('')
        })
    }
  }

  const handleWithdraw = (amount) => {
    if (library?.methods?.Buyout?.withdrawStakedToken0 && amount) {
      library.methods.Buyout.withdrawStakedToken0(library.web3.utils.toWei(amount.toString()), {
        from: metamask.address,
      })
        .send()
        .on('transactionHash', function (hash) {
          setPendingTx(hash)
        })
        .on('receipt', function (receipt) {
          setPendingTx('')
          loadData()
        })
        .on('error', (err) => {
          setPendingTx('')
        })
    }
  }

  const handleApproveToken0 = (amount) => {
    const { approve } = library.methods.Token0
    const allowAmount = Math.max(amount, MIN_ALLOWANCE)
    approve(library.addresses.Buyout, library.web3.utils.toWei(allowAmount.toString()), {
      from: metamask.address,
    })
      .send()
      .on('transactionHash', function (hash) {
        setPendingTx(hash)
      })
      .on('receipt', function (receipt) {
        setPendingTx('')
        data['allowance'][0] = allowAmount
        setData({ ...data })
      })
      .on('error', (err) => {
        setPendingTx('')
        console.log(err)
      })
  }

  const handleApproveToken2 = (amount) => {
    const { approve } = library.methods.Token2
    const allowAmount = Math.max(amount, MIN_ALLOWANCE)
    approve(library.addresses.Buyout, library.web3.utils.toWei(allowAmount.toString()), {
      from: metamask.address,
    })
      .send()
      .on('transactionHash', function (hash) {
        setPendingTx(hash)
      })
      .on('receipt', function (receipt) {
        setPendingTx('')
        data['allowance'][1] = allowAmount
        setData({ ...data })
      })
      .on('error', (err) => {
        setPendingTx('')
        console.log(err)
      })
  }

  const handleRedeem = (amount) => {
    if (library?.methods?.Buyout?.redeem && amount) {
      library.methods.Buyout.redeem(library.web3.utils.toWei(amount.toString()), {
        from: metamask.address,
      })
        .send()
        .on('transactionHash', function (hash) {
          setPendingTx(hash)
        })
        .on('receipt', function (receipt) {
          setPendingTx('')
          setShowRedeemModal(false)
          loadData()
        })
        .on('error', (err) => {
          setPendingTx('')
        })
    }
  }

  const getRequiredToken0ToBid = useCallback(
    async (total, token2) => {
      let result = 0
      if (library?.methods?.Buyout?.requiredToken0ToBid && total && token2) {
        try {
          result = await library.methods.Buyout.requiredToken0ToBid(
            library.web3.utils.toWei(total.toString()),
            library.web3.utils.toWei(token2.toString())
          )
          result = Number(library.web3.utils.fromWei(result)).toFixed(2)
        } catch (err) {
          console.log(err)
        }
      }
      return result
    },
    [library?.methods?.Buyout?.requiredToken0ToBid]
  )

  const vetoMeter = useMemo(() => {
    if (data?.totalSupply[0] && data?.buyoutInfo?.currentBidToken0Staked && data?.buyoutInfo?.stopThresholdPercent) {
      const numerator = data?.buyoutInfo?.currentBidToken0Staked
      const denominator = (data.totalSupply[0] * data.buyoutInfo.stopThresholdPercent) / 100
      return [numerator, denominator, (numerator / denominator) * 100]
    }
    return [0, 0, 0]
  }, [data?.totalSupply[0], data?.buyoutInfo?.currentBidToken0Staked, data?.buyoutInfo?.stopThresholdPercent])

  useEffect(() => {
    if (library && !data && metamask.address) {
      loadData(true)
    }
  }, [library, data, metamask])
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

  const validNetwork = library && networks.includes(library.wallet.network)
  if (!validNetwork)
    return (
      <Wrapper className="bg-opacity-07 flex-all">
        <h3>{connectNetworks()}</h3>
      </Wrapper>
    )

  return (
    <Wrapper>
      <div className="home-header">
        <div className="header-title border-bottom">
          <h1 className="col-pink">THE BIG B.20 BUYOUT</h1>
          <RefreshTimer className="refresh-timer">
            Refreshing in
            <svg width="126px" height="128px" viewBox="0 0 126 128">
              <g id="Artboard" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                <g id="Group-2" transform="translate(5.000000, 4.000000)">
                  <text x="46%" y="50%" style={{ fontSize: 45 }} fill="balck" textAnchor="middle" dominantBaseline="middle">
                    {timer}
                  </text>
                  <g id="Group">
                    <ellipse cx="58.1176471" cy="8.10191083" rx="8.10588235" ry="8.10191083"></ellipse>
                    <ellipse cx="82.2823529" cy="16.5095541" rx="8.10588235" ry="8.10191083"></ellipse>
                    <ellipse cx="103.082353" cy="30.7261146" rx="8.10588235" ry="8.10191083"></ellipse>
                    <ellipse cx="108.894118" cy="56.1019108" rx="8.10588235" ry="8.10191083"></ellipse>
                    <ellipse cx="102.164706" cy="82.089172" rx="8.10588235" ry="8.10191083"></ellipse>
                    <ellipse cx="86.2588235" cy="102.726115" rx="8.10588235" ry="8.10191083"></ellipse>
                    <ellipse cx="59.8" cy="111.898089" rx="8.10588235" ry="8.10191083"></ellipse>
                    <ellipse cx="33.3411765" cy="103.184713" rx="8.10588235" ry="8.10191083"></ellipse>
                    <ellipse cx="14.2235294" cy="84.6878981" rx="8.10588235" ry="8.10191083"></ellipse>
                    <ellipse cx="8.10588235" cy="59.3121019" rx="8.10588235" ry="8.10191083"></ellipse>
                    <ellipse cx="14.5294118" cy="34.3949045" rx="8.10588235" ry="8.10191083"></ellipse>
                    <ellipse cx="33.0352941" cy="16.3566879" rx="8.10588235" ry="8.10191083"></ellipse>
                  </g>
                </g>
              </g>
            </svg>
          </RefreshTimer>
        </div>
      </div>
      <div className="home-body">
        <div className="body-content flex justify-between">
          <div className="body-right">
            <div className="body-title">
              <h4 className="uppercase">B20 Buyout</h4>
            </div>
            <div className="desc">
              Welcome to the Big B.20 Buyout. With a minimum bid of $58 million, you can begin the buyout process, for the entire bundle.
              <br />
              <br />
              Your bid will stand for 48 epochs (each epoch is 8 hours), during which time someone else can outbid you.
              If outbid, the new bid stands for 9 epochs. The community can veto a bid with a 12% consensus. 
              If the community veto is successful, the minimum bid increases by 8%.
              <br />
              <br />
              Good luck!
            </div>
            <div className="item-list">
              <AssetList assets={assets} loading={!assets.length} />
            </div>
          </div>
          <div className="body-left">
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
                    Buyout has ended with a winning bid of {format(data.bidValue, 2)} by&nbsp;
                    <a href={addressLink(data.bidder, library?.wallet?.network)} target="_blank">
                      {shorten(data.bidder)}
                    </a>
                    .
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
                    {data ? `B20 is available for redemption @ ${format(rate, 2)} DAI per B20` : '---'}
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
                  <>
                    <div>
                      <p>Highest Bid:</p>
                      <h2>
                        {buyoutStatus === STATUS.STATUS_ACTIVE ? (
                          <>
                            <img className="asset-icon" src="/assets/dai.svg" alt="DAI" />
                            {format(data.bidValue, 0)} DAI
                            <br />
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
                    <div>
                      <Gauge value={vetoMeter[2]} max={vetoMeter[1]} />
                    </div>
                  </>
                )}
              </div>
            )}
            {buyoutStatus !== STATUS.STATUS_ENDED && (
              <div className="balance center">
                <div>
                  <h4 className="light balance-desc">
                    To place a bid, you need DAI and 1% of all B20.
                    To veto a bid, you just need B20.
                    A bid is vetoed if 12% of all B20 is staked.
                  </h4>
                </div>
                <div>
                  <h3 className="col-blue light">You currently have</h3>
                </div>
                <div>
                  <h3 className="light asset-balance">
                    <img className="asset-icon" src="/assets/dai.svg" alt="DAI" /> {data && format(data.balance[1], 0)}
                  </h3>
                </div>
                <div>
                  <h3 className="light asset-balance">
                    <img className="asset-icon" src="/assets/b20.svg" alt="B20" /> {data && format(data.balance[0], 0)}
                  </h3>
                </div>
              </div>
            )}
            {(buyoutStatus !== STATUS.STATUS_NOT_STARTED) && (
              [STATUS.STATUS_ENDED, STATUS.STATUS_TIMEOUT].includes(buyoutStatus) ? (
                <Button
                  className="full-width"
                  onClick={() => setShowRedeemModal(true)}
                  disabled={buyoutStatus !== STATUS.STATUS_ENDED}
                >
                  Redeem
                </Button>
              ) : (
                <>
                  <Button className="full-width" onClick={() => setShowBidModal(true)}>
                    Bid
                  </Button>
                  <h3 className="center light or-divider">or</h3>
                  <Button
                    className="full-width grey"
                    onClick={() => setShowVetoModal(true)}
                    disabled={![STATUS.STATUS_ACTIVE, STATUS.STATUS_REVOKED].includes(buyoutStatus)}
                  >
                    Veto
                  </Button>
                </>
              )
            )}
          </div>
        </div>
      </div>
      <BidModal
        minTotal={
          buyoutStatus === STATUS.STATUS_ACTIVE
            ? new BigNumber(data?.bidValue).plus(1).toNumber(10)
            : data?.buyoutInfo?.startThreshold
        }
        b20Balance={data?.balance[0]}
        b20Allowance={data?.allowance[0]}
        daiBalance={data?.balance[1]}
        daiAllowance={data?.allowance[1]}
        getRequiredB20={getRequiredToken0ToBid}
        show={showBidModal}
        onHide={() => setShowBidModal(false)}
        onContinue={handleBid}
        onApproveB20={handleApproveToken0}
        onApproveDai={handleApproveToken2}
        contract={addressLink(library.addresses.Buyout, library.wallet.network)}
      />
      <VetoModal
        vetoDisabled={buyoutStatus === STATUS.STATUS_REVOKED}
        b20Staked={data?.token0Staked}
        lastVetoedBidId={data?.lastVetoedBidId}
        currentBidId={data?.currentBidId}
        epochPassed={buyoutStatus === STATUS.STATUS_ACTIVE && data?.buyoutInfo.epochs >= data?.currentEpoch}
        b20Balance={data?.balance[0]}
        b20Allowance={data?.allowance[0]}
        contract={addressLink(library.addresses.Buyout, library.wallet.network)}
        show={showVetoModal}
        onHide={() => setShowVetoModal(false)}
        onVeto={handleVeto}
        onExtend={handleExtend}
        onWithdraw={handleWithdraw}
        onApproveB20={handleApproveToken0}
        gauge={data && { value: vetoMeter[2], max: vetoMeter[1] }}
      />
      <RedeemModal
        rate={data?.rate}
        b20Balance={data?.balance[0]}
        b20Allowance={data?.allowance[0]}
        show={showRedeemModa}
        onHide={() => setShowRedeemModal(false)}
        onRedeem={handleRedeem}
        onApproveB20={handleApproveToken0}
      />
      <SpinnerModal show={!!pendingTx}>
        <h3 className="col-white">
          <br />
          <br />
          Transaction hash:
          <br />
          <a className="col-white light" href={txLink(pendingTx, library.wallet.network)} target="_blank">
            {shorten(pendingTx, 32)}
          </a>
        </h3>
      </SpinnerModal>
    </Wrapper>
  )
})
