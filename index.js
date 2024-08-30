import chalk from "chalk";
import cs2 from "./cs2-keys.json" assert { type: "json" };
import state from "./state.js";
import { concurrentify, getCurrentTimeString, getMSDistance, sequentialify, wait } from "./core/utils.js";
import * as core from "./core/index.js";
import logger from "./core/logger.js";

const { useKey, KeyUpName, KeyBaseName, getStrokeKey } = core;

function main() {
  logger.info("Press any key or move the mouse to generate strokes.");
  logger.info(`Press ${chalk.blueBright("ESC")} to exit and restore back control.`);
  logger.info('【F7】跳投');
  logger.info('【F8】右键跳投');
  logger.info('【F9】前跳投');
  logger.info('【F10】双键跳投');
  logger.info('【F11】前双键跳投');
  logger.info('【F12】Mirage VIP 慢烟');

  state.SET_JITING(true);
  state.SET_USE_JT_DURATION_CALC(true);
  logger.info(`${chalk.yellow("Stop Emergency")} is ${chalk.yellow(!state.useJiting ? "disabled" : "enabled")}`);

  core.listen('keyboard', {
    before: () => { },
    after: async (stroke, input, baseKey, device) => {
      concurrentify(
        // Add your side-effect handler below  往下添加附作用事件
        jiting(stroke, input, "J"), // automatic-emergency-stop  jiting(stroke, input, "J", "K"), set the fourth parameter to switch the duration key.
        jumpThrow(stroke, input, "F7"), // jump + attack1
        jumpThrow2(stroke, input, "F8"), // jump + attack2
        forwardJumpThrow(stroke, input, "F9"), // forward + jump + attack1
        jumpDoubleThrow(stroke, input, "F10"), // jump + attack1 + attack2
        forwardJumpDoubleThrow(stroke, input, "F11"), // forward + jump + attack1 + attack2
        rightJumpThrow(stroke, input, "F12") // right + wait(200) + jump + attack1
      );
    }
  }).catch((error) => logger.error(error));
}

// Start listening for keyboard and mouse strokes.w
main();

/**
 * @feature 根据按下的时间戳差决定 Jiting 的键程
 * @todo 计算公式待优化
 */
const clickReverseKey = async (key, reverseKey) => {
  const keyState = core.getKeyState(key);
  let duration = state.JTDuration();
  if (state.useJTDurationCalc) {
    duration = state.calcJTDuration(keyState?.firstActive);
  }
  await useKey(reverseKey, { mode: 'down' });
  // logger.info(chalk.yellow(`Duration: ${duration}`));
  await wait(duration);
  if (!core.isKeyActive(reverseKey) && !core.isKeyActive(key)) {
    await useKey(reverseKey, { mode: 'up' });
  }
}

/** ### Single Key Stop Emergency
 * ---
 * - 关于急停键程，建议比理论最佳键程稍短。
 * - 误差的存在，若实际输出的键程比实际最佳略长可能会造成一点反向位移。
 * - 宁可停的慢一点，让丝滑的急停，给自己一点瞄准容错时间，而不是瞬间成为定靶子
 * - 由于自动反向按键，**跳跃时**建议**暂时禁用**，否则跳不远
 * @type {import("./types.js").App.JitingHandler}
 */
const jiting = (stroke, input, toggleKey, switchDurationKey) => {
  return async () => {
    if (stroke?.type !== "keyboard") return;
    toggleKey = toggleKey || "J";
    // 启用或禁用
    if (input === KeyUpName(toggleKey)) {
      state.SET_JITING(!state.useJiting);
    }
    // 切换键程
    if (switchDurationKey && keyKeyNames.has(switchDurationKey)) {
      if (input === KeyUpName(switchDurationKey)) {
        state.switchJTDuration();
      }
    }
    if (state.useJiting === false) return;
    let execed = false;
    // await wait(10);
    const dekeyMap = {
      [cs2.forward]: cs2.back,
      [cs2.left]: cs2.right,
      [cs2.back]: cs2.forward,
      [cs2.right]: cs2.left,
    };
    const baseKey = KeyBaseName(input);
    const reverseKey = dekeyMap[baseKey];
    if (input?.includes("up")) {
      if (reverseKey && core.noneKeysActive([cs2.forward, cs2.back, cs2.left, cs2.right])) {  // 四键或双键判定 core.noneKeysActive[baseKey, reverseKey]  两个键都没有被按下
        // press about 80ms is necessary, beacuse the game will ignore the key if it is too short  按压约state.JTDuration 是必要的，否则键程太短没有效果
        await clickReverseKey(baseKey, reverseKey);
        execed = true;
      }
    }
    if (input?.includes("down")) {
      if (reverseKey && !core.isKeyActive(reverseKey)) { // 如果反向键没有被手动按下，有可能处于被程序自动按下的期间，理应松开不影响移动w
        await useKey(reverseKey, { mode: 'up' });
        execed = true;
      }
    }

    if (execed) {
      logger.debug(chalk.yellow(getCurrentTimeString()));
    }
  };
};

/**
 * @type {import("./types.js").App.JumpThrowHandler}
 */
const jumpThrow = (stroke, input, key) => {
  return () => {
    if (stroke?.type !== "keyboard") return;
    if (input === KeyUpName(key || "F7")) {
      concurrentify(
        () => {
          useKey(cs2.attack1, { pressDuration: state.pressDuration });
        },
        () => {
          useKey(cs2.jump);
        }
      );
    }
  };
};

/**
 * @type {import("./types.js").App.JumpThrowHandler}
 */
const jumpThrow2 = (stroke, input, key) => {
  return () => {
    if (stroke?.type !== "keyboard") return;
    if (input === KeyUpName(key || "F8")) {
      concurrentify(
        () => {
          useKey(cs2.attack2, { pressDuration: state.pressDuration });
        },
        () => {
          useKey(cs2.jump);
        }
      );
    }
  };
};

/**
 * @type {import("./types.js").App.ForwardJumpThrowHandler}
 */
const forwardJumpThrow = (stroke, input, key) => {
  return () => {
    if (stroke?.type !== "keyboard") return;
    if (input === KeyUpName(key || "F9")) {
      concurrentify(
        () => {
          useKey(cs2.forward, {
            pressDuration: state.pressDuration,
            mode: 'clickOrPress',
          });
        },
        () => {
          useKey(cs2.attack1, {
            pressDuration: state.pressDuration,
          });
        },
        () => {
          useKey(cs2.jump);
        }
      );
    }
  };
};

/**
 * @type {import("./types.js").App.JumpThrowHandler}
 */
const jumpDoubleThrow = (stroke, input, key) => {
  return () => {
    if (stroke?.type !== "keyboard") return;
    if (input === KeyUpName(key || "F10")) {
      concurrentify(
        () => {
          useKey(cs2.attack1, {
            pressDuration: state.pressDuration,
          });
        },
        () => {
          useKey(cs2.attack2, {
            pressDuration: state.pressDuration,
          });
        },
        () => {
          useKey(cs2.jump);
        }
      );
    }
  };
};

/**
 * @type {import("./types.js").App.JumpThrowHandler}
 */
const forwardJumpDoubleThrow = (stroke, input, key) => {
  return () => {
    if (stroke?.type !== "keyboard") return;
    if (input === KeyUpName(key || "F11")) {
      concurrentify(
        () => {
          useKey(cs2.forward, {
            pressDuration: state.pressDuration,
            mode: 'clickOrPress',
          });
        },
        () => {
          useKey(cs2.attack1, {
            pressDuration: state.pressDuration,
          });
        },
        () => {
          useKey(cs2.attack2, {
            pressDuration: state.pressDuration,
          });
        },
        () => {
          useKey(cs2.jump);
        }
      );
    }
  };
};

/**
 * @type {import("./types.js").App.JumpThrowHandler}
 */
const rightJumpThrow = (stroke, input, key) => {
  return async () => {
    if (stroke?.type !== "keyboard") return;
    if (input === KeyUpName(key || "F12")) {
      useKey(cs2.right, {
        pressDuration: 400,
        mode: 'clickOrPress'
      });
      await wait(100);
      concurrentify(
        () => {
          useKey(cs2.attack1, {
            pressDuration: state.pressDuration,
          });
        },
        () => {
          useKey(cs2.jump);
        }
      );
    }
  };
};
