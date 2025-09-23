import { type WASocket } from "baileys";
import { type Logger } from "pino";

export type CommandParser = {
  bot: WASocket;
  logger: Logger;
  senderJid: string;
  groupJid: string;
  text?: string;
};

export type messageParser = {
  bot: WASocket;
  logger: Logger;
  senderJid?: string;
  groupJid?: string;
  text?: string;
};
