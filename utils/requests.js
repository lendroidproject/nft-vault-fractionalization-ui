import Axios from 'axios'

const axiosResolve = (request) =>
  new Promise((resolve, reject) => request.then(({ data }) => resolve(data)).catch(reject))

export const getPrivacy = (address) =>
  axiosResolve(Axios.get(`https://whalestreet-api.appspot.com/api/v1/signature/${address}`))

export const agreePrivacy = (address, data) =>
  axiosResolve(Axios.post(`https://whalestreet-api.appspot.com/api/v1/signature/${address}`, data))
