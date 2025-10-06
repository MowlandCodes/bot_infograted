import {
  isJidBot,
  isJidGroup,
  DisconnectReason,
  delay,
  jidNormalizedUser,
} from "baileys";
import { Boom } from "@hapi/boom";

import { startBot } from "#src/index";
import { config, validGroups } from "#utils/config";
import { commandParser, messageParser } from "#utils/parser";
import NodeCache from "node-cache";

// Cache untuk metadata grup
const groupCache = new NodeCache({ stdTTL: 60 * 5 }); // Time to live nya 5 menit

/**
 * Ambil nama grup dengan cache (biar gak spam request ke WA)
 * @param {import("baileys").WASocket} bot
 * @param {string} groupJid
 * @returns {Promise<string>}
 */
async function getGroupName(bot, groupJid) {
  if (groupCache.has(groupJid)) {
    return groupCache.get(groupJid);
  }

  const metadata = await bot.groupMetadata(groupJid);
  const subject = metadata.subject;

  groupCache.set(groupJid, subject);

  return subject;
}

/**
 * @param {import("#types/handlers").IsBotAdmin}
 * @returns {Promise<boolean>}
 */
export const isBotAdmin = async ({ bot, groupJid, botJid }) => {
  try {
    const groupMetadata = await bot.groupMetadata(groupJid);

    const participant = groupMetadata?.participants.find(
      (participant) => participant.id === botJid,
    );

    return participant?.isAdmin || participant?.isSuperAdmin || false;
  } catch (error) {
    logger.error(`Error checking if bot is admin: ${error}`);
    return false;
  }
};

/**
 * @param {import("#types/handlers").Handler}
 * @returns Promise<void>
 */
export const handleIncomingMessage = async ({ bot, logger }) => {
  bot.ev.on("messages.upsert", async ({ messages }) => {
    // Required properties

    /** @type {import("baileys").WAMessage} */
    const latestMessage = messages[0];

    /** @type {string} */
    const messageText =
      latestMessage?.message?.extendedTextMessage?.text ||
      latestMessage?.message?.conversation ||
      latestMessage?.message?.imageMessage?.caption ||
      latestMessage?.message?.videoMessage?.caption ||
      "";

    /** @type {`${string}@s.whatsapp.net` | null} */
    const botJid = jidNormalizedUser(bot.authState?.creds?.me?.id);

    /** @type {`${string}@lid` | null} */
    const botLid = bot.authState?.creds?.lid
      ? bot.authState?.creds?.lid?.split("@")[0].split(":")[0] + "@lid"
      : null;

    /** @type {string} */
    const senderJid = latestMessage?.key?.remoteJid;

    /** @type {string?} */
    const senderName = latestMessage?.pushName;

    /** @type {boolean} */
    const isBot = isJidBot(senderJid);

    /** @type {boolean} */
    const isGroup = isJidGroup(senderJid);

    /** @type {boolean} */
    const isFromMe = latestMessage.key?.fromMe;

    /** @type {string?} */
    const groupJid = isGroup ? senderJid : null;

    /** @type {string?} */
    const groupName = isGroup ? await getGroupName(bot, groupJid) : null;

    /** @type {boolean} */
    const isValidGroup = isGroup && groupJid in validGroups;

    // Contoh command yang valid
    // <commandPrefix>help @bot
    // ex: !help @bot (Bot harus di mention/tag)

    /** @type {boolean?} */
    const isCommand = messageText
      ?.toLowerCase()
      ?.startsWith(config.bot?.commandPrefix || "!");

    /** @type {boolean} */
    const isBotMentioned =
      latestMessage?.message?.extendedTextMessage?.contextInfo?.mentionedJid?.includes(
        botJid,
      ) ||
      latestMessage?.message?.extendedTextMessage?.contextInfo?.mentionedJid?.includes(
        botLid,
      ); // Mention nya bisa pake JID atau LID

    let isAdmin = false;
    if (isGroup && isValidGroup) {
      isAdmin = await isBotAdmin({ bot, groupJid, botJid });
    }

    if (isBot) {
      logger.warn("Received message from a bot, ignoring...");
      return; // Ignore message from bot
    }

    if (config.environment === "production" && isFromMe) {
      logger.warn("Received message from yourself, ignoring...");
      return; // Ignore message from yourself
    }

    // Command di terima kalo:
    // 1. Dateng dari grup yang valid
    // 2. Bot harus di mention
    // 3. Command harus valid
    if (isCommand && isValidGroup /* && isBotMentioned */) {
      logger.info(
        `Message received from ${senderName} in group ${groupName}: ${messageText}`,
      );
      // Parse command and execute function according to the command
      await commandParser({
        bot,
        text: messageText?.toLowerCase(),
        logger,
        senderJid,
        messageObj: latestMessage,
      });
    }

    // Message di terima kalo:
    // 1. Dateng dari grup yang valid
    else if (isValidGroup) {
      logger.info(
        `Message received from ${senderName} in group ${groupName}: ${messageText}`,
      );
      await messageParser({
        bot,
        text: messageText ? messageText : "",
        logger,
        senderJid,
        messageObj: latestMessage,
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
