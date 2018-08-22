const findUrl = require('./findUrl')
const getSoundCloudTitle = require('./getSoundCloudTitle')

const getSuggestions = async suggestionsMessages => {
  try {
    let suggestions = suggestionsMessages.map(msg => {
      const url = findUrl(msg.content)

      if (!url) return

      const voteReactions = msg.reactions.find(reaction => reaction.emoji.name == '👍')

      return {
        url,
        votes: voteReactions ? voteReactions.count : 0,
        message: msg.content,
        suggester: `${msg.author.username}#${msg.author.discriminator}`
      }
    })

    await Promise.all(suggestions)

    suggestions.sort((a, b) => b.votes - a.votes)

    suggestions = suggestions.map(async track => {
      const title = await getSoundCloudTitle(track.url)

      return {
        title,
        ...track
      }
    })

    return Promise.all(suggestions)
  } catch (err) {
    Raven.captureException(err)
    console.error(err)
  }
}

module.exports = getSuggestions