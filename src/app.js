const Discord = require('discord.js')

const config = require('../config')
const updateLeaderboard = require('./updateLeaderboard')
const containsPublicLink = require('./containsPublicLink')
const log = require('./log')

require('dotenv').config()

const client = new Discord.Client()

client.on('ready', async () => {
  try {
    log({ message: `Logged in as ${client.user.username}!`, logLevel: 1 })
    log({ message: `Logging is set to ${process.env.LOG_LEVEL}`, logLevel: 1 })
    log({ message: '-----------', logLevel: 1 })

    client.user.setActivity(`with the leaderboard`)

    // Start leaderboard update loop
    const suggestionChannel = client.channels.get(config.suggestionChannelID)
    const leaderboardChannel = client.channels.get(config.leaderboardChannelID)

    let lastLeaderboard = await updateLeaderboard([], suggestionChannel, leaderboardChannel)

    setInterval(async () => {
      lastLeaderboard = await updateLeaderboard(lastLeaderboard, suggestionChannel, leaderboardChannel)
    }, config.updateFrequency)
  } catch (err) {
    console.error(err)
  }
})

client.on('message', msg => {
  try {
    if (msg.author.bot) return

    const hasPublicLink = containsPublicLink(msg.content)
    const isInRepostSuggestions = msg.channel.id === config.suggestionChannelID
    const isInRadio = msg.channel.id === '462313308725182484'
    const isExempt = isInRepostSuggestions || isInRadio // TODO: Add staff channel category and staff role to exemption list

    if (hasPublicLink && !isExempt) {
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
      })

      msg.author.send('Please refrain from self-promotion in the Auxy Collective :wink:(rule :five:)')
    }
  } catch(err) {
    console.error(err)
  }
})

client.login(process.env.AC_BOT_TOKEN)

process.on('SIGINT', () => {
  console.log('Exiting...')
  client.destroy()
  process.exit()
})
