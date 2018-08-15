const { abbreviations } = require('../config')

const getLeaderboardEmbeds = async leaderboard => {
  try {
    return leaderboard.map((track, index) => ({
      color: abbreviations[index].color,
      title: `:${abbreviations[index].name}_place: ${abbreviations[index].abbreviation} Place`,
      description: `[${track.title}](${track.url})`,
      fields: [{
        name: "Votes",
        value: track.votes
        }],
      timestamp: new Date()
    }))
  } catch (err) {
    console.error(err)
  }
}

module.exports = getLeaderboardEmbeds