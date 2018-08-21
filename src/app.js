const Discord = require('discord.js')
const _ = require('underscore')

const config = require('../config')
const getLeaderboardEmbeds = require('./getLeaderboardEmbeds')
const getSuggestions = require('./getSuggestions')
const containsPublicLink = require('./containsPublicLink')

const client = new Discord.Client()

function log(options) {
  if (process.env.DEBUG) {
    if (options.onlyVerbose) {
      if (process.env.VERBOSE) {
        console.log(options.message)
      }
    } else {
      console.log(options.message)
    }
  }
}

client.on('ready', () => {
  try {
    console.log(`Logged in as ${client.user.username}!`)
    console.log(`Logging is ${process.env.DEBUG ? 'enabled' : 'disabled'}`)

    client.user.setActivity(`with Hum4n01d`)

    const suggestionChannel = client.channels.get(config.suggestionChannelID)
    const leaderboardChannel = client.channels.get(config.leaderboardChannelID)

    let lastLeaderboard

    setInterval(async () => {
      log({ message: 'Checking for changes' })

      const suggestionsMessages = await suggestionChannel.fetchMessages()
      const suggestions = await getSuggestions(suggestionsMessages)

      log({ message: suggestions, onlyVerbose: true })
      
      const leaderboard = suggestions.slice(0, 3)

      if(_.isEqual(lastLeaderboard, leaderboard)) {
        return log({ message: 'Leaderboard is equal' })
      } else {
        log({ message: 'Found change in leaderboard' })
      }

      lastLeaderboard = leaderboard
      
      await leaderboardChannel.bulkDelete(5)

      const leaderboardEmbeds = await getLeaderboardEmbeds(leaderboard)

      leaderboardEmbeds.forEach(embed => {
        leaderboardChannel.send({ 
          embed
        })
      })

      log({ message: '-----------' })
      leaderboard.forEach(track => {
        log({ message: `${track.title} - ${track.votes}` })
      })
    }, config.updateFrequency)
  } catch (err) {
    console.err(err)
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
  } catch(err) {
    console.error(err)
  }
})

client.login(process.env.AC_BOT_TOKEN)

process.on('SIGINT', () => {
  console.log('exiting')
  client.destroy()
  process.exit()
})
