const getUrls = require('./getUrls')
const getSoundCloudTitle = require('./getSoundCloudTitle')

const getSuggestions = async suggestionsMessages => {
  try {
    let suggestions = suggestionsMessages.map(msg => {
      const urls = getUrls(msg.content)

      // Ignore message if it contains zero or more than one link
      if (!urls.length) return
      if (urls.length > 1) return

      const voteReactions = msg.reactions.find(reaction => reaction.emoji.name == '👍')

      return {
        url: urls[0],
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
    console.error(err)
  }
}

module.exports = getSuggestions
