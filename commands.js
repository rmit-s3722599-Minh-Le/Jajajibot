import 'dotenv/config';
import { getRPSChoices } from './game.js';
import { capitalize, InstallGlobalCommands } from './utils.js';
import pool from './db.js';

// Get the game choices from game.js
function createCommandChoices() {
  const choices = getRPSChoices();
  const commandChoices = [];

  for (let choice of choices) {
    commandChoices.push({
      name: capitalize(choice),
      value: choice.toLowerCase(),
    });
  }

  return commandChoices;
}

// Simple test command

const REMINDER_COMMAND = {
  name: 'reminder',
  description: 'Remind and ping Jajajihai',
  options: [
  {
    name: 'time',
    description: 'jajaji Time',
    type: 3,
    required: true
  },
  {
    name: 'message',
    description: 'jajaji message',
    type: 3,
    required: true
  },
  {
    name: 'user',
    description: 'jajajiUser to ping',
    type: 6,
    required: false
  },
  {
    name: 'repeat',
    description: 'jajaji repeat',
    type: 5,
    required: false
  },
],
  integration_types: [0, 1],
  contexts: [0, 1, 2],
};

const TEST_COMMAND = {
  name: 'jajaji',
  description: 'Jajaji',
  type: 1,
  integration_types: [0, 1],
  contexts: [0, 1, 2],
};


const RANDOM_HI_COMMAND = {
  name: 'jajajihai',
  description: 'Jajajihai',
  type: 1,
  integration_types: [0, 1],
  contexts: [0, 1, 2],
};

const TIMEZONE_COMMAND = {
  name: 'timezone',
  description: 'Set your timezone for reminders',
  options: [
    {
      name: 'timezone',
      description: 'Select your timezone',
      type: 3,
      required: true,
      choices: [
        { name: 'Melbourne (AEDT/AEST)', value: 'Australia/Melbourne' },
        { name: 'Las Vegas (PT)', value: 'America/Los_Angeles' },
        { name: 'New York (ET)', value: 'America/New_York' },
        { name: 'London (GMT/BST)', value: 'Europe/London' },
        { name: 'Tokyo (JST)', value: 'Asia/Tokyo' },
        { name: 'Singapore (SGT)', value: 'Asia/Singapore' },
        { name: 'Dubai (GST)', value: 'Asia/Dubai' },
        { name: 'Paris (CET/CEST)', value: 'Europe/Paris' },
      ]
    }
  ],
  integration_types: [0, 1],
  contexts: [0, 1, 2],
};


// Command containing options
const CHALLENGE_COMMAND = {
  name: 'challenge',
  description: 'Challenge to a match of rock paper scissors',
  options: [
    {
      type: 3,
      name: 'object',
      description: 'Pick your object',
      required: true,
      choices: createCommandChoices(),
    },
  ],
  type: 1,
  integration_types: [0, 1],
  contexts: [0, 2],
};

const ALL_COMMANDS = [TEST_COMMAND, REMINDER_COMMAND, CHALLENGE_COMMAND, RANDOM_HI_COMMAND, TIMEZONE_COMMAND];

InstallGlobalCommands(process.env.APP_ID, ALL_COMMANDS);
