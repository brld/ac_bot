const { join } = require('path')
const { readFileSync } = require('fs')

module.exports = {
  suggestionChannelID: '463395823959408640',
  leaderboardChannelID: process.env.DEBUG ? '467777176570429470' : '467777046374907914',
  infoText: readFileSync(join(__dirname, 'infoText.txt'), 'utf-8'),
  abbreviations: [
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
}