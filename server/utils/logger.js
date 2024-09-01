import chalk from "chalk";

const levels = ["TRACE", "DEBUG", "INFO", "WARN", "ERROR", "CRITICAL"];

const logger = {
  /**
   * @type {"TRACE" | "DEBUG" | "INFO" | "WARN" | "ERROR" | "CRITICAL"}
   */
  level: "INFO",
  levelIndex() {
    return levels.indexOf(logger.level);
  },
  prefix: "[logger]: ",
  debug(message, ...data) {
    if (levels.indexOf(logger.level) <= levels.indexOf("DEBUG")) {
      console.debug(`${chalk.cyan(logger.prefix)}${message}`, ...data);
    }
  },
  info(message, ...data) {
    if (levels.indexOf(logger.level) <= levels.indexOf("INFO")) {
      console.info(`${chalk.blue(logger.prefix)}${message}`, ...data);
    }
  },
  warn(message, ...data) {
    if (levels.indexOf(logger.level) <= levels.indexOf("WARN")) {
      console.warn(`${chalk.yellow(logger.prefix)}${message}`, ...data);
    }
  },
  error(message, ...data) {
    if (levels.indexOf(logger.level) <= levels.indexOf("ERROR")) {
      console.error(`${chalk.red(logger.prefix)}${message}`, ...data);
    }
  },
};

export default logger;
