const findUrl = require('./findUrl')
const getSoundCloudTitle = require('./getSoundCloudTitle')

module.exports = async suggestionChannel => {
  let messages

  try {
    messages = await suggestionChannel.fetchMessages()
  } catch (err) {
    console.error(err)
  }

  let suggestions = []

  let promises = messages.map(async msg => {
    try {
      const url = findUrl(msg.content)

      if (!url) return

      const title = await getSoundCloudTitle(url)

      if (!title) return
      
      const thumbsUp = msg.reactions.find(reaction => reaction.emoji.name == '👍')

      suggestions.push({
        url,
        title,
        votes: thumbsUp ? thumbsUp.count : 0,
        message: msg.content,
        suggester: msg.author.username
      })
    } catch(err) {
      console.error(`Error fetching [${msg.content}]: ${err}`)
    }
  })

  try {
    await Promise.all(promises)
  } catch (err) {
    console.error(err)
  }

  suggestions.sort((a, b) => b.votes - a.votes)

  return suggestions
}