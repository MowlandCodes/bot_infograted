import { type WASocket } from "baileys";
import { type Logger } from "pino";

export type Handler = { bot: WASocket; logger: Logger };
