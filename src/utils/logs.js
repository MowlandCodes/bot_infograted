import readline from "readline";
import chalk from "chalk";
import { pino, transport } from "pino";
import { existsSync, mkdirSync } from "fs";
import { join } from "path";
import { config } from "#utils/config";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

/**
 * @param {string} text
 * @returns {Promise<string>}
 */
export const question = (text) =>
  new Promise((resolve) => rl.question(text, resolve));

/**
 * @param {string} text
 * @returns {string}
 */
export const logInfo = (text) => chalk.blue.inverse(" INFO ") + ` ${text}`;

/**
 * @param {string} text
 * @returns {string}
 */
export const logError = (text) => chalk.red.inverse(" ERROR ") + ` ${text}`;

/**
 * @param {string} text
 * @returns {string}
 */
export const logWarning = (text) =>
  chalk.yellow.inverse(" WARNING ") + ` ${text}`;

/**
 * @param {string} text
 * @returns {string}
 */
export const logSuccess = (text) =>
  chalk.green.inverse(" SUCCESS ") + ` ${text}`;

// Logging config
const logDir = config.logging?.logDir || "./logs";

if (!existsSync(logDir)) {
  console.log(logInfo(`Creating log directory: ${logDir}`));
  mkdirSync(logDir);
}

const logFile = join(logDir, `${new Date().toISOString().slice(0, 10)}.log`);

// Multi stream logging, log to stdout and file
const multiStream = transport({
  targets: [
    {
      level: config.logging?.level || "info",
      target: "pino-pretty",
      options: { colorize: true, destination: 1 }, // Log to stdout
    },
    {
      level: config.logging?.level || "info",
      target: "pino-pretty",
      options: { destination: logFile, colorize: false }, // Log to file
    },
  ],
});

export const logger = pino(multiStream);
