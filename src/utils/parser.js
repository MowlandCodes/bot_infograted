import { commandHelp } from "#commands/help";
import { commandTagAll } from "#commands/tag_all";
import { commandOwner } from "#commands/owner";
import { config } from "#utils/config";
import NodeCache from "node-cache";

const cooldowns = new NodeCache({ stdTTL: 60 });
const cooldownTime = config.rules.cooldownTime * 1000; // convert milliseconds to seconds

/**
 * @param {import("#types/parser").CommandParser}
 * @returns Promise<void>
 */
export const commandParser = async ({
  bot,
  text,
  logger,
  senderJid,
  messageObj,
}) => {
  if (!text) {
    logger.error("No message text provided");
    return;
  }

  const command = text.split(" ")[0].slice(config.bot.commandPrefix.length);

  switch (command) {
    case "help":
      await commandHelp({ bot, text, logger, senderJid, messageObj });
      break;

    case "tagall":
      await commandTagAll({ bot, text, logger, senderJid, messageObj });
      break;

    case "owner":
      await commandOwner({ bot, text, logger, senderJid, messageObj });
      break;

    default:
      logger.error(`Command ${command} not found yet...`);
      break;
  }
};

/**
 * @param {import("#types/parser").messageParser}
 * @returns Promise<void>
 */
export const messageParser = async ({
  bot,
  text,
  logger,
  senderJid,
  messageObj,
}) => {
  if (!text) {
    logger.error("No text message provided");
    return;
  }

  if (text.includes("@everyone")) {
    const key = senderJid; // cooldown per grup
    const now = Date.now();

    /** @type {number} */
    const lastUsed = cooldowns.get(key) || 0;

    if (now - lastUsed < cooldownTime) {
      logger.warn("Tag all ignored: still on cooldown");
      await bot.sendMessage(senderJid, {
        text: "⚠️ *Tag all ignored*: _still on cooldown_ ⚠️",
      });
      return;
    }

    // Caching cooldown
    cooldowns.set(key, now);

    logger.info("Message contains @everyone, mentioning all users...");
    await commandTagAll({ bot, text, logger, senderJid, messageObj });
  }
};
