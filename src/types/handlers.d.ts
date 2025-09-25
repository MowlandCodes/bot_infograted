import { type WASocket } from "baileys";
import { type Logger } from "pino";

export type Handler = { bot: WASocket; logger: Logger };

export type CommandHandler = {
  bot: WASocket;
  logger: Logger;
  senderJid: `${string}@s.whatsapp.net` | `${string}@g.us`;
  text: string;
};
