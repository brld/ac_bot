const { existsSync, unlinkSync } = require('fs')
const { join } = require('path')
const Discord = require("discord.js")

const { suggestionChannelID, leaderboardChannelID } = require('../config')
const updateLeaderboard = require('./updateLeaderboard')

const client = new Discord.Client()

client.on('ready', () => {
  console.log(`Logged in as ${client.user.username}!`)
  client.user.setActivity(`Auxy Collective`)

  if (existsSync(join(__dirname, 'leaderboard.json'))) unlinkSync(join(__dirname, 'leaderboard.json'))
  
  try {
    const suggestionChannel = client.channels.get(suggestionChannelID)
    const leaderboardChannel = client.channels.get(leaderboardChannelID)

    updateLeaderboard(suggestionChannel, leaderboardChannel)

    setInterval(() => {
      console.log('Checking for changes')
      updateLeaderboard(suggestionChannel, leaderboardChannel)
    }, process.env.DEBUG ? 10000 : 1000 * 60 * 60)
  } catch (err) {
    console.error(err)
  }
})

client.login(process.env.AC_BOT_TOKEN)

function onExit() {
  console.log("exiting");
  client.destroy()
  process.exit()
}
process.on('SIGINT', onExit)