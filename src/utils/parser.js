import { commandHelp } from "#commands/help";
import { commandTagAll } from "#commands/tag_all";
import { commandOwner } from "#commands/owner";
import { config } from "#utils/config";
import NodeCache from "node-cache";

const cooldowns = new NodeCache({ stdTTL: 60 });
const cooldownTime = config.rules.cooldownTime * 1000; // convert seconds to ms

// 🧩 Daftar kata toxic (bisa kamu tambah sesuka hati)
const toxicWords = [
  "kontol",
  "anjing",
  "goblok",
  "tolol",
  "babi",
  "bangsat",
  "memek",
  "ngentot",
  "idiot",
  "bajingan",
  "brengsek",
  "sialan",
  "kampret",
  "asu",
  "tai",
  "bego",
  "pantek",
  "perek",
  "pepek",
  "jancok",
  "jancuk",
  "j4nc0k",
  "b4b1",
  "b4ngsat",
  "b4j1ngan",
];

// 🧠 Fungsi untuk deteksi kata toxic
function isToxic(text) {
  const lower = text.toLowerCase();
  return toxicWords.some((word) => lower.includes(word));
}

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

  // 🚫 Anti Toxic + Auto Delete
  if (isToxic(text)) {
    logger.warn(`Pesan toxic terdeteksi dari ${senderJid}`);

    // 🔥 Hapus pesan otomatis
    await bot.sendMessage(senderJid, {
      delete: {
        remoteJid: senderJid,
        fromMe: false,
        id: messageObj.key.id,
        participant: messageObj.key.participant || senderJid,
      },
    });

    // ⚠️ Kirim peringatan
    await bot.sendMessage(senderJid, {
      text: "🚫 Pesanmu otomatis dihapus karena mengandung kata toxic. Mohon jaga bahasa 🙏",
    });

    return; // stop supaya gak lanjut ke bawah
  }

  // ⛔ Anti Spam (Tagall cooldown)
  if (text.includes("@everyone")) {
    const key = senderJid; // cooldown per grup
    const now = Date.now();
    const lastUsed = cooldowns.get(key) || 0;

    if (now - lastUsed < cooldownTime) {
      logger.warn("Tag all ignored: still on cooldown");
      await bot.sendMessage(senderJid, {
        text: "⚠️ *Tag all ignored*: _still on cooldown_ ⚠️",
      });
      return;
    }

    // Simpan waktu terakhir @everyone
    cooldowns.set(key, now);

    logger.info("Message contains @everyone, mentioning all users...");
    await commandTagAll({ bot, text, logger, senderJid, messageObj });
  }
};
