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
    ['https://media.tenor.com/t7_iTN0iYekAAAAC/sad-sad-cat.gif', 'I maow'],
    ['https://media.tenor.com/7RYccVz-o8IAAAAC/tenor.gif', 'agangggggggg'],
    ['https://cdn.discordapp.com/attachments/1144095932414169169/1474067515662663823/ezgif.com-speed_2.gif?ex=69d1d91a&is=69d0879a&hm=afc3ca4b682ac2e03c3eb43f160daa9235840498b43992c306817edcb29029dd&', 'hey hey u u!'],
  ]
  return greetings[Math.floor(Math.random() * greetings.length)]

}

function parseClockTime(input) {
  //input is 0:00
  const match = input.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;

  const hours = parseInt(match[1]);
  const minutes = parseInt(match[2]);

  if (hours > 23 || minutes > 59) return null;

  return { hours, minutes };

}


export function getDelayFromClockTime(input, timezone = 'UTC') {
  const parsed = parseClockTime(input);
  if (!parsed) return null;

  const now = new Date();

  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);

  const p = Object.fromEntries(parts.map(x => [x.type, x.value]));

  const tzOffset = getTimezoneOffset(timezone, now);
  
  const targetUtc = new Date(Date.UTC(
    parseInt(p.year),
    parseInt(p.month) - 1,
    parseInt(p.day),
    parsed.hours,
    parsed.minutes,
    0
  ) - tzOffset);

  console.log('timezone:', timezone);
  console.log('parsed time:', parsed.hours, parsed.minutes);
  console.log('tzOffset (ms):', tzOffset, '(hours):', tzOffset / 3600000);
  console.log('targetUtc:', targetUtc.toISOString());
  console.log('now:', now.toISOString());

  if (targetUtc <= now) {
    targetUtc.setUTCDate(targetUtc.getUTCDate() + 1);
  }

  return targetUtc.getTime() - now.getTime();
}

function getTimezoneOffset(timezone, date) {
  const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
  const tzDate = new Date(date.toLocaleString('en-US', { timeZone: timezone }));
  return tzDate.getTime() - utcDate.getTime(); 
}

export function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function pingUser (usr) {
  return `<@${usr}>`
}