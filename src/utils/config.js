import yaml from "js-yaml";
import { readFileSync } from "fs";
import { logError } from "#utils/logs";

/** @type {import("#types/config").Config} */
export let config = {};

try {
  const configFile = readFileSync("config.yaml", "utf8");
  config = yaml.load(configFile);
} catch (err) {
  console.error(logError("Error loading config file"));
}
