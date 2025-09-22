/**
 * @param {import("#types/parser").CommandParser}
 * @returns Promise<void>
 */
export const commandParser = async ({
  bot,
  text,
  logger,
  senderJid,
  groupJid,
  isGroup,
  isBot,
}) => {
  if (!text) {
    logger.error("No message text provided");
    return;
  }

  // Tambahin Logic buat nge handle command dari text
};
