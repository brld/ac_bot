const _ = require('underscore')

const log = require('./log')
const getLeaderboardEmbeds = require('./getLeaderboardEmbeds')
const getSuggestions = require('./getSuggestions')

const updateLeaderboard = async (lastLeaderboard, suggestionChannel, leaderboardChannel) => {
  log({ message: 'Checking for changes', onlyVerbose: true })

  const suggestionsMessages = await suggestionChannel.fetchMessages()
  const suggestions = await getSuggestions(suggestionsMessages)

  log({ message: suggestions, onlyVerbose: true })
  
  const leaderboard = suggestions.slice(0, 3)

  if(_.isEqual(lastLeaderboard, leaderboard)) {
    return log({ message: 'Leaderboard is equal', onlyVerbose: true })
  } else {
    log({ message: 'Found change in leaderboard', onlyVerbose: true })
  }
  
  await leaderboardChannel.bulkDelete(5)

  const leaderboardEmbeds = await getLeaderboardEmbeds(leaderboard)

  leaderboardEmbeds.forEach(embed => {
    leaderboardChannel.send({ 
      embed
    })
  })

  log({ message: '-----------' })
  leaderboard.forEach(track => {
    log({ message: `${track.title} - ${track.votes}` })
  })

  return leaderboard
}

module.exports = updateLeaderboard