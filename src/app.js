const { existsSync, unlinkSync } = require('fs')
const { join } = require('path')
const Discord = require("discord.js")

const { suggestionChannelID, leaderboardChannelID } = require('../config')
const updateLeaderboard = require('./updateLeaderboard')
const containsPublicLink = require('./containsPublicLink')

const client = new Discord.Client()

client.on('ready', () => {
  console.log(`Logged in as ${client.user.username}!`)
  client.user.setActivity(`Auxy Collective`)

  if (existsSync(join(__dirname, 'leaderboard.json'))) unlinkSync(join(__dirname, 'leaderboard.json'))

  try {
    const suggestionChannel = client.channels.get(suggestionChannelID)
    const leaderboardChannel = client.channels.get(leaderboardChannelID)

    updateLeaderboard(client, suggestionChannel, leaderboardChannel)

    setInterval(() => {
      console.log('Checking for changes')
      updateLeaderboard(suggestionChannel, leaderboardChannel)
    }, process.env.DEBUG ? 30 * 1000 * 60 : 1000 * 60 * 60)
  } catch (err) {
    console.error(err)
  }
})

client.on('message', msg => {
  try {
    if (msg.author.bot) return

    const hasPublicLink = containsPublicLink(msg)
    const isInRepostSuggestions = msg.channel.id === config.suggestionChannelID
    const isInRadio = msg.channel.id === '462313308725182484'

    if (hasPublicLink && !isInRepostSuggestions && !isInRadio) {
      msg.delete()

      client.channels.find('id', '470759790197473280').send({
        embed: {
          author: {
            iconURL: msg.author.displayAvatarURL,
            name: msg.author.tag
          },
          title: `Deleted for self promotion in #${msg.channel.name}`,
          fields: [{
            name: 'Content:',
            value: msg.content
          }],
          timestamp: new Date(),
          color: 16724539
        }
      }).catch(e => console.error(e))
      msg.author.send('Self promotion is not allowed in Auxy Collective, please refer to rule :five:')
    }
  } catch(e) {
    console.error(e);
  }
})

client.login(process.env.AC_BOT_TOKEN)

function onExit() {
  console.log("exiting");
  client.destroy()
  process.exit()
}
process.on('SIGINT', onExit)
