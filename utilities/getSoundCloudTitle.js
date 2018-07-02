const fetch = require('node-fetch')

module.exports = async url => {
  const resp = await fetch('https://soundcloud.com/oembed', {
    method: "POST",
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      url
    })
  })

  try {
    const data = await resp.json()
    
    return data.title
  } catch(err) {
    return null
  }
}