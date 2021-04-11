import React, { Component } from 'react'
import { connect } from 'react-redux'
import styled from 'styled-components'
import Web3Modal from 'web3modal'
import WalletConnectProvider from '@walletconnect/web3-provider'
import Library from 'whalestreet-js'
import { infuras, isSupportedNetwork, networkLabel, networks, networkLabels } from 'utils/etherscan'
import Button from 'components/common/Button'

const addresses = {
  1: {
    Vault: '0xe846D7aB0BFfF2F0b9B9A818B845Fb99C94786c2',
    Token0: '0xc4De189Abf94c57f396bD4c52ab13b954FebEfD8',
    Token1: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    Token2: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    Market1: '0xfdaa5becfd7a397fa189909419a9caec8096890e',
    Market2: '0xaDb74ae0A618c0b7474B9f2e7B7CcecCF72f9676',
    Buyout: '0x0000000000000000000000000000000000000000',
  },
  4: {
    Vault: '0x6C66dCC216B2324520bAcB9E3696A9F54238999a',
    Token0: '0x61b92a7F45711e38BAA3b97c1897de970904D6e2',
    Token1: '0x629181550f19bCBfc2d2092a1B545eB48eFd8659',
    Token2: '0x629181550f19bCBfc2d2092a1B545eB48eFd8659',
    Market1: '0x594719f18d78dAA83e49C30660512d6592EE2B61',
    Market2: '0x594719f18d78dAA83e49C30660512d6592EE2B61',
    Buyout: '0x764dB2b1CAd4E21E0Bb3ecEf3986D1B0Cfb7B1F7',
    // Buyout: '0x46beA64127391947da26edc8d537d74DB8225a54', // Revoked
  },
}

let web3Modal

const Wrapper = styled.div`
  background: var(--color-white);
  padding: 24px 35px 20px;
  width: 1216px;
  max-width: 100%;
  border: 1px solid #979797;
  position: relative;
  min-height: 630px;
`

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
    if (this.props.library) this.props.library.onDisconnect()
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
    if (this.props.isStatic) return
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
    if (this.props.isStatic) return null
    if (this.props.metamask && !this.props.metamask.connected)
      return (
        <Wrapper className="flex-all">
          <Button onClick={this.connectWallet.bind(this)}>Connect Wallet</Button>
        </Wrapper>
      )
    return null
  }
}

export default connect((state) => state)(Account)
