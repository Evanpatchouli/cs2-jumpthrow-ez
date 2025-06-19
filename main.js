import chalk from "chalk";
import state from "./state.js";
import { concurrentify } from "./core/utils.js";
import * as core from "./core/index.js";
import logger from "./core/logger.js";
import {
  jumpThrow,
  jumpThrow2,
  forwardJumpThrow,
  jumpDoubleThrow,
  forwardJumpDoubleThrow,
  rightJumpThrow,
} from "./handlers/index.js";

/**
 * 
 * @param {{onListen: VoidFunction; offListen: VoidFunction; socket: import('socket.io').Socket}} options 
 */
function main(options) {
  logger.info("Press any key or move the mouse to generate strokes.");
  logger.info(`Press ${chalk.blueBright("ESC")} to exit and restore back control.`);
  logger.info("【F7】跳投");
  logger.info("【F8】右键跳投");
  logger.info("【F9】前跳投");
  logger.info("【F10】双键跳投");
  logger.info("【F11】前双键跳投");
  logger.info("【F12】Mirage VIP 慢烟");

  core.onListen(options?.onListen);
  core.offListen(options?.offListen);

  core.listen('all', {
    before: () => { },
    after: async (stroke, input, baseKey, device) => {
      concurrentify(
        // Add your side-effect handler below  往下添加附作用事件
        jumpThrow(stroke, input, "F7"), // jump + attack1
        jumpThrow2(stroke, input, "F8"), // jump + attack2
        forwardJumpThrow(stroke, input, "F9"), // forward + jump + attack1
        jumpDoubleThrow(stroke, input, "F10"), // jump + attack1 + attack2
        forwardJumpDoubleThrow(stroke, input, "F11"), // forward + jump + attack1 + attack2
        rightJumpThrow(stroke, input, "F12"), // right + wait(200) + jump + attack1
      );
    },
  }).catch((error) => logger.error(error));
}

process.on('SIGINT', () => {
  console.log('Received SIGINT. Exiting...');
  process.exit(0);
});

// 捕获 SIGTERM 信号 (例如 kill 命令)
process.on('SIGTERM', () => {
  console.log('Received SIGTERM. Exiting...');
  process.exit(0);
});

// Start listening for keyboard and mouse strokes.w
export default main;
