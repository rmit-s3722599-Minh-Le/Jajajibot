import 'dotenv/config';

export async function DiscordRequest(endpoint, options) {
  // append endpoint to root API URL
  const url = 'https://discord.com/api/v10/' + endpoint;
  // Stringify payloads
  if (options.body) options.body = JSON.stringify(options.body);
  // Use fetch to make requests
  const res = await fetch(url, {
    headers: {
      Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
      'Content-Type': 'application/json; charset=UTF-8',
      'User-Agent': 'DiscordBot (https://github.com/discord/discord-example-app, 1.0.0)',
    },
    ...options
  });
  // throw API errors
  if (!res.ok) {
    const data = await res.json();
    console.log(res.status);
    throw new Error(JSON.stringify(data));
  }
  // return original response
  return res;
}

export async function InstallGlobalCommands(appId, commands) {
  // API endpoint to overwrite global commands
  const endpoint = `applications/${appId}/commands`;

  try {
    // This is calling the bulk overwrite endpoint: https://discord.com/developers/docs/interactions/application-commands#bulk-overwrite-global-application-commands
    await DiscordRequest(endpoint, { method: 'PUT', body: commands });
  } catch (err) {
    console.error(err);
  }
}

// Simple method that returns a random emoji from list
export function getRandomEmoji() {
  const emojiList = ['😭','😄','😌','🤓','😎','😤','🤖','😶‍🌫️','🌏','📸','💿','👋','🌊','✨'];
  return emojiList[Math.floor(Math.random() * emojiList.length)];
}

export function getRamdomGreetings() {
  const greetings = [
    ['https://media.discordapp.net/attachments/1144095932414169169/1394586320403435540/4-ScoldingCat-ezgif.com-crop.gif?ex=69d213b8&is=69d0c238&hm=c86f8c1dcbf8e31656e8a978456c3a52a46d6c9a7d5ef74f8572acffa1b189b3&=', 'JaaawwJawwJi'],
    ['https://media.tenor.com/7RYccVz-o8IAAAAC/tenor.gif', 'agangggggggg']
  ]
  return greetings[Math.floor(Math.random() * greetings.length)]

}

export function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function pingUser (usr) {
  return `<@${usr}>`
}