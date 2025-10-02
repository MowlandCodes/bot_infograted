import {
  makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  isJidBroadcast,
  Browsers,
} from "baileys";
import NodeCache from "node-cache";
import { pino } from "pino";
import chalk from "chalk";
import { logger, logInfo } from "#utils/logs";
import { config } from "#utils/config";
import { handleConnectionUpdate, handleIncomingMessage } from "#utils/handlers";
import { doDailyQuotes } from "#utils/quotes";

const msgRetryCounterCache = new NodeCache({ stdTTL: 60 });
const groupMetadataCache = new NodeCache({ stdTTL: 60, useClones: false });
const mediaCache = new NodeCache({ stdTTL: 60, useClones: false });

/**
 * Start bot connection to Whatsapp
 * @returns {Promise<void>}
 */
export const startBot = async () => {
  const { version, isLatest } = await fetchLatestBaileysVersion();
  const { state, saveCreds } = await useMultiFileAuthState("./session");

  console.log(
    logInfo(
      `Using baileys v${version.join(".")} ${isLatest ? chalk.green("(latest)") : chalk.red("(outdated)")
      }`,
    ) + "\n",
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
    markOnlineOnConnect: config.bot?.online ?? true,
    shouldIgnoreJid: (jid) => isJidBroadcast(jid),
    syncFullHistory: config.bot?.syncHistory ?? false,
    cachedGroupMetadata: async (jid) => groupMetadataCache.get(jid),
    mediaCache,
    enableAutoSessionRecreation: true,
  });

  // Check connection, if not connected fetch phone number from config
  if (!bot?.authState?.creds?.registered) {
    const phoneNumber = config.bot?.phoneNumber || false;

    if (!phoneNumber) {
      logger.error("No phone number found in config");
      process.exit(1);
    }

    setTimeout(async () => {
      let pairingCode = await bot.requestPairingCode(phoneNumber);
      pairingCode = pairingCode?.match(/.{1,4}/g)?.join("-") || "";

      logger.info(`Enter this code to your WhatsApp: ${pairingCode}`);
    }, 3000);
  }

  // Save credentials on update
  bot.ev.on("creds.update", saveCreds);

  // Handlers instead of events
  handleConnectionUpdate({ bot, logger });
  handleIncomingMessage({ bot, logger });

  // Daily Quotes
  doDailyQuotes({ bot, logger });
};

startBot();
