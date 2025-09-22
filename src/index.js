import {
  makeWASocket,
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  isJidBroadcast,
  Browsers,
  isJidBot,
  isJidGroup,
  WAMessage,
} from "baileys";
import NodeCache from "node-cache";
import { pino } from "pino";
import { Boom } from "@hapi/boom";
import chalk from "chalk";

import { question, logger, logInfo } from "#utils/logs";
import { config } from "#utils/config";

const msgRetryCounterCache = new NodeCache({ stdTTL: 60 });

const groupMetadataCache = new NodeCache({ stdTTL: 60, useClones: false });

const startBot = async () => {
  const { version, isLatest } = await fetchLatestBaileysVersion();
  const { state, saveCreds } = await useMultiFileAuthState("./session");

  console.log(
    logInfo(
      `Using baileys v${version.join(".")} ${
        isLatest ? chalk.green("(latest)") : chalk.red("(outdated)")
      }`
    ) + "\n"
  );

  const bot = makeWASocket({
    version,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, logger),
    },
    logger: pino({ level: "silent" }),
    browser: Browsers.ubuntu("Firefox"),
    msgRetryCounterCache,
    generateHighQualityLinkPreview: true,
    markOnlineOnConnect: config.bot?.online || true,
    shouldIgnoreJid: (jid) => isJidBroadcast(jid),
    syncFullHistory: config.bot?.syncHistory || false,
    cache: async (jid) => groupMetadataCache.get(jid),
  });

  // Check connection, if not connected ask for phone number
  if (!bot.authState.creds.registered) {
    const phoneNumber = await question(
      logInfo("Enter your phone number (format: 628xxxxxxxxxxx) => ")
    );

    setTimeout(async () => {
      let pairingCode = await bot.requestPairingCode(phoneNumber);
      pairingCode = pairingCode?.match(/.{1,4}/g)?.join("-") || "";

      logger.info(`Enter this code to your WhatsApp: ${pairingCode}`);
    }, 3000);
  }

  // Save credentials on update
  bot.ev.on("creds.update", saveCreds);

  // Handle Connection update
  bot.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      logger.info("Using Pairing Code to connect to Whatsapp...");
    } else if (connection === "open") {
      logger.info(`${config.bot?.name} Connected to Whatsapp!`);
    } else if (connection === "close") {
      const shouldReconnect =
        (lastDisconnect.error instanceof Boom)?.output?.statusCode !==
        DisconnectReason.loggedOut;

      logger.error(`Disconnected from Whatsapp: ${lastDisconnect.error}`);

      if (shouldReconnect) {
        logger.info("Reconnecting to Whatsapp...");
        startBot();
      }
    }
  });

  bot.ev.on("messages.upsert", async (msg) => {
    // Required properties

    /** @type {import("baileys".WAMessage)} */
    const latestMessage = msg.messages[0];

    /** @type {string?} */
    const messageText =
      latestMessage?.message?.extendedTextMessage?.text ||
      latestMessage?.message?.conversation ||
      latestMessage?.message?.imageMessage?.caption ||
      latestMessage?.message?.videoMessage?.caption ||
      null;

    /** @type {string?} */
    const senderJid =
      latestMessage?.key?.remoteJid || latestMessage?.key?.participant || null;

    /** @type {boolean} */
    const isBot = isJidBot(senderJid);

    /** @type {boolean} */
    const isGroup = isJidGroup(senderJid);

    /** @type {string?} */
    const groupJid = isGroup ? senderJid : null;
  });
};

startBot();
