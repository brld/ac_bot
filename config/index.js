const { join } = require('path')
const { readFileSync } = require('fs')

module.exports = {
  suggestionChannelID: '478687396896964609',
  leaderboardChannelID: process.env.DEBUG ? '483814924762742804' : '467777046374907914',
  infoText: readFileSync(join(__dirname, 'infoText.txt'), 'utf-8'),
  updateFrequency: process.env.DEBUG ? 5000 : 1000 * 60 * 60
}