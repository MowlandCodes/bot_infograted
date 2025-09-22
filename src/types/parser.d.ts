import { type WASocket } from "baileys";
import { type Logger } from "pino";

export type CommandParser = {
  bot: WASocket;
  text?: string;
  logger: Logger;
  senderJid: string;
  groupJid: string;
  isGroup: boolean;
  isBot: boolean;
};
