import { schedule } from "node-cron";
import { validGroups } from "#utils/config";
import axios from "axios";
import align from "align-text";

// Fungsi ambil random quote
async function getRandomQuote() {
  const quotesUrl = "http://api.quotable.io";

  const quotes = await axios({
    method: "GET",
    url: `${quotesUrl}/quotes/random`,
    responseType: "json",
  });

  return { content: quotes.data[0].content, author: quotes.data[0].author };
}

function centerAlign(len, longest, line, lines) {
  return 3 + Math.floor((longest - len) / 2);
}

// Fungsi kirim quotes ke grup
/**
 * @param {import("#types/handlers").SendDailyQuotes}
 * @returns {Promise<void>}
 */
async function sendDailyQuote({ bot, groupJid, logger }) {
  const { content, author } = await getRandomQuote();

  logger.info("Sending daily quote to group...");

  const quotesContent = align(`*${content}*\n\n~ _${author}_ ~`, centerAlign);

  const quotesTemplate = `· · ─────── ❖ ─────── · ·
✨ *Petuah Hari Ini* ✨

${quotesContent} ❞

· · ─────── ❖ ─────── · ·

> Semoga tercerahkan.
> Atau setidaknya, terhibur sesaat
> sebelum kembali ke realita yang fana ini.`;

  await bot.sendMessage(groupJid, {
    text: quotesTemplate,
  });
}

/**
 * @param {import("#types/handlers").DailyQuotes}
 * @returns {void}
 */
export function doDailyQuotes({ bot, logger }) {
  for (const [groupJid, groupName] of Object.entries(validGroups)) {
    logger.info(`Scheduling daily quote for group: ${groupName}`);
    schedule(
      "0 6 * * *",
      async () => await sendDailyQuote({ bot, groupJid, logger }),
      {
        timezone: "Asia/Jakarta",
      },
    );
    schedule(
      "0 19 * * *",
      async () => await sendDailyQuote({ bot, groupJid, logger }),
      {
        timezone: "Asia/Jakarta",
      },
    );
  }
}
