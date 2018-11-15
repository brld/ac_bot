const getUrls = require('./getUrls')

const containsPublicLink = text => {
  const urls = getUrls(text)

  if (!urls || urls.length < 1) return

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i]

    // Check if url is a SoundCloud link and it doesn't have a private share code
    if (url && url.includes('soundcloud.com')) {
      if (!url.split('/')[5]) return true
    }
  }

  return false
}

module.exports = containsPublicLink