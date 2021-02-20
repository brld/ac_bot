const Discord = require('discord.js')
const dotenv = require('dotenv')
const getUrls = require('get-urls')

const {
  getSoundCloudTitle,
  isLeaderboardDifferent,
  getLeaderboardEmbeds,
  validateSuggestion,
  getLeaderboard
} = require('./utils')
const config = require('./config')

const client = new Discord.Client()

dotenv.config()

const getSuggestions = async () => {
  const suggestionsChannel = await client.channels.fetch(
    config.channels.repostSuggestions
  )
  const suggestionMessages = await suggestionsChannel.messages.fetch()

  let suggestions = suggestionMessages.map(msg => {
    const voteReactions = msg.reactions.cache.find(
      reaction => reaction.emoji.name == '👍'
    )

    const urls = getUrls(msg.content)

    return {
      url: Array.from(urls)[0], // Set items do not have indices
      votes: voteReactions ? voteReactions.count : 0,
      message: msg.content,
      suggester: `${msg.author.username}#${msg.author.discriminator}`,
      suggestedDate: msg.createdAt
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

  suggestionMessages.forEach(msg => {
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
    leaderboard.map(async track => {
      try {
        const title = await getSoundCloudTitle(track.url)

        return {
          ...track,
          title
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

    leaderboardEmbeds.map(embed => {
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

var inStream = false
var emojis = [
  ':star:',
  ':tada:',
  ':headphones:',
  ':raised_hands:',
  ':medal:',
  ':fire:',
  ':exclamation:'
]

client.on('message', async msg => {
  if (msg.author.bot) return
  
  if (msg.channel.id === config.channels.repostSuggestions) {
    const urls = getUrls(msg.content) // Returns a set

    const validationResult = validateSuggestion(urls)

    if (!validationResult.isValid) {
      msg.author.send(
        `**${validationResult.message}**\n\n**Your post:** ${msg.content}`
      )
      msg.delete()
    }

    return
  } else if (!msg.content.startsWith('&')) return

  const args = msg.content
    .slice('&'.length)
    .trim()
    .split(' ')
  const command = args.shift().toLowerCase()

  if (command === 'start-stream' && !inStream) {
    if (inStream) {
      msg.channel.send(`Already in stream mode!`)
    } else {
      // const filter = m => m.author.id != client.user.id
      const filter = m => !m.author.bot // && m.member.roles.find(r => r.name === "Host")
      const collectorMain = msg.channel.createMessageCollector(filter)
      const collectorTracks = msg.channel.createMessageCollector(filter)
      const collectorInStream = msg.channel.createMessageCollector(filter)
      var userLinks = []
      var trackLinks = []
      var userTitles = []
      var trackTitles = []
      msg.channel.send(`Confirm stream setup start? (yes / no)`).then(() => {
        collectorMain.on('collect', m => {
          console.log(m)
          if (m.content.toLowerCase() == 'yes') {
            inStream = true
            msg.channel.send(
              `Stream setup started! Enter track links (1 per line):`
            )
            collectorMain.stop('')
            collectorTracks.on('collect', async m => {
              if (
                m.content.includes('soundcloud.com/') &&
                m.content.split('/')[4]
              ) {
                var lineSplit = m.content.split('\n')
                for (var i = 0; i < lineSplit.length; i++) {
                  trackLinks.push(lineSplit[i])
                  var lineArr = lineSplit[i].split('/')
                  const trackTitle = await getSoundCloudTitle(
                    lineArr.join('/').replace('<', '')
                  )
                  lineArr.pop()
                  if (lineArr[4]) {
                    lineArr.pop()
                  }
                  userLinks.push(lineArr.join('/').replace('<', ''))
                  const userTitle = await getSoundCloudTitle(
                    lineArr.join('/').replace('<', '')
                  )
                  userTitles.push(userTitle)
                  trackTitles.push(trackTitle)
                }
                collectorTracks.stop('')
                msg.channel.send(`Stream setup concluded. Stream starting now!`)
                var artistIndex = 0

                console.log(userLinks)
                console.log(trackLinks)
                console.log(userTitles)
                console.log(trackTitles)
                collectorInStream.on('collect', async m => {
                  // if (m.channel.id === config.channels.chat || m.channelid === config.channels.hosts) {
                  var emoji = emojis[Math.floor(Math.random() * emojis.length)]

                  if (m.content == '&current') {
                    msg.channel.send(
                      `Current artist, **${
                        userTitles[artistIndex]
                      }**! (${artistIndex + 1} / ${
                        userLinks.length
                      }): **${emoji}** ${
                        userLinks[artistIndex]
                      } **${emoji}** \n\nCurrently playing track **${trackTitles[
                        artistIndex
                      ]
                        .split(' ')
                        .slice(
                          0,
                          userTitles[artistIndex].split(' ').length - 1 > 0
                            ? -1 *
                                (userTitles[artistIndex].split(' ').length -
                                  1) -
                                2
                            : -2
                        )
                        .join(' ')}**`
                    )
                  } else if (m.content == '&next') {
                    if (artistIndex != userLinks.length - 1) {
                      artistIndex += 1
                    } else {
                      artistIndex = 0
                    }
                    msg.channel.send(
                      `Next artist, **${
                        userTitles[artistIndex]
                      }**! (${artistIndex + 1} / ${
                        userLinks.length
                      }): **${emoji}** ${
                        userLinks[artistIndex]
                      } **${emoji}** \n\nCurrently playing track **${trackTitles[
                        artistIndex
                      ]
                        .split(' ')
                        .slice(
                          0,
                          userTitles[artistIndex].split(' ').length - 1 > 0
                            ? -1 *
                                (userTitles[artistIndex].split(' ').length -
                                  1) -
                                2
                            : -2
                        )
                        .join(' ')}**`
                    )
                  } else if (m.content == '&previous') {
                    if (artistIndex != 0) {
                      artistIndex -= 1
                    } else {
                      artistIndex = userLinks.length - 1
                    }
                    msg.channel.send(
                      `Previous artist!, **${
                        userTitles[artistIndex]
                      }**! (${artistIndex + 1} / ${
                        userLinks.length
                      }): **${emoji}** ${
                        userLinks[artistIndex]
                      } **${emoji}** \n\nCurrently playing track **${trackTitles[
                        artistIndex
                      ]
                        .split(' ')
                        .slice(
                          0,
                          userTitles[artistIndex].split(' ').length - 1 > 0
                            ? -1 *
                                (userTitles[artistIndex].split(' ').length -
                                  1) -
                                2
                            : -2
                        )
                        .join(' ')}**`
                    )
                  } else if (m.content.includes('-p')) {
                      const lineArgs = m.content
                        .slice('-p'.length)
                        .trim()
                        .split(' ')
                        .shift()
                        .split('/')
                      const trackArgs = lineArgs.join('/')
                      const trackTitleArgs = await getSoundCloudTitle(
                        lineArgs.join('/')
                      )
                      lineArgs.pop()
                      if (lineArgs[4]) {
                        lineArgs.pop()
                      }
                      const userArgs = lineArgs.join('/')
                      const userTitleArgs = await getSoundCloudTitle(
                        lineArgs.join('/')
                      )
                      console.log(trackArgs)
                      client.channels.cache.get(config.channels.chat).send(trackLinks.includes(trackArgs) 
                        ?  `Current artist, **${
                          userTitles[trackLinks.indexOf(trackArgs)]
                        }**! (${trackLinks.indexOf(trackArgs) + 1} / ${
                          userLinks.length
                        }): **${emoji}** ${
                          userLinks[trackLinks.indexOf(trackArgs)]
                        } **${emoji}** \n\nCurrently playing track **${trackTitles[
                          trackLinks.indexOf(trackArgs)
                        ]
                          .split(' ')
                          .slice(
                            0,
                            userTitles[trackLinks.indexOf(trackArgs)].split(' ').length - 1 > 0
                              ? -1 *
                                  (userTitles[trackLinks.indexOf(trackArgs)].split(' ').length -
                                    1) -
                                  2
                              : -2
                          )
                          .join(' ')}**`
                        : `New addition! Current artist, **${
                          userTitleArgs
                        }**! **${emoji}** ${
                          userArgs
                        } **${emoji}** \n\nCurrently playing track **${trackTitleArgs
                          .split(' ')
                          .slice(
                            0,
                            userTitleArgs.split(' ').length - 1 > 0
                              ? -1 *
                                  (userTitleArgs.split(' ').length -
                                    1) -
                                  2
                              : -2
                          )
                          .join(' ')}**`)
                  } else if (m.content == '&stop-stream') {
                    msg.channel.send(`Stream ended. See you next time!`)
                    collectorInStream.stop('Stream ended.')
                  }
                  // }
                })
              }
            })
          } else if (m.content.toLowerCase() == 'no') {
            msg.channel.send(`Cancelling stream setup. Beep boop.`)
            collectorMain.stop('Setup cancel.')
          }
        })
      })
    }
  }
})

client.login(process.env.BOT_TOKEN)

// else if (!msg.content.startsWith("&")) return

//   const args = msg.content.slice("&".length).trim().split(' ');
//   const command = args.shift().toLowerCase();

//   const filter = m => m.content.includes('https://soundcloud.com/') && m.author.id == message.author.id;

//   if (command === 'start-stream') {
//     const trackLinks = [];
//     msg.channel.send(`Input links (1 per line):`).then(() => {
//       msg.channel.awaitMessages(filter)
//       .then(collected => {
//         collected.map((track) => {
//           trackLinks.push(track);
//         });
//         msg.channel.send(`Final track list: ${trackLinks}`);
//       }).catch(collected => {
//         msg.channel.send(`Timed out`);
//       });
//     });
//   }

// })
