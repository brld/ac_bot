const fetch = require('node-fetch')

module.exports = async url => {
  try {
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

    const data = await resp.json()

    return data.title
  } catch(err) {
    console.log(url)
    return console.error(err)
  }
}
