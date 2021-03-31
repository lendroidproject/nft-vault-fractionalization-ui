import BigNumber from 'bignumber.js'

const fmt = {
  prefix: '',
  decimalSeparator: '.',
  groupSeparator: ',',
  groupSize: 3,
  secondaryGroupSize: 0,
  fractionGroupSeparator: '',
  fractionGroupSize: 0,
  suffix: '',
}

BigNumber.config({ FORMAT: fmt })

export function format(value, decimals) {
  return new BigNumber(value).toFormat(decimals, 1)
}

export const currencyFormatter = (labelValue) => {
  // Nine Zeroes for Billions
  return Math.abs(Number(labelValue)) >= 1.0e9
    ? `${format(new BigNumber(`${Math.abs(Number(labelValue)) / 1.0e9}`).dp(2, 1))}B`
    : // Six Zeroes for Millions
    Math.abs(Number(labelValue)) >= 1.0e6
    ? `${format(new BigNumber(`${Math.abs(Number(labelValue)) / 1.0e6}`).dp(2, 1))}M`
    : // Three Zeroes for Thousands
    Math.abs(Number(labelValue)) >= 1.0e3
    ? `${format(new BigNumber(`${Math.abs(Number(labelValue)) / 1.0e3}`).dp(2, 1))}K`
    : `${format(new BigNumber(`${Math.abs(Number(labelValue))}`).dp(2, 1))}`
}
