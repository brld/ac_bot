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

  try {
    const data = await resp.json()
    
    return data.title
  } catch(err) {
    return null
  }

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
    try {
      const url = findUrl(msg.content)

      if (!url) return

      const title = await getSoundCloudTitle(url)

      if (!title) return
      
      const thumbsUp = msg.reactions.find(reaction => reaction.emoji.name == '👍')

      suggestions.push({
        url,
        title,
        votes: thumbsUp ? thumbsUp.count : 0,
        message: msg.content,
        suggester: msg.author.username
      })
    } catch(err) {
      console.error(`Error fetching [${msg.content}]: ${err}`)
    }
  })

  try {
    await Promise.all(promises)
  } catch (err) {
    console.error(err)
  }

  suggestions.sort((a, b) => b.votes - a.votes)

  return suggestions
}

const generateLeaderboard = suggestions => {
  const abbreviations = [
    {
      name: 'first',
      abbreviation: '1st',
      color: 16758074
    },
    {
      name: 'second',
      abbreviation: '2nd',
      color: 13818849,
    },
    {
      name: 'third',
      abbreviation: '3rd',
      color: 16749891
    }
  ]
  const embeds = []

  suggestions
    .slice(0, 3)
    .forEach(((suggestion, index) => {
      const abbreviation = abbreviations[index]

      const embed = {
        color: abbreviation.color,
        title: `:${abbreviation.name}_place: ${abbreviation.abbreviation} Place`,
        description: `[${suggestion.title}](${suggestion.url})`,
        fields: [{
          name: "Votes",
          value: suggestion.votes
        }],
        timestamp: new Date()
      }

      embeds.push(embed)
    }))

  return embeds
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
  generateLeaderboard,
  postInfoText
}
