import {
  makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  isJidBroadcast,
  Browsers,
  DisconnectReason,
  delay,
} from "baileys";
import NodeCache from "node-cache";
import { pino } from "pino";
import chalk from "chalk";
import { Boom } from "@hapi/boom";
import { question, logger, logInfo } from "#utils/logs";
import { config } from "#utils/config";
import { handleConnectionUpdate, handleIncomingMessage } from "#utils/handlers";

const msgRetryCounterCache = new NodeCache({ stdTTL: 60 });
const groupMetadataCache = new NodeCache({ stdTTL: 60, useClones: false });

/**
 * Start bot connection to Whatsapp
 * @returns {Promise<void>}
 */
export const startBot = async () => {
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
    cachedGroupMetadata: async (jid) => groupMetadataCache.get(jid),
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

  // Handlers instead of events
  await handleIncomingMessage({ bot, logger });
  await handleConnectionUpdate({ bot, logger });
};

startBot();
