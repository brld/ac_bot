const { join } = require('path')
const { readFileSync } = require('fs')

const channelIDs = {
  suggestions: '478687396896964609',
  radio: '462313308725182484',
  othersMusic: '525062108405301268',
  selfPromoLogs: '470759790197473280',
  leaderboard: process.env.DEBUG ? '483814924762742804' : '467777046374907914'
}
const roleIDs = {
  staff: '466011844977360896'
}

module.exports = {
  channelIDs,
  roleIDs,
  updateFrequency: process.env.DEBUG ? 5000 : 1000 * 60 * 60
}