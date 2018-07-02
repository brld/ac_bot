const getSuggestions = require('./getSuggestions')

const generateLeaderboard = suggestions => {
  const abbreviations = [
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
  const embeds = []

  suggestions
    .slice(0, 3)
    .forEach(((suggestion, index) => {
      const abbreviation = abbreviations[index]

      const embed = {
        color: abbreviation.color,
        title: `:${abbreviation.name}_place: ${abbreviation.abbreviation} Place`,
        description: `[${suggestion.title}](${suggestion.url})`,
        fields: [{
          name: "Votes",
          value: suggestion.votes
        }],
        timestamp: new Date()
      }

      embeds.push(embed)
    }))

  return embeds
}

module.exports = async (suggestionChannel, leaderboardChannel) => {
  let suggestions = await getSuggestions(suggestionChannel)
  let leaderboard = generateLeaderboard(suggestions, leaderboardChannel)
  
  leaderboardChannel.bulkDelete(30)

  leaderboard.forEach(embed => {
    leaderboardChannel.send({
      embed
    })
  })
}