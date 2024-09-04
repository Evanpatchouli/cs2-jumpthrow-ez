// import * as fs from "fs";
import chalk from "chalk";
import * as os from "os";
os.setPriority(os.constants.priority.PRIORITY_HIGH);
import ni from "node-interception";
import state from "./core/state.js";
import logger from "./core/logger.js";
import { concurrentify } from "./core/utils.js";

const { Interception, FilterKeyState, FilterMouseState } = ni;
const interception = new Interception();

// Enable the capturing of all strokes.
interception.setFilter("keyboard", FilterKeyState.ALL);
interception.setFilter('mouse', FilterMouseState.ALL);

const SCANCODE_ESC = 0x01;

async function listen() {
  logger.info("Press any key or move the mouse to generate strokes.");
  logger.info(`Press ${chalk.blueBright("ESC")} to exit and restore back control.`);

  state.SET_LISTENING(true);

  while (state.listening) {
    const device = await interception.wait();
    const stroke = device?.receive();

    if (!device || !stroke || (stroke?.type === "keyboard" && stroke.code === SCANCODE_ESC)) break;
    device.send(stroke);
    concurrentify(
      () => {
        if (stroke.type === 'mouse')
          console.log(stroke);
      }
      // Add your handler below  往下添加附加事件
    );
  }

  interception.destroy();
  logger.warn(chalk.yellow("Disconnected"));
}

// Start listening for keyboard and mouse strokes.
listen().catch(logger.error);
