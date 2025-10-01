import { type WASocket } from "baileys";
import { type Logger } from "pino";

export type Handler = { bot: WASocket; logger: Logger };

export type CommandHandler = {
  bot: WASocket;
  logger: Logger;
  senderJid: `${number}@s.whatsapp.net` | `${number}@g.us`;
  text: string;
};

export type SendDailyQuotes = {
  bot: WASocket;
  logger: Logger;
  groupJid: `${number}@g.us`;
};

export type DailyQuotes = {
  bot: WASocket;
  logger: Logger;
};
