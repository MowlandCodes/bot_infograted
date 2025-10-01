/**
 * @param {import("#types/handlers").CommandHandler}
 * @returns Promise<void>
 */
export const commandTagAll = async ({ bot, senderJid, logger, messageObj }) => {
  try {
    const metadata = await bot.groupMetadata(senderJid);
    const participants = metadata.participants;

    const mentions = participants.map((p) => p.id);

    await bot.sendMessage(
      senderJid,
      {
        text: "🔊 *Summoning all group Members...* 🔊",
        mentions,
      },
      { quoted: messageObj },
    );

    logger.info("✅ Tag all berhasil dengan @everyone");
  } catch (err) {
    logger.error("❌ Gagal tag all:", err);
  }
};
