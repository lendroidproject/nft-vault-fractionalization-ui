export const shorten = (str, len = 12) => {
  return `${str.substr(0, len - 3)}...${str.substr(-3)}`
}