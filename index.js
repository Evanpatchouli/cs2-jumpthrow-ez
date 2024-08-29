import chalk from "chalk";
import * as os from "os";
os.setPriority(os.constants.priority.PRIORITY_HIGH);
import keys from "./key_codes.json" assert { type: "json" };
import mices from "./mouse_codes.json" assert { type: "json" };
import cs2 from "./cs2-keys.json" assert { type: "json" };
import ni from "node-interception";
import state from "./state.js";
import logger from "./logger.js";
import { concurrentify, getCurrentTimeString, getMSDistance, sequentialify, wait } from "./utils.js";

const keyKeyNames = new Set(Object.keys(keys));
const mouseKeyNames = new Set(Object.keys(mices));

const keyCodeToKeyNameMap = new Map();

Object.keys(keys).forEach((keyName) => {
  // 双向映射方便查找
  keys[keyName].down.forEach((down) => {
    keyCodeToKeyNameMap.set(`${keyName}_down`, `${down.code}-${down.state}`);
    keyCodeToKeyNameMap.set(`${down.code}-${down.state}`, `${keyName}_down`);
  });
  keys[keyName].up.forEach((up) => {
    keyCodeToKeyNameMap.set(`${keyName}_up`, `${up.code}-${up.state}`);
    keyCodeToKeyNameMap.set(`${up.code}-${up.state}`, `${keyName}_up`);
  });
});

const { Interception, FilterKeyState, FilterMouseState } = ni;
const interception = new Interception();

// Enable the capturing of all strokes.
interception.setFilter("keyboard", FilterKeyState.ALL); // 监听键盘输入
// interception.setFilter("mouse", FilterMouseState.ALL); // 监听鼠标输入

const devices = {
  mices: interception.getMice(),
  keyboards: interception.getKeyboards(),
};
const mice = devices.mices[1];
const keyboard = devices.keyboards[1];

const SCANCODE_ESC = null; // ESC: 0x01

async function listen() {
  logger.info("Press any key or move the mouse to generate strokes.");
  logger.info(`Press ${chalk.blueBright("ESC")} to exit and restore back control.`);
  logger.info('【F7】跳投');
  logger.info('【F8】右键跳投');
  logger.info('【F9】前跳投');
  logger.info('【F10】双键跳投');
  logger.info('【F11】前双键跳投');
  logger.info('【F12】Mirage VIP烟');

  state.SET_LISTENING(true);
  state.SET_JITING(true);
  logger.info(`${chalk.yellow("jiting")} is ${chalk.yellow(!state.useJiting ? "disabled" : "enabled")}`);

  while (state.listening) {
    const device = await interception.wait();
    const stroke = device?.receive();

    if (!state.listening || !device || !stroke || (stroke?.type === "keyboard" && stroke.code === SCANCODE_ESC)) break;

    device.send(stroke);
    logger.debug(chalk.yellow(getCurrentTimeString()));
    recordKeyState(stroke);
    let input = null;
    if (stroke?.type === "keyboard") {
      input = getStrokeKey(stroke);
    }
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

  interception.destroy();
  logger.warn(chalk.yellow("Disconnected"));
}

// Start listening for keyboard and mouse strokes.
listen().catch(logger.error);

/**
 * 获取按下的键名
 * @param {import("node-interception").KeyboardStroke} stroke - 键盘或鼠标事件
 * @returns {string|undefined} - 键名
 */
const getStrokeKey = (stroke) => {
  return keyCodeToKeyNameMap.get(`${stroke.code}-${stroke.state}`);
};

const KeyDownName = (key) => `${key}_down`;
const KeyUpName = (key) => `${key}_up`;
const KeyBaseName = (key) => {
  if (key) {
    return key.replace(/_(down|up)$/, "")
  }
  return null;
}

/**
 * @type {import("./types").App.ClickKey}
 */
const clickKey = async (device, key) => {
  const funcs1 = keys[key].down.map((stroke) => () => {
    device.send({
      type: "keyboard",
      code: stroke.code,
      state: stroke.state,
      information: 0,
    });
  });
  await sequentialify(...funcs1);
  const funcs2 = keys[key].up.map((stroke) => () => {
    device.send({
      type: "keyboard",
      code: stroke.code,
      state: stroke.state,
      information: 0,
    });
  });
  await sequentialify(...funcs2);
};

/**
 * @type {import("./types").App.PressKey}
 */
const pressKey = async (device, key, duration) => {
  const funcs1 = keys[key].down.map((stroke) => () => {
    device.send({
      type: "keyboard",
      code: stroke.code,
      state: stroke.state,
      information: 0,
    });
  });
  await sequentialify(...funcs1);
  await wait(duration);
  const funcs2 = keys[key].up.map((stroke) => () => {
    device.send({
      type: "keyboard",
      code: stroke.code,
      state: stroke.state,
      information: 0,
    });
  });
  await sequentialify(...funcs2);
};

/**
 * @type {import("./types").App.MiceClick}
 */
const miceClick = async (device, key) => {
  const strokes = mices[key];
  const funcs = strokes.map((stroke) => {
    return () => {
      device.send(stroke);
    };
  });
  await sequentialify(...funcs);
};

/**
 * @type {import("./types").App.MicePress}
 */
const micePress = async (device, key, duration) => {
  const strokes = mices[key];
  const funcs = strokes.map((stroke, i) => {
    return async () => {
      if (i > 0) {
        await wait(duration);
      }
      device.send(stroke);
    };
  });
  await sequentialify(...funcs);
};

/**
 * @type {import("./types").App.UseKey}
 */
const useKey = async (key, dr, mode) => {
  if (keyKeyNames.has(key)) {
    switch (mode) {
      case "down":
        await downKey(keyboard, key);
        break;
      case "up":
        await upKey(keyboard, key);
        break;
      default:
        await (dr ? pressKey(keyboard, key, dr) : clickKey(keyboard, key));
        break;
    }
    return Promise.resolve();
  }
  if (mouseKeyNames.has(key)) {
    return await (dr ? micePress(mice, key, dr) : miceClick(mice, key));
  }
  logger.error(`Unsupported key: ${key}`);
  return Promise.resolve();
};

const downKey = async (device, key) => {
  const funcs1 = keys[key].down.map((stroke) => () => {
    device.send({
      type: "keyboard",
      code: stroke.code,
      state: stroke.state,
      information: 0,
    });
  });
  await sequentialify(...funcs1);
  // 持续发送按下指令，直到 state.activeKeys 中没有相应 key
  // while (state.isKeyActive(key)) {
  //   await sequentialify(...funcs1);
  //   await wait(10); // 添加一个小的延迟，防止过度占用 CPU
  // }
};

const upKey = async (device, key) => {
  const funcs2 = keys[key].up.map((stroke) => () => {
    device.send({
      type: "keyboard",
      code: stroke.code,
      state: stroke.state,
      information: 0,
    });
  });
  await sequentialify(...funcs2);
};

// @todo 未来实现检测手动层面鼠标状态
const recordKeyState = (stroke) => {
  if (stroke.type === "keyboard") {
    const keyKeyNamesArray = Array.from(keyKeyNames);

    const pressedKey = keyKeyNamesArray.find((name) => {
      const key = keys[name];
      return key && key.down.some((down) => down.code === stroke.code && down.state === stroke.state);
    });
    if (pressedKey) {
      state.setActiveKey(pressedKey);
    } else {
      const unpressedKey = keyKeyNamesArray.find((name) => {
        const key = keys[name];
        return key && key.up.some((up) => up.code === stroke.code && up.state === stroke.state);
      });

      if (unpressedKey) {
        state.removeActiveKey(unpressedKey);
      }
    }
  } else if (stroke.type === "mouse") {
    // @todo 实现鼠标事件的处理
  }
};

/**
 * @feature 根据按下的时间戳差决定 Jiting 的键程
 */
const clickReverseKey = async (key, reverseKey) => {
  await useKey(reverseKey, null, 'down');
  const keyState = state.getKeyState(key);
  const now = performance.now();
  const duration = getMSDistance(keyState?.firstActive, performance.now());
  // logger.info(chalk.yellow(`Duration: ${duration}`));
  await wait(duration || state.JTDuration());
  if (!state.isKeyActive(reverseKey) && !state.isKeyActive(key)) {
    await useKey(reverseKey, null, 'up');
  }
}

/** Single Key Stop Emergency
 * @type {import("./types").App.JitingHandler}
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
      if (reverseKey && !state.isKeyActive(reverseKey) && !state.isKeyActive(input)) {
        // press about 80ms is necessary, beacuse the game will ignore the key if it is too short  按压约state.JTDuration 是必要的，否则键程太短没有效果
        await clickReverseKey(baseKey, reverseKey);
        execed = true;
      }
    }
    if (input?.includes("down")) {
      if (reverseKey && !state.isKeyActive(reverseKey)) { // 如果反向键没有被手动按下，有可能处于被程序自动按下的期间，理应松开不影响移动
        await useKey(reverseKey, null, 'up');
        execed = true;
      }
    }

    if (execed) {
      logger.debug(chalk.yellow(getCurrentTimeString()));
    }
  };
};

/**
 * @type {import("./types").App.JumpThrowHandler}
 */
const jumpThrow = (stroke, input, key) => {
  return () => {
    if (stroke?.type !== "keyboard") return;
    if (input === KeyUpName(key || "F7")) {
      concurrentify(
        () => {
          useKey(cs2.attack1, state.pressDuration);
        },
        () => {
          useKey(cs2.jump);
        }
      );
    }
  };
};

/**
 * @type {import("./types").App.JumpThrowHandler}
 */
const jumpThrow2 = (stroke, input, key) => {
  return () => {
    if (stroke?.type !== "keyboard") return;
    if (input === KeyUpName(key || "F8")) {
      concurrentify(
        () => {
          useKey(cs2.attack2, state.pressDuration);
        },
        () => {
          useKey(cs2.jump);
        }
      );
    }
  };
};

/**
 * @type {import("./types").App.ForwardJumpThrowHandler}
 */
const forwardJumpThrow = (stroke, input, key) => {
  return () => {
    if (stroke?.type !== "keyboard") return;
    if (input === KeyUpName(key || "F9")) {
      concurrentify(
        () => {
          useKey(cs2.forward, state.pressDuration, "clickOrPress");
        },
        () => {
          useKey(cs2.attack1, state.pressDuration);
        },
        () => {
          useKey(cs2.jump);
        }
      );
    }
  };
};

/**
 * @type {import("./types").App.JumpThrowHandler}
 */
const jumpDoubleThrow = (stroke, input, key) => {
  return () => {
    if (stroke?.type !== "keyboard") return;
    if (input === KeyUpName(key || "F10")) {
      concurrentify(
        () => {
          useKey(cs2.attack1, state.pressDuration);
        },
        () => {
          useKey(cs2.attack2, state.pressDuration);
        },
        () => {
          useKey(cs2.jump);
        }
      );
    }
  };
};

/**
 * @type {import("./types").App.JumpThrowHandler}
 */
const forwardJumpDoubleThrow = (stroke, input, key) => {
  return () => {
    if (stroke?.type !== "keyboard") return;
    if (input === KeyUpName(key || "F11")) {
      concurrentify(
        () => {
          useKey(cs2.forward, state.pressDuration, "clickOrPress");
        },
        () => {
          useKey(cs2.attack1, state.pressDuration);
        },
        () => {
          useKey(cs2.attack2, state.pressDuration);
        },
        () => {
          useKey(cs2.jump);
        }
      );
    }
  };
};

/**
 * @type {import("./types").App.JumpThrowHandler}
 */
const rightJumpThrow = (stroke, input, key) => {
  return async () => {
    if (stroke?.type !== "keyboard") return;
    if (input === KeyUpName(key || "F12")) {
      useKey(cs2.right, 400, "clickOrPress");
      await wait(100);
      concurrentify(
        () => {
          useKey(cs2.attack1, state.pressDuration);
        },
        () => {
          useKey(cs2.jump);
        }
      );
    }
  };
};
