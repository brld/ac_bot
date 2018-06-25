const Discord = require("discord.js")
const client = new Discord.Client()
const { getSuggestions, generateLeaderboard } = require('./util')

const suggestionChannelID = '455490656358629398'
const leaderboardChannelID = '457939941654003723'

client.on('ready', async () => {
  console.log(`Logged in as ${client.user.username}!`)
  client.user.setActivity(`Auxy Collective`)
  
  try {
    const suggestionChannel = client.channels.get(suggestionChannelID)
    const leaderboardChannel = client.channels.get(leaderboardChannelID)

    let suggestions = await getSuggestions(suggestionChannel)
    let leaderboard = generateLeaderboard(suggestions, leaderboardChannel)

    leaderboardChannel.bulkDelete(6)
    
    const firstPlace = await leaderboardChannel.send({ embed: leaderboard[0] })
    const secondPlace = await leaderboardChannel.send({ embed: leaderboard[1] })
    const thirdPlace = await leaderboardChannel.send({ embed: leaderboard[2] })

    setInterval(async () => {
      suggestions = await getSuggestions(suggestionChannel)

      console.log(suggestions)
      leaderboard = generateLeaderboard(suggestions, leaderboardChannel)

      firstPlace.edit({ embed: leaderboard[0] })
      secondPlace.edit({ embed: leaderboard[1] })
      thirdPlace.edit({ embed: leaderboard[2] })
    }, 1000 * 5)
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