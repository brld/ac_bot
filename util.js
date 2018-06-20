const fetch = require('node-fetch')
const { readFileSync } = require('fs')

const findUrl = text => {
  const regex = RegExp(/(http|https):\/\/([\w_-]+(?:(?:\.[\w_-]+)+))([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?/).exec(text)

  if (regex) {
    return regex[0]
  } else {
    return null
  }
}

const getSoundCloudTitle = async url => {
  const resp = await fetch('https://soundcloud.com/oembed', {
    method: "POST",
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      url
    })
  })
  const data = await resp.json()

  return data.title
}

const getSuggestions = async suggestionChannel => {
  let messages

  try {
    messages = await suggestionChannel.fetchMessages()
  } catch (err) {
    console.error(err)
  }

  let suggestions = []

  let promises = messages.map(async msg => {
    const url = findUrl(msg.content)

    if (!url) {
      return
    }

    let title

    try {
      title = await getSoundCloudTitle(url)
    } catch(err) {
      console.error(err)
    }

    const thumbsUp = msg.reactions.find(reaction => reaction.emoji.name == '👍')
    const votes = thumbsUp ? thumbsUp.count : 0
    const message = msg.content
    const suggester = msg.author.username

    suggestions.push( {
      url,
      title,
      votes,
      message,
      suggester
    })
  })

  try {
    await Promise.all(promises)
  } catch (err) {
    console.error(err)
  }

  suggestions.sort((a, b) => b.votes - a.votes)

  return suggestions
}

const postLeaderboard = (suggestions, leaderboardChannel) => {
  leaderboardChannel.bulkDelete(suggestions.length)
    .catch(console.error)

  leaderboardChannel.send({ embed: {
    color: 16758074,
    title: ":first_place: 1st Place",
    description: `[${suggestions[0].title}](${suggestions[0].url})`,
    fields: [{
      name: "Votes",
      value: suggestions[0].votes
    }],
    timestamp: new Date()
  }}).catch(console.error)

  leaderboardChannel.send({ embed: {
    color: 13818849,
    title: ":second_place: 2nd Place",
    description: `[${suggestions[1].title}](${suggestions[1].url})`,
    fields: [{
      name: "Votes",
      value: suggestions[1].votes
    }],
    timestamp: new Date()
  }}).catch(console.error)

  leaderboardChannel.send({ embed: {
    color: 16749891,
    title: ":third_place: 3rd Place",
    description: `[${suggestions[2].title}](${suggestions[2].url})`,
    fields: [{
      name: "Votes",
      value: suggestions[2].votes
    }],
    timestamp: new Date()
  }}).catch(console.error)

  console.log('Sucessfully updated leaderboard')
}

const postInfoText = infoChannel => {
  const infoText = readFileSync('./infoText.txt', 'utf-8')
  
  infoChannel.send(infoText)
  console.log('Sucessfully posted info text')
}

module.exports = {
  findUrl,
  getSoundCloudTitle,
  getSuggestions,
  postLeaderboard,
  postInfoText
}
