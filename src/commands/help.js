import { config } from "#utils/config";
import { getUrlInfo } from "baileys";

/**
 * @param {import("#types/handlers").CommandHandler}
 * @returns Promise<void>
 */
export const commandHelp = async ({ bot, text, logger, senderJid }) => {
  if (!text) return;
  logger.info("Sending help message...");

  const helpMessage = `*───「 🤖 BOT Infograted Help Menu 🤖 」───*

Woi, mahluk digital. Katanya anak IT, masa pake bot aja butuh \`!help\` ? Yaudah nih, gua kasih contekan biar lu gak keliatan gaptek - gaptek amat di depan anak - anak.

Simpen, pahami, jangan nanya lagi. Capek gua.

›────────── ⋆⋅☆⋅⋆ ──────────‹

╭─╌「 📜 *DAFTAR PERINTAH* 」╌─╮
│
│ 🤖 *Umum*
│   ├ • \`${config.bot.commandPrefix}help\` ✅ - Nampilin pesan ini lagi(buat yang memorinya setara RAM 128MB).
│   ├ • \`${config.bot.commandPrefix}tagall\` ✅ - Men-tag seluruh anggota grup.
│   ├ • \`${config.bot.commandPrefix}owner\` ❌ - Ngasih tau siapa majikan bot ini yang harus lu salahin kalo ada error.
│  
│ 🛠️ *Tools & Utility*
│   ├ • \`${config.bot.commandPrefix}ytmp3 [link]\` ❌ - Download audio dari YouTube.
│   ├ • \`${config.bot.commandPrefix}ytmp4 [link]\` ❌ - Download video dari YouTube.
│  
│ 🖥️ *Khusus Anak IT*
│   ├ • \`${config.bot.commandPrefix}nmap [host]\` ❌ - Nge - scan port target, jangan dipake buat yang aneh - aneh, dosa tanggung sendiri.
│   ├ • \`${config.bot.commandPrefix}whois [domain]\` ❌ - Stalking informasi domain orang.
│   ├ • \`${config.bot.commandPrefix}cve [CVE - ID]\` ❌ - Nyari detail kerentanan. Biar keliatan pinter dikit.
│  
╰─╌「 ✨ Command Lainnya Cek Sendiri ✨ 」╌─╯

›────────── ⋆⋅☆⋅⋆ ──────────‹

╭─╌「 ⚠️ *RULES WAJIB BACA* ⚠️ 」╌─╮
│
│ 1. *DILARANG SPAM*. Lu nge - spam command, bot - nya gua matiin, kita balik ke zaman batu. Kasian servernya, bukan punya bapak lu.
│
│ 2. *NO SARA, POLITIK & DEBAT KUSIR*. Kita di sini buat ngoding, nge - hack, dan flexing setup, bukan buat jadi buzzer.
│
│ 3. *HARGAI SATU SAMA LAIN*. Mau sepuh, mau newbie, semua sama. Tapi kalo pertanyaan lu bisa di - Google dalam 5 detik, siap - siap aja di - roasting.
│
│ 4. *JANGAN KIRIM LINK ANEH - ANEH*. Phishing, judi online, apalagi pinjol. Sekali kirim, langsung \`rm -rf\` (you know what i mean...) dari grup.
│
╰─╌「 📜 *Patuhi atau _terima konsekuensi_ nya* 📜 」╌─╯

›────────── ⋆⋅☆⋅⋆ ──────────‹

> Udah, gitu doang. Kalo masih bingung juga, mending lu *uninstall WhatsApp aja*.

* *Bot by MowlandCodes, Shahansyah, Angga | Informatika Integrated 💻*
* *v1.0.0 - "Kenapa harus mudah jika bisa dipersulit? 😉"*
* *Open for collaboration at \`https://github.com/MowlandCodes/bot_infograted\`*
`;

  const linkPreview = await getUrlInfo(
    "https://github.com/MowlandCodes/bot_infograted",
    {
      thumbnailWidth: 5000,
      fetchOpts: { timeout: 5000 },
      uploadImage: bot.waUploadToServer,
    },
  );

  await bot.sendMessage(senderJid, {
    text: helpMessage,
    linkPreview,
  });
};
