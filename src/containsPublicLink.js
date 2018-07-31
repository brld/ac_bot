const findUrl = require('./findUrl')

module.exports = msg => {
  const url = findUrl(msg.content)

  if (url && !url.split('/')[5] && url.includes("soundcloud.com")) {
    return true

    console.log(`"${msg.content}" by ${msg.author.username} was deleted in AC for containg a public link`);
  }
  return false
}
