const _ = require('underscore')

const log = require('./log')
const getLeaderboardEmbeds = require('./getLeaderboardEmbeds')
const getSuggestions = require('./getSuggestions')

const updateLeaderboard = async (lastLeaderboard, suggestionChannel, leaderboardChannel) => {
  try {
    log({ message: 'Checking for changes', logLevel: 2 })

    const suggestionsMessages = await suggestionChannel.fetchMessages()
    const suggestions = await getSuggestions(suggestionsMessages)

    log({ message: suggestions, logLevel: 3 })

    const leaderboard = suggestions.slice(0, 3)

    if(_.isEqual(lastLeaderboard, leaderboard)) return

    log({ message: 'Found change in leaderboard', logLevel: 1 })

    await leaderboardChannel.bulkDelete(5)

    const leaderboardEmbeds = await getLeaderboardEmbeds(leaderboard)

    leaderboardEmbeds.forEach(embed => {
      leaderboardChannel.send({
        embed
      })
    })

    log({ message: '-----------', logLevel: 1 })
    leaderboard.forEach(track => {
      log({ message: `${track.title} - ${track.votes}`, logLevel: 1 })
    })
    log({ message: '-----------', logLevel: 1 })

    return leaderboard
  } catch(err) {
    return console.error(err)
  }
}

module.exports = updateLeaderboard
