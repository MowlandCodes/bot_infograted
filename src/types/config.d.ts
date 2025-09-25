export type Config = {
  bot: {
    name: string;
    online: boolean;
    commandPrefix: string;
    syncHistory: boolean;
  };
  rules: {
    validGroups: string[];
  };
  logger: {
    level: string;
    logDir: string;
  };
};
