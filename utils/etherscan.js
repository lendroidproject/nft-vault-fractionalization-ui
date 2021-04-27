export const networks = process.env.NETWORKS.split(',').map(Number)
const definedInfuras = process.env.INFURA_ID.split(',')
const definedFortmatics = process.env.FORTMATIC.split(',')
export const infuras = {}
export const fortmatics = {}
networks.forEach((network, idx) => {
  infuras[network] = definedInfuras[idx]
  fortmatics[network] = definedFortmatics[idx]
})

export const MAINNET = false
export const isSupportedNetwork = (network) => network && networks.includes(network)
const networkLabels = {
  1: 'Mainnet',
  3: 'Ropsten',
  4: 'Rinkeby',
  5: 'Goerli',
  42: 'Kovan network',
}
export const connectNetworks = () => {
  if (networks.length === 1) {
    return `Please connect to the "${networkLabels[networks[0]]}"`
  } else {
    return `Please connect to either "${networks.map((id) => networkLabels[id]).join('" or "')}"`
  }
}
const links = {
  1: 'https://etherscan.io',
  4: 'https://rinkeby.etherscan.io',
  42: 'https://kovan.etherscan.io',
}

const infuraLinks = {
  1: 'https://mainnet.infura.io/v3',
  3: 'https://ropsten.infura.io/v3',
  4: 'https://rinkeby.infura.io/v3',
  5: 'https://goerli.infura.io/v3',
  42: 'https://kovan.infura.io/v3',
}
export const networkLabel = (network) => networkLabels[network].split(' ')[0]
export const txLink = (hash, network) => `${links[network]}/tx/${hash}`
export const tokenLink = (addr, network) => `${links[network]}/token/${addr}`
export const addressLink = (addr, network) => `${links[network]}/address/${addr}`
export const infuraProvider = (network, infuraId) => `${infuraLinks[network]}/${infuraId}`

const openseaLinks = {
  1: 'https://opensea.io',
  4: 'https://testnets.opensea.io',
}
export const openseaLink = (addr, network) => `${openseaLinks[network]}/accounts/${addr}`
