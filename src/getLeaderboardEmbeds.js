const getLeaderboardEmbeds = async leaderboard => {
  try {
    const embedInfo = [
      {
        name: 'first',
        abbreviation: '1st',
        color: 16758074
      },
      {
        name: 'second',
        abbreviation: '2nd',
        color: 13818849,
      },
      {
        name: 'third',
        abbreviation: '3rd',
        color: 16749891
      }
    ]

    return leaderboard.map((track, index) => ({
      color: embedInfo[index].color,
      title: `:${embedInfo[index].name}_place: ${embedInfo[index].abbreviation} Place`,
      description: `[${track.title}](${track.url})`,
      fields: [{
        name: "Votes",
        value: track.votes
        }],
      timestamp: new Date()
    }))
  } catch (err) {
    Raven.captureException(err)
    console.error(err)
  }
}

module.exports = getLeaderboardEmbeds