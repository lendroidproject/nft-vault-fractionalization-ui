import { createStore } from 'redux'

const reducer = (state, action) => {
  switch (action.type) {
    case 'METAMASK':
      return {
        ...state,
        metamask: { ...state.metamask, ...action.payload, connected: true },
        eventTimestamp: Date.now(),
      }
    case 'INIT_CONTRACTS':
      return { ...state, library: action.payload[0], auctions: action.payload[1] }
    case 'EVENT_DATA':
      return { ...state, eventTimestamp: action.payload }
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
