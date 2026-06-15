import 'dotenv/config';
import express from 'express';
import {
  ButtonStyleTypes,
  InteractionResponseFlags,
  InteractionResponseType,
  InteractionType,
  MessageComponentTypes,
  verifyKeyMiddleware,
} from 'discord-interactions';
import { getRandomEmoji, DiscordRequest, pingUser, getRamdomGreetings, getDelayFromClockTime } from './utils.js';
import { startReminderScheduler } from './scheduler.js';
import { getShuffledOptions, getResult } from './game.js';
import pool from './db.js';



// Create an express app
const app = express();
// Get port, or default to 3000
const PORT = process.env.PORT || 3000;
// To keep track of our active games
const activeGames = {};

/**
 * Interactions endpoint URL where Discord will send HTTP requests
 * Parse request body and verifies incoming requests using discord-interactions package
 */
app.post('/interactions', verifyKeyMiddleware(process.env.PUBLIC_KEY), async function (req, res) {
  // Interaction id, type and data
  const { id, type, data } = req.body;

  /**
   * Handle verification requests
   */
  if (type === InteractionType.PING) {
    return res.send({ type: InteractionResponseType.PONG });
  }
  
  /**
   * Handle slash command requests
   * See https://discord.com/developers/docs/interactions/application-commands#slash-commands
   */
  if (type === InteractionType.APPLICATION_COMMAND) {
    const { name } = data;

    // "test" command
    if (name === 'jajaji') {
      // Send a message into the channel where command was triggered from
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          flags: InteractionResponseFlags.IS_COMPONENTS_V2,
          components: [
            {
              type: MessageComponentTypes.TEXT_DISPLAY,
              // Fetches a random emoji to send from a helper function
              content: `Jajajihai`
            }
          ]
        },
      });
    }

    if (name === 'jajajihai') {
      // Send a message into the channel where command was triggered from
      const greeting = getRamdomGreetings()
      console.log('fetching', greeting)
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: greeting[1],
          embeds: [
            {
              image: {
                url: greeting[0]
              }
            }
          ]
        },
      });
    }

    if (name === 'reminder') {
      const objTime = req.body.data.options[0].value;
      const msg = req.body.data.options[1].value;
      const objUser = req.body.data.options[2]?.value;
      const objIsRepeat = req.body.data.options[3]?.value ?? false;

      const context = req.body.context;
      const channelId = req.body.channel_id;
      const userId = objUser || (context === 0 ? req.body.member.user.id : req.body.user.id);

      // look up user's timezone first
      const { rows } = await pool.query(
        'SELECT timezone FROM user_timezones WHERE user_id = $1',
        [userId]
      );
      const timezone = rows[0]?.timezone ?? 'UTC';

      // pass timezone in
      const delay = getDelayFromClockTime(objTime, timezone);
      const remindAt = new Date(Date.now() + delay);

      if (!delay) {
        return res.send({
          type: 4,
          data: { content: `Invalid time! Use HH:MM format like 13:23\n\nNo timezone set? Use \`/timezone\` first (e.g. \`Australia/Melbourne\`)` }
        });
      }

      await pool.query(
        `INSERT INTO reminders (user_id, channel_id, message, remind_at, is_repeat, repeat_delay)
        VALUES ($1, $2, $3, $4, $5, $6)`,
        [userId, channelId, msg, remindAt, objIsRepeat, objIsRepeat ? delay : null]
      );

      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          flags: InteractionResponseFlags.IS_COMPONENTS_V2,
          components: [
            {
              type: MessageComponentTypes.TEXT_DISPLAY,
              content: `Reminder set for ${pingUser(userId)} at <t:${Math.floor(remindAt.getTime() / 1000)}:f>! Repeat is ${objIsRepeat}.`
            }
          ]
        },
      });
    }
    if (name === 'timezone') {
      const tz = req.body.data.options[0].value; 
      const context = req.body.context;
      const userId = req.body.data.options[2]?.value || (context === 0 ? req.body.member.user.id : req.body.user.id);
      
      await pool.query(
        `INSERT INTO user_timezones (user_id, timezone) VALUES ($1, $2)
        ON CONFLICT (user_id) DO UPDATE SET timezone = $2`,
        [userId, tz]
      );

      return res.send({
        type: 4,
        data: { content: `Jaji Timezone set to \`${tz}\`` }
      });
    }

    console.error(`unknown command: ${name}`);
    return res.status(400).json({ error: 'unknown command' });
  }

  console.error('unknown interaction type', type);
  return res.status(400).json({ error: 'unknown interaction type' });
});

startReminderScheduler();

app.listen(PORT, () => {
  console.log('Listening on port', PORT);
});


//https://www.youtube.com/watch?v=xXQnTb5e1CM
//https://docs.discord.com/developers/interactions/application-commands#slash-command-interaction
//https://docs.discord.com/developers/platform/interactions