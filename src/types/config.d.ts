export type Config = {
  owner: {
    name: string;
    github: string;
    motto: string;
  }[];
  bot: {
    name: string;
    online: boolean;
    commandPrefix: string;
    syncHistory: boolean;
    phoneNumber: string;
  };
  rules: {
    validGroups: string[];
    cooldownTime: number;
  };
  logger: {
    level: string;
    logDir: string;
  };
};
