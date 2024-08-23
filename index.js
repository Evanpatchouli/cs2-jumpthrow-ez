import chalk from "chalk";
import * as os from "os";
os.setPriority(os.constants.priority.PRIORITY_HIGH);
import keys from "./key_codes.json" assert { type: "json" };
import mices from "./mouse_codes.json" assert { type: "json" };
import cs2 from "./cs2-keys.json" assert { type: "json" };
import ni from "node-interception";
import state from "./state.js";
import logger from "./logger.js";
import { concurrentify, getCurrentTimeString, sequentialify, wait } from "./utils.js";

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
interception.setFilter("keyboard", FilterKeyState.ALL);
interception.setFilter("mouse", FilterMouseState.ALL);

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
  // 持续发送按下指令，直到 state.activeKeys 中没有相应 key
  while (state.isKeyActive(key)) {
    await sequentialify(...funcs1);
    await wait(10); // 添加一个小的延迟，防止过度占用 CPU
  }
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
      state.pushActiveKeys(pressedKey);
    } else {
      const unpressedKey = keyKeyNamesArray.find((name) => {
        const key = keys[name];
        return key && key.up.some((up) => up.code === stroke.code && up.state === stroke.state);
      });

      if (unpressedKey) {
        state.removeActiveKeys(unpressedKey);
      }
    }
  } else if (stroke.type === "mouse") {
    // @todo 实现鼠标事件的处理
  }
};

/** Not work well when repeeking, so you should disable it when you repeek.
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
    let execed = true;
    // await wait(10);
    const dekeyMap = {
      [KeyUpName(cs2.forward)]: cs2.back,
      [KeyUpName(cs2.left)]: cs2.right,
      [KeyUpName(cs2.back)]: cs2.forward,
      [KeyUpName(cs2.right)]: cs2.left,
    };

    const reverseKey = dekeyMap[input];
    if (reverseKey && !state.isKeyActive(reverseKey)) {
      // press about 80ms is necessary, beacuse the game will ignore the key if it is too short  按压约state.JTDuration 是必要的，否则键程太短没有效果
      await useKey(reverseKey, state.JTDuration());
    } else {
      execed = false;
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
