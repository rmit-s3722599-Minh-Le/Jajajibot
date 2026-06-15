import pool from './db.js';

const DISCORD_API = 'https://discord.com/api/v10';

async function sendReminder(reminder) {
  await fetch(`${DISCORD_API}/channels/${reminder.channel_id}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      content: `<@${reminder.user_id}> Jajaji Reminder: ${reminder.message}`,
    }),
  });
}

export async function startReminderScheduler() {
  setInterval(async () => {
    //keep superbase from pausing
    await pool.query('SELECT 1');

    const { rows } = await pool.query(
      `DELETE FROM reminders WHERE remind_at <= NOW() RETURNING *`
    );

    for (const reminder of rows) {
      await sendReminder(reminder);

      // Re-insert if repeat
      if (reminder.is_repeat && reminder.repeat_delay) {
        await pool.query(
          `INSERT INTO reminders (user_id, channel_id, message, remind_at, is_repeat, repeat_delay)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            reminder.user_id,
            reminder.channel_id,
            reminder.message,
            new Date(Date.now() + Number(reminder.repeat_delay)),
            true,
            reminder.repeat_delay,
          ]
        );
      }
    }
  }, 30_000); // check every 30 seconds
}