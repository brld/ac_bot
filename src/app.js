const Discord = require('discord.js')
const Raven = require('raven')

const config = require('../config')
const updateLeaderboard = require('./updateLeaderboard')
const containsPublicLink = require('./containsPublicLink')

const client = new Discord.Client()

Raven.config('https://149a426762d9476087521d1a63bb22e1@sentry.io/1267210').install()

client.on('ready', async () => {
  try {
    console.log(`Logged in as ${client.user.username}!`)
    console.log(`Logging is ${process.env.DEBUG ? 'enabled' : 'disabled'}`)

    client.user.setActivity(`with Hum4n01d`)
    
    let lastLeaderboard

    const suggestionChannel = client.channels.get(config.suggestionChannelID)
    const leaderboardChannel = client.channels.get(config.leaderboardChannelID)

    lastLeaderboard = await updateLeaderboard(lastLeaderboard, suggestionChannel, leaderboardChannel)

    setInterval(async () => {
      lastLeaderboard = await updateLeaderboard(lastLeaderboard, suggestionChannel, leaderboardChannel)
    }, config.updateFrequency)
  } catch (err) {
    Raven.captureException(err)
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
      })

      msg.author.send('Self promotion is not allowed in Auxy Collective, please refer to rule :five:')
    }
  } catch(err) {
    Raven.captureException(err)
    console.error(err)
  }
})

client.login(process.env.AC_BOT_TOKEN)

process.on('SIGINT', () => {
  console.log('exiting')
  client.destroy()
  process.exit()
})
