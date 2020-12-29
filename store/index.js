import { createStore } from 'redux'

const reducer = (state, action) => {
  switch (action.type) {
    case 'METAMASK':
      return { ...state, metamask: { ...state.metamask, ...action.payload, connected: true } }
    case 'INIT_CONTRACTS':
      return { ...state, library: action.payload[0], auctions: action.payload[1] }
    case 'STAKED':
    case 'UNSTAKED':
    case 'REWARDCLAIMED':
      return { ...state, transactions: { ...state.transactions, ...action.payload } }
    case 'DISCONNECT':
      return { ...state, metamask: { connected: false } }
    default:
      return state
  }
}

const defaults = {
  metamask: {},
  transactions: {},
}

function Store(initialState = defaults) {
  return createStore(reducer, initialState)
}

export default Store
