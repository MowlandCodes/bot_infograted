import { config } from "#utils/config";

const owners = config.owner;

/**
 * @param {import("#types/handlers").CommandHandler}
 * @returns {Promise<void>}
 */
export const commandOwner = async ({ bot, logger, senderJid, messageObj }) => {
  // Bot nya yatim
  if (!owners || owners.length < 1) {
    logger.info("Bot ini tidak punya owner...");

    await bot.sendMessage(senderJid, {
      text: "*Bot ini anak yatim piatu guys, gak punya owner. 😢*",
    });
  }

  try {
    const ownerCards = owners.map((ownerData) => {
      const card = `╭─「 👑 *OWNER CARD* 👑 」─╮
│
│ 👤 *NAMA*
│    » *${ownerData.name}*
│
│ 💻 *GITHUB*
│    » *${ownerData.github}*
│
│ 💡 *MOTTO*
│    » *_"${ownerData.motto}"_*
│
╰─「 *"Don't touch my code, mortal."* 」─╯`.trim();

      return card;
    });

    const finalMessage = ownerCards.join("\n\n");

    await bot.sendMessage(
      senderJid,
      { text: finalMessage },
      { quoted: messageObj },
    );
  } catch (error) {
    logger.error("Error pas nampilin owner information: \n", error);
    return;
  }
};
