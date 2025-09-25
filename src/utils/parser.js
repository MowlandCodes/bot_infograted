import { commandHelp } from "#commands/help";
import { config } from "#utils/config";

/**
 * @param {import("#types/parser").CommandParser}
 * @returns Promise<void>
 */
export const commandParser = async ({ bot, text, logger, senderJid }) => {
  if (!text) {
    logger.error("No message text provided");
    return;
  }

  // Tambahin Logic buat nge handle command dari text
  // ex: !help @bot
  const command = text.split(" ")[0].slice(config.bot.commandPrefix.length); // Ngilangin command prefix dari text command nya

  switch (command) {
    case "help":
      await commandHelp({ bot, text, logger, senderJid });
      break;
    default:
      logger.error(`Command ${command} not found yet...`);
      break;
  }

  return;
};

/**
 * @param {import("#types/parser").messageParser}
 * @returns Promise<void>
 */
export const messageParser = async ({ bot, text, logger, senderJid }) => {
  if (!text) {
    logger.error("No text message provided");
    return;
  }

  if (text.includes("@everyone")) {
    logger.info("Message contains @everyone, mentioning all users...");
    await commandTagAll({ bot, text, logger, senderJid });
  }

  // Logic buat nge handle message biasa
};
