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
}) => {
  if (!text) {
    logger.error("No message text provided");
    return;
  }

  // Tambahin Logic buat nge handle command dari text
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
  groupJid,
}) => {
  if (!text) {
    logger.error("No message text provided");
    return;
  }

  // Logic buat nge handle message biasa
};
