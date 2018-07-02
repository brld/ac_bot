const Discord = require("discord.js")
const client = new Discord.Client()

const { suggestionChannelID, leaderboardChannelID } = require('./config')
const updateLeaderboard = require('./utilities/updateLeaderboard')

client.on('ready', () => {
  console.log(`Logged in as ${client.user.username}!`)
  client.user.setActivity(`Auxy Collective`)
  
  try {
    const suggestionChannel = client.channels.get(suggestionChannelID)
    const leaderboardChannel = client.channels.get(leaderboardChannelID)

    updateLeaderboard(suggestionChannel, leaderboardChannel)

    setInterval(() => {
      updateLeaderboard(suggestionChannel, leaderboardChannel)
    }, process.env.DEBUG ? 1000 * 5 : 1000 * 60 * 60)
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