import tinyurl from 'tinyurl'

export function tinyURL(url) {
  return new Promise((resolve, reject) => {
    if (url.includes('tinyurl.com')) resolve(url)
    else {
      tinyurl.shorten(url, function (res, err) {
        if (err) reject(err)
        resolve(res) //Returns a shorter version of http://google.com - http://tinyurl.com/2tx
      })
    }
  })
}
