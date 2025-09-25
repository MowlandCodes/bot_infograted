import { isJidBot, isJidGroup, DisconnectReason, delay } from "baileys";
import { Boom } from "@hapi/boom";

import { startBot } from "#src/index";
import { config } from "#utils/config";
import { commandParser, messageParser } from "#utils/parser";

/**
 * @param {import("#types/handlers").Handler}
 * @returns Promise<void>
 */
export const handleIncomingMessage = async ({ bot, logger }) => {
  bot.ev.on("messages.upsert", async ({ messages }) => {
    // Required properties

    /** @type {import("baileys").WAMessage} */
    const latestMessage = messages[0];

    /** @type {string?} */
    const messageText =
      latestMessage?.message?.extendedTextMessage?.text ||
      latestMessage?.message?.conversation.messages ||
      latestMessage?.message?.imageMessage?.caption ||
      latestMessage?.message?.videoMessage?.caption ||
      null;

    /** @type {string?} */
    const botJid = bot.user?.id;

    /** @type {string} */
    const senderJid =
      latestMessage?.key?.remoteJid || latestMessage?.key?.participant;

    /** @type {boolean} */
    const isBot = isJidBot(senderJid);

    /** @type {boolean} */
    const isGroup = isJidGroup(senderJid);

    /** @type {boolean} */
    const isFromMe = latestMessage.key?.fromMe;

    /** @type {string?} */
    const groupJid = isGroup ? senderJid : null;

    /** @type {string?} */
    const groupName = isGroup
      ? (await bot.groupMetadata(groupJid)).subject
      : null;

    /** @type {boolean} */
    const isValidGroup =
      isGroup && config.rules?.validGroups.includes(groupJid);

    // Contoh command yang valid
    // <commandPrefix>help @bot
    // ex: !help @bot (Bot harus di mention/tag)

    /** @type {boolean?} */
    const isCommand = messageText
      ?.toLowerCase()
      ?.startsWith(config.bot?.commandPrefix || "!");

    /** @type {boolean} */
    const isBotMentioned =
      latestMessage?.message?.extendedTextMessage?.contextInfo?.mentionedJid.includes(
        botJid,
      );

    if (isBot) {
      logger.warn("Received message from a bot, ignoring...");
      return; // Ignore message from bot
    }

    if (isFromMe) {
      logger.warn("Received message from yourself, ignoring...");
      return; // Ignore message from yourself
    }

    // Command di terima kalo:
    // 1. Dateng dari grup yang valid
    // 2. Bot harus di mention
    // 3. Command harus valid
    if (isCommand && isGroup && isBotMentioned && isValidGroup) {
      // Parse command and execute function according to the command
      await commandParser({
        bot,
        text: messageText?.toLowerCase(),
        logger,
        senderJid,
        groupJid,
      });
    } else {
      await messageParser({
        bot,
        text: messageText ? messageText : "",
        logger,
        senderJid,
        groupJid,
      });
    }
  });
};

/**
 * @param {import("#types/handlers").Handler}
 * @returns Promise<void>
 */
export const handleConnectionUpdate = async ({ bot, logger }) => {
  bot.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      logger.info("Using Pairing Code to connect to Whatsapp...");
    } else if (connection === "open") {
      logger.info(`${config.bot?.name} Connected to Whatsapp!`);
    } else if (connection === "close") {
      const shouldReconnect =
        (lastDisconnect?.error instanceof Boom)?.output?.statusCode !==
        DisconnectReason.loggedOut;

      logger.error(`Disconnected from Whatsapp: ${lastDisconnect.error}`);

      if (shouldReconnect) {
        logger.info("Reconnecting to Whatsapp...");
        await delay(3000); // Delay for 3 seconds, to avoid rate limiting
        startBot();
      }
    }
  });
};
