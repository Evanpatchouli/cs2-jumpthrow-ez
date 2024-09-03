import * as core from "../core/index.js";
import { concurrentify, getCurrentTimeString, wait } from "../core/utils.js";
import cs2config from "../configs/cs2.config.js";
import logger from "../core/logger.js";
import state from "../state.js";
import chalk from "chalk";

const { keyBinding: cs2 } = cs2config;

const { useKey, KeyUpName, KeyBaseName, getStrokeKey } = core;

/**
 * @feature 根据按下的时间戳差决定 Jiting 的键程
 * @todo 计算公式待优化
 */
export const clickReverseKey = async (key, reverseKey) => {
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
 * @type {import("../types.js").App.JitingHandler}
 */
export const jiting = (stroke, input, toggleKey, switchDurationKey) => {
  return async () => {
    if (stroke?.type !== "keyboard") return;
    toggleKey = toggleKey || "J";
    // 启用或禁用
    if (input === KeyUpName(toggleKey)) {
      state.SET_JITING(!state.useJiting);
    }
    // 切换键程
    if (switchDurationKey && core.keyKeyNames.has(switchDurationKey)) {
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
 * @type {import("../types.js").App.JumpThrowHandler}
 */
export const jumpThrow = (stroke, input, key) => {
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
 * @type {import("../types.js").App.JumpThrowHandler}
 */
export const jumpThrow2 = (stroke, input, key) => {
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
 * @type {import("../types.js").App.ForwardJumpThrowHandler}
 */
export const forwardJumpThrow = (stroke, input, key) => {
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
 * @type {import("../types.js").App.JumpThrowHandler}
 */
export const jumpDoubleThrow = (stroke, input, key) => {
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
 * @type {import("../types.js").App.JumpThrowHandler}
 */
export const forwardJumpDoubleThrow = (stroke, input, key) => {
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
 * @type {import("../types.js").App.JumpThrowHandler}
 */
export const rightJumpThrow = (stroke, input, key) => {
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

