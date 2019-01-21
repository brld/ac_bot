const Discord = require('discord.js')

const config = require('../config')
const updateLeaderboard = require('./updateLeaderboard')
const containsPublicLink = require('./containsPublicLink')
const log = require('./log')
const getUrls = require('./getUrls')

require('dotenv').config()

const client = new Discord.Client()

client.on('ready', async () => {
  try {
    log({ message: `Logged in as ${ client.user.username }!`, logLevel: 1 })
    log({ message: `Logging is set to ${ process.env.LOG_LEVEL }`, logLevel: 1 })
    log({ message: `Debug is set to ${ process.env.DEBUG }`, logLevel: 1 })
    log({ message: '-----------', logLevel: 1 })

    client.user.setActivity(`with Hum4n01d`)

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
    const isInOthersMusic = msg.channel.id === '525062108405301268'
    const isStaff = msg.member.roles.has('466011844977360896')
    const isExempt = isInRepostSuggestions || isInRadio || isInOthersMusic || isStaff

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

    if (isInRepostSuggestions) {
      const urls = getUrls(msg.content)

      // Delete message if it contains zero or more than one link
      if (!urls) {
        msg.author.send('Please only post SoundCloud links in #repost-suggestions :wink:')
        msg.delete()
        
        return
      }
      if (urls.length > 1) {
        msg.author.send('Please only post one SoundCloud link per message in #repost-suggestions :wink:')
        msg.delete()

        return
      }
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
