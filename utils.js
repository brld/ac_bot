const fetch = require('node-fetch')

const getSoundCloudTitle = async url => {
  try {
    const resp = await fetch('https://soundcloud.com/oembed', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url })
    })

    try {
      const data = await resp.json()

      return data.title
    } catch (err) {
      return null // If URL is not a valid SoundCloud link, SoundCloud's oEmbed api will send back an empty response
    }
  } catch (err) {
    console.error(`Failed to fetch SoundCloud oEmbed for ${url}: ${err}`)
  }
}

let lastLeaderboard

const isLeaderboardDifferent = leaderboard => {
  if (!lastLeaderboard) {
    lastLeaderboard = leaderboard

    return true
  }

  for (let i = 0; i < leaderboard.length; i++) {
    if (
      lastLeaderboard[i].url !== leaderboard[i].url ||
      lastLeaderboard[i].votes !== leaderboard[i].votes
    ) {
      lastLeaderboard = leaderboard
      return true
    }
  }

  lastLeaderboard = leaderboard
  return false
}

const getLeaderboardEmbeds = leaderboard => {
  const embedData = [
    {
      name: 'first',
      abbreviation: '1st',
      color: 16758074
    },
    {
      name: 'second',
      abbreviation: '2nd',
      color: 13818849
    },
    {
      name: 'third',
      abbreviation: '3rd',
      color: 16749891
    }
  ]

  return leaderboard.map((track, index) => ({
    color: embedData[index].color,
    title: `:${embedData[index].name}_place: ${embedData[index].abbreviation} Place`,
    description: `[${track.title}](${track.url})`,
    fields: [
      {
        name: 'Votes',
        value: track.votes
      },
      {
        name: 'Suggested By',
        value: track.suggester
      }
    ],
    timestamp: new Date()
  }))
}

const validateSuggestion = urls => {
  const url = Array.from(urls)[0] // May be undefined

  // Too many links or no links
  if (urls.size > 1 || !urls.size || !url.includes('soundcloud.com')) {
    return {
      message:
        'Please format your message as follows: [description] [track url on SoundCloud] :wink:',
      isValid: false
    }
  }

  // Profile link
  if (!url.split('/')[4]) {
    return {
      message: 'Please post a SoundCloud track :wink:',
      isValid: false
    }
  }

  // Private link
  if (url.split('/')[5]) {
    return {
      message: 'Please only post public SoundCloud links :wink:',
      isValid: false
    }
  }

  return {
    isValid: true
  }
}

const getLeaderboard = suggestions => {
  return suggestions
    .filter(track => track.votes > 0)
    .sort((a, b) => {
      if (a.votes === b.votes) {
        return new Date(a.suggestedDate) - new Date(b.suggestedDate)
      }

      return b.votes - a.votes
    })
    .slice(0, 3)
}

const isToday = date => {
  const today = new Date()

  return (
    date.getDate() == today.getDate() &&
    date.getMonth() == today.getMonth() &&
    date.getFullYear() == today.getFullYear()
  )
}

const isPublicSoundCloudLink = url => {
  // SoundCloud link and doesn't have private share code
  return url.includes('soundcloud.com') && !url.split('/')[5]
}

module.exports = {
  getSoundCloudTitle,
  isLeaderboardDifferent,
  getLeaderboardEmbeds,
  validateSuggestion,
  getLeaderboard
}
