import { type WASocket, type WAMessage } from "baileys";
import { type Logger } from "pino";

export type CommandParser = {
  bot: WASocket;
  logger: Logger;
  senderJid: `${number}@s.whatsapp.net` | `${number}@g.us`;
  text: string;
  messageObj?: WAMessage;
};

export type messageParser = {
  bot: WASocket;
  logger: Logger;
  senderJid: `${number}@s.whatsapp.net` | `${number}@g.us`;
  text: string;
  messageObj?: WAMessage;
};
