const util = require('util')
const findUrl = require('./findUrl')
const getSoundCloudTitle = require('./getSoundCloudTitle')

module.exports = async (client, suggestionChannel) => {
  try {
    const messages = await suggestionChannel.fetchMessages()

    let suggestions = messages.map(msg => {
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

    client.users.find('id', '186303569429790722').send('```' + util.inspect(suggestions) + '```')

    let leaderboard = suggestions.slice(0, 3)

    leaderboard = leaderboard.map(async track => {
      const title = await getSoundCloudTitle(track.url)

      return {
        title,
        ...track
      }
    })

    return Promise.all(leaderboard)
  } catch (err) {
    console.error(err)
  }
}