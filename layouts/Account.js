import React, { Component } from 'react'
import { connect } from 'react-redux'
import Web3Modal from 'web3modal'
import WalletConnectProvider from '@walletconnect/web3-provider'
import Library from 'whalestreet-js'
import { infuras, isSupportedNetwork, networkLabel, networks } from 'utils/etherscan'

const addresses = {
  ShardToken: '0xD12A8a39AA6948929D4Cb87bf54dF712EC677d7c',
  ShardGenerationEvent: '0x4c5e4041B41350BF8d1EBA8539e9589722DF07C1',
  Vault: '0x3BdBC45dd655CE22261fCB483F14271a22547b12',
}

let web3Modal

const providerOptions = (network) => ({
  walletconnect: {
    package: WalletConnectProvider,
    options: {
      infuraId: infuras[network],
    },
  },
  // fortmatic: {
  //   package: Fortmatic,
  //   options: {
  //     key: fortmatics[network],
  //     network: network === 1 ? null : networkLabel(network).toLowerCase(),
  //   },
  // },
})

class Account extends Component {
  state = {
    network: networks[0],
  }

  async componentDidMount() {
    const session = {
      network: networks[0],
    }
    this.setState(
      {
        session,
      },
      () => {
        this.setWeb3Modal(session.network)
        this.connectWallet()
      }
    )
  }

  componentWillUnmount() {
    if (this.library) this.library.onDisconnect()
  }

  setWeb3Modal(network) {
    if (web3Modal) {
      web3Modal.clearCachedProvider()
    }
    web3Modal = new Web3Modal({
      cacheProvider: false,
      providerOptions: providerOptions(network),
      disableInjectedProvider: false,
    })
  }

  connectWallet() {
    web3Modal
      .connect()
      .then((provider) => {
        this.initLibrary(provider)
      })
      .catch(console.log)
  }

  initLibrary(provider) {
    if (this.props.library) {
      this.props.library.setProvider(provider, addresses)
    } else {
      const { dispatch } = this.props
      const handleEvent = (event) => {
        switch (event.event) {
          case 'ContributionReceived':
            dispatch({
              type: 'EVENT_DATA',
              payload: Date.now(),
            })
            break
          case 'WALLET':
            if (event.status === 3) {
              dispatch({
                type: 'DISCONNECT',
              })
            } else {
              if (event.status !== 0) {
                this.props.library.setProvider(provider, addresses)
              }
              dispatch({
                type: 'METAMASK',
                payload: event.data,
              })
            }
            break
          default:
            break
        }
      }
      const library = new Library.B20(provider, {
        onEvent: handleEvent,
        addresses,
      })
      dispatch({
        type: 'INIT_CONTRACTS',
        payload: [library],
      })
    }
  }

  saveMetamask({ state, ...updates }, callback) {
    const { dispatch, metamask } = this.props
    dispatch({
      type: 'METAMASK',
      payload: { ...metamask, ...updates },
    })
    if (state) this.setState(state)
    callback && callback()
  }

  render() {
    return null
  }
}

export default connect((state) => state)(Account)
