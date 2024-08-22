import chalk from "chalk";

const levels = ["TRACE", "DEBUG", "INFO", "WARN", "ERROR", "CRITICAL"];

const logger = {
  /**
   * @type {"TRACE" | "DEBUG" | "INFO" | "WARN" | "ERROR" | "CRITICAL"}
   */
  level: "INFO",
  prefix: "[logger]: ",
  debug(message, ...data) {
    if (levels.indexOf(this.level) <= levels.indexOf("DEBUG")) {
      console.debug(`${chalk.cyan(this.prefix)}${message}`, ...data);
    }
  },
  info(message, ...data) {
    if (levels.indexOf(this.level) <= levels.indexOf("INFO")) {
      console.info(`${chalk.blue(this.prefix)}${message}`, ...data);
    }
  },
  warn(message, ...data) {
    if (levels.indexOf(this.level) <= levels.indexOf("WARN")) {
      console.warn(`${chalk.yellow(this.prefix)}${message}`, ...data);
    }
  },
  error(message, ...data) {
    if (levels.indexOf(this.level) <= levels.indexOf("ERROR")) {
      console.error(`${chalk.red(this.prefix)}${message}`, ...data);
    }
  },
};

export default logger;
