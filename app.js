const Discord = require('discord.js')
const dotenv = require('dotenv')
const getUrls = require('get-urls')

const {
  getSoundCloudTitle,
  isLeaderboardDifferent,
  getLeaderboardEmbeds,
  validateSuggestion,
  getLeaderboard,
} = require('./utils')
const config = require('./config')

const client = new Discord.Client()

dotenv.config()

const getSuggestions = async () => {
  const suggestionsChannel = await client.channels.fetch(
    config.channels.repostSuggestions
  )
  const suggestionMessages = await suggestionsChannel.messages.fetch()

  let suggestions = suggestionMessages.map((msg) => {
    const voteReactions = msg.reactions.cache.find(
      (reaction) => reaction.emoji.name == '👍'
    )

    const urls = getUrls(msg.content)

    return {
      url: Array.from(urls)[0], // Set items do not have indices
      votes: voteReactions ? voteReactions.count : 0,
      message: msg.content,
      suggester: `${msg.author.username}#${msg.author.discriminator}`,
      suggestedDate: msg.createdAt,
    }
  })

  return suggestions
}

const refreshLeaderboard = async () => {
  // Purge invalid suggestions
  const suggestionsChannel = await client.channels.fetch(
    config.channels.repostSuggestions
  )
  const suggestionMessages = await suggestionsChannel.messages.fetch()

  suggestionMessages.forEach((msg) => {
    const urls = getUrls(msg.content) // Returns a set
    const validationResult = validateSuggestion(urls)

    if (!validationResult.isValid) {
      msg.delete()
    }
  })

  const leaderboardChannel = await client.channels.fetch(
    config.channels.leaderboard
  )
  const suggestions = await getSuggestions()

  let leaderboard = getLeaderboard(suggestions)

  if (!isLeaderboardDifferent(leaderboard)) {
    return
  }

  // Add SoundCloud titles to track objects
  // Separate loop for separate error handling
  leaderboard = await Promise.all(
    leaderboard.map(async (track) => {
      try {
        const title = await getSoundCloudTitle(track.url)

        return {
          ...track,
          title,
        }
      } catch (err) {
        console.error(`Failed to get title of track from SoundCloud: ${err}`)
      }
    })
  )

  try {
    await leaderboardChannel.bulkDelete(100)
  } catch (err) {
    console.error(`Failed to bulk delete leaderboard: ${err}`)
  }

  try {
    const leaderboardEmbeds = await getLeaderboardEmbeds(leaderboard)

    leaderboardEmbeds.map((embed) => {
      leaderboardChannel.send({ embed })
    })
  } catch (err) {
    console.error(`Error sending leaderboard embeds: ${err}`)
  }

  console.log(JSON.stringify(leaderboard, null, 2))
}

client.on('ready', async () => {
  console.log(`Logged in as ${client.user.username}!`)

  setInterval(refreshLeaderboard, config.interval)
})

client.on('message', (msg) => {
  if (msg.channel.id === config.channels.repostSuggestions) {
    const urls = getUrls(msg.content) // Returns a set

    const validationResult = validateSuggestion(urls)

    if (!validationResult.isValid) {
      msg.author.send(
        `**${validationResult.message}**\n\n**Your post:** ${msg.content}`
      )
      msg.delete()
    }
  }
})

client.login(process.env.BOT_TOKEN)
