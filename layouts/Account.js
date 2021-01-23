import React, { Component } from 'react'
import { connect } from 'react-redux'
import Web3Modal from 'web3modal'
import WalletConnectProvider from '@walletconnect/web3-provider'
import Library from 'whalestreet-js'
import { infuras, isSupportedNetwork, networkLabel, networks, networkLabels } from 'utils/etherscan'

const addresses = {
  1: {
    Vault: '0xe846D7aB0BFfF2F0b9B9A818B845Fb99C94786c2',
    Token0: '0xc4De189Abf94c57f396bD4c52ab13b954FebEfD8',
    Token1: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    Market: '0x37DB1941bcc5A687cF8E21aaB7058cDC43DD0b44',
    Buyout: '0x0000000000000000000000000000000000000000',
    Redeem: '0x0000000000000000000000000000000000000000',
  },
  4: {
    Vault: '0x6C66dCC216B2324520bAcB9E3696A9F54238999a',
    Token0: '0xB2B80416aC4534C2aa3c7F0981C1e764f88C3B05',
    Token1: '0xd2eFff4ea9177ba2B220FA1Aec84BDD0ae4199b3',
    Market: '0x143649b40dF5BDAFD7b621e35eD02E59e16E0816',
    Buyout: '0xb3c48fF6830ff7E9597882b207C7aC8191F7F208',
    Redeem: '0x8E8804663920fDFE22778eAAF646E12087A5d4C9',
  },
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
    const contractAddresses = addresses[this.state.session.network]
    if (this.props.library) {
      this.props.library.setProvider(provider, contractAddresses)
    } else {
      const { dispatch } = this.props
      const handleEvent = (event) => {
        switch (event.event) {
          case 'PaymentReceived':
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
                this.props.library.setProvider(provider, contractAddresses)
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
        addresses: contractAddresses,
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
