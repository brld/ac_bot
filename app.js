const Discord = require("discord.js")
const client = new Discord.Client()
const { getSuggestions, postLeaderboard, findUrl } = require('./util')

const suggestionChannelID = '455490656358629398'
const leaderboardChannelID = '457939941654003723'

const updateLeaderboard = async (suggestionChannel, leaderboardChannel) => {
  const suggestions = await getSuggestions(suggestionChannel)
  
  postLeaderboard(suggestions, leaderboardChannel)
}

client.on('ready', async () => {
  console.log(`Logged in as ${client.user.username}!`)
  client.user.setActivity(`Auxy Collective`)

  const suggestionChannel = client.channels.get(suggestionChannelID)
  const leaderboardChannel = client.channels.get(leaderboardChannelID)

  updateLeaderboard(suggestionChannel, leaderboardChannel)

  setInterval(() => {
    updateLeaderboard(suggestionChannel, leaderboardChannel)
  }, 1000 * 60 * 60)
})

client.on('message', msg => {
  if (msg.author.bot) return

  if (msg.channel.id === suggestionChannelID) {
    const hasUrl = findUrl(msg.content)

    if (!hasUrl) {
      msg.delete()
        .catch(console.error)

      msg.author.send('Please post comments in #chat or #music. Thanks!')
    }
  }
})

client.login(process.env.AC_BOT_TOKEN)

function onExit() {
  console.log("exiting");
  client.destroy()
  process.exit()
}
process.on('SIGINT', onExit)