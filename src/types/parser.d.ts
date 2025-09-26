import { type WASocket } from "baileys";
import { type Logger } from "pino";

export type CommandParser = {
  bot: WASocket;
  logger: Logger;
  senderJid: `${number}@s.whatsapp.net` | `${number}@g.us`;
  text: string;
};

export type messageParser = {
  bot: WASocket;
  logger: Logger;
  senderJid: `${number}@s.whatsapp.net` | `${number}@g.us`;
  text: string;
};
