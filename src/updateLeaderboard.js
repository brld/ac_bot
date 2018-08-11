const { existsSync, writeFileSync } = require('fs')
const { join } = require('path')
const _ = require('underscore')

const getLeaderboard = require('./getLeaderboard')
const { abbreviations } = require('../config')

const leaderboardToEmbeds = leaderboard => {
  return leaderboard.map(((track, index) => {
    const abbreviation = abbreviations[index]

    return {
      color: abbreviation.color,
      title: `:${abbreviation.name}_place: ${abbreviation.abbreviation} Place`,
      description: `[${track.title}](${track.url})`,
      fields: [{
        name: "Votes",
        value: track.votes
      }],
      timestamp: new Date()
    }
  }))
}

module.exports = async (client, suggestionChannel, leaderboardChannel) => {
  try {
    const leaderboard = await getLeaderboard(suggestionChannel)

    if (existsSync(join(__dirname, 'leaderboard.json'))) {
      const lastLeaderboard = require('./leaderboard.json')

      if (_.isEqual(leaderboard, lastLeaderboard)) {
        console.log('Leaderboard is identical')

        return
      }
    }

    writeFileSync(join(__dirname, 'leaderboard.json'), JSON.stringify(leaderboard))

    leaderboardChannel.bulkDelete(5)
      .then(messages => console.log(`Bulk deleted ${messages.size} messages`))
      .catch(console.error);

    const embeds = leaderboardToEmbeds(leaderboard, leaderboardChannel)

    embeds.forEach(embed => {
      leaderboardChannel.send({ embed })
    })

    console.log('Successfully updated leaderboard')
  } catch (err) {
    console.error(err)
  }
}
