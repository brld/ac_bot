const Discord = require('discord.js')
const _ = require('underscore')

const config = require('../config')
const getLeaderboardEmbeds = require('./getLeaderboardEmbeds')
const getSuggestions = require('./getSuggestions')
const containsPublicLink = require('./containsPublicLink')

const client = new Discord.Client()

client.on('ready', () => {
  try {
    console.log(`Logged in as ${client.user.username}!`)
    client.user.setActivity(`with Hum4n01d`)

    const suggestionChannel = client.channels.get(config.suggestionChannelID)
    const leaderboardChannel = client.channels.get(config.leaderboardChannelID)

    let lastLeaderboard

    setInterval(async () => {
      const suggestionsMessages = await suggestionChannel.fetchMessages()
      const suggestions = await getSuggestions(suggestionsMessages)
      
      const leaderboard = suggestions.slice(0, 3)

      if (_.isEqual(lastLeaderboard, leaderboard)) return

      lastLeaderboard = leaderboard
      
      await leaderboardChannel.bulkDelete(5)

      const leaderboardEmbeds = await getLeaderboardEmbeds(leaderboard)

      leaderboardEmbeds.forEach(embed => {
        leaderboardChannel.send({ 
          embed
        })
      })

      console.log('-----------')
      leaderboard.forEach(track => {
        console.log(`${track.title} - ${track.votes}`)
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
