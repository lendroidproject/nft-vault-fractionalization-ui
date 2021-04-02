import { useEffect, useState, useCallback, useMemo, createRef } from 'react'
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
  bottom: 0;
`

const MIN_ALLOWANCE = 10 ** 10
const REFRESH_TIME = 60

export default connect((state) => state)(function Home({ metamask, library, eventTimestamp }) {
  const [now] = useTicker()
  const [assets, setAssets] = useState([])
  const [data, setData] = useState(null)
  const [showBidModal, setShowBidModal] = useState(false)
  const [showVetoModal, setShowVetoModal] = useState(false)
  const [showRedeemModa, setShowRedeemModal] = useState(false)
  const [pendingTx, setPendingTx] = useState('')
  const meterRef = createRef()
  const [meterWidth, setMeterWidth] = useState(0)

  useEffect(() => {
    if (meterRef && meterRef.current) setMeterWidth(meterRef.current.offsetWidth)
  }, [data])

  const buyoutStatus = data?.buyoutInfo?.status

  const loadData = (first) => {
    const { totalAssets } = library.methods.Vault
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

    Promise.all([
      totalAssets(),
      getBlock(),
      // contributors(),
      first
        ? Promise.all([EPOCH_PERIOD(), HEART_BEAT_START_TIME(), stopThresholdPercent(), symbol0(), symbol2()])
        : Promise.resolve(null),
      Promise.all([
        epochs(1),
        status(),
        startThreshold(),
        currentBidToken0Staked(),
        balance0(metamask.address),
        balance2(metamask.address),
        allowance0(metamask.address, library.addresses.Buyout),
        allowance2(metamask.address, library.addresses.Buyout),
        token0TotalSupply(),
        highestBidder(),
        highestBidValues(0),
        currentBidId(),
        currentEpoch(),
        token0Staked(metamask.address),
        lastVetoedBidId(metamask.address),
        redeemToken2Amount(),
      ]),
    ])
      .then(
        ([
          totalAssets,
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
            totalAssets,
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
              currentBidToken0Staked: library.web3.utils.fromWei(currentBidToken0Staked),
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
          <RefreshTimer className="refresh-timer">Refreshing in {timer} seconds</RefreshTimer>
        </div>
      </div>
      <div className="home-body">
        <div className="body-content flex justify-between">
          <div className="body-right">
            <div className="body-title">
              <h4 className="uppercase">B20 Buyout</h4>
            </div>
            <div className="desc">
              Welcome to the Big B.20 Buyout. With a minimum bid of $10 mn (tentative estimate), you can begin the
              buyout process. for the entire bundle.
              <br />
              <br />
              Your bid will stand for 48 epochs (each epoch is 8 hours), during which time someone else can outbid you,
              or the community can veto the bid with a 25% consensus. If the community veto is successful, the minimum
              bid increases by 8%.
              <br />
              <br />
              Good luck!
            </div>
            <div className="item-list">
              <AssetList assets={assets} loading={!assets.length} />
            </div>
          </div>
          <div className="body-left">
            {buyoutStatus === STATUS.STATUS_TIMEOUT ? (
              <div className="subscriptions">
                <div>
                  <p>Buyout Clock</p>
                  <h2 className="light" style={{ fontSize: '125%' }}>
                    Buyout has ended with a winning bid of {format(data.bidValue, 2)} by&nbsp;
                    <a href={addressLink(data.bidder, library?.wallet?.network)} target="_blank">
                      {shorten(data.bidder)}
                    </a>.
                    <br/>
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
                    To place a bid, you need DAI and 5% of all B20. To veto a bid, you just need B20.
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
            {[STATUS.STATUS_ENDED, STATUS.STATUS_TIMEOUT].includes(buyoutStatus) ? (
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
