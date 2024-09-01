import * as os from "os";
import chalk from "chalk";
import keys from "./key_codes.json" assert { type: "json" };
import mices from "./mouse_codes.json" assert { type: "json" };
import ni from "node-interception";
import state from "./state.js";
import logger from "./logger.js";
import { sequentialify, wait } from "./utils.js";

const {
  listening,
  isKeyActive,
  areKeysActive,
  getKeyState,
  noneKeysActive,
  someKeysActive,
} = state;

const onListen = (callback) => {
  state.onListen = callback;
}

const offListen = (callback) => {
  state.offListen = callback;
}

/**
 * 
 * @param {boolean} value 
 */
const setListening = (value) => {
  state.SET_LISTENING(value);
  if (value) {
    state.onListen?.();
  } else {
    state.offListen?.();
  }
}

const isListening = () => {
  return state.listening;
}

export {
  isListening,
  setListening,
  isKeyActive,
  areKeysActive,
  getKeyState,
  noneKeysActive,
  someKeysActive,
  onListen,
  offListen
}

os.setPriority(os.constants.priority.PRIORITY_HIGH);

export const keyKeyNames = new Set(Object.keys(keys));
export const mouseKeyNames = new Set(Object.keys(mices));

export const keyCodeToKeyNameMap = new Map();

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
export const interception = new Interception();

/**
 * Destroy the intercaeption instance and remove all listeners.
 * 关闭拦截器实例并移除所有监听器
 */
export function destroy() {
  interception?.destroy();
}

export function listenKeyboard() {
  interception.setFilter("keyboard", FilterKeyState.ALL); // 监听键盘输入
}
export function listenMouse() {
  interception.setFilter("mouse", FilterMouseState.ALL); // 监听键盘输入
}

export const devices = {
  mices: interception.getMice(),
  keyboards: interception.getKeyboards(),
};
export const mice = devices.mices[1];
export const keyboard = devices.keyboards[1];

/**
 * 获取按下的键名
 * @param {import("node-interception").KeyboardStroke} stroke - 键盘或鼠标事件
 * @returns {string|undefined} - 键名
 */
export const getStrokeKey = (stroke) => {
  return keyCodeToKeyNameMap.get(`${stroke.code}-${stroke.state}`);
};

/** 将 KeyBase 转为 KeyDown */
export const KeyDownName = (key) => `${key}_down`;
/** 将 KeyBase 转为 KeyUp */
export const KeyUpName = (key) => `${key}_up`;
/** 从 StrokeKey 提取 KeyBase */
export const KeyBaseName = (key) => {
  if (key) {
    return key.replace(/_(down|up)$/, "")
  }
  return null;
}


/**
 * @type {import("./types").Core.ClickKey}
 */
export const clickKey = async (device, key) => {
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
 * @type {import("./types").Core.PressKey}
 */
export const pressKey = async (device, key, duration) => {
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
 * @type {import("./types").Core.MiceClick}
 */
export const miceClick = async (device, key) => {
  const strokes = mices[key];
  const funcs = strokes.map((stroke) => {
    return () => {
      device.send(stroke);
    };
  });
  await sequentialify(...funcs);
};

/**
 * @type {import("./types").Core.MicePress}
 */
export const micePress = async (device, key, duration) => {
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
 * @type {import("./types").Core.UseKey}
 */
export const useKey = async (key, {
  pressDuration: dr = void 0,
  mode = void 0,
  device = void 0
} = {
    pressDuration: void 0,
    mode: void 0,
    device: void 0
  }) => {
  if (keyKeyNames.has(key)) {
    switch (mode) {
      case "down":
        await downKey(device || keyboard, key);
        break;
      case "up":
        await upKey(device || keyboard, key);
        break;
      default:
        await (dr ? pressKey(device || keyboard, key, dr) : clickKey(device || keyboard, key));
        break;
    }
    return Promise.resolve();
  }
  if (mouseKeyNames.has(key)) {
    return await (dr ? micePress(device || mice, key, dr) : miceClick(device || mice, key));
  }
  logger.error(`Unsupported key: ${key}`);
  return Promise.resolve();
};

/**
 * @type {import("./types").Core.DownKey}
 */
export const downKey = async (device, key) => {
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

/**
 * @type {import("./types").Core.UpKey}
 */
export const upKey = async (device, key) => {
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
 * @todo 未来实现检测手动层面鼠标状态
 */
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
    // @todo 实现鼠标事件的处理wsswws
  }
};

/** @type {Map<String, Function>()} */
const handlers = new Map();

const dispatch = (keys) => {
  const key = JSON.stringify([...keys].sort());
  if (handlers.has(key)) {
    handlers.get(key)?.();
  }
}

const dispatchAll = () => {
  handlers.forEach((handler, keyString) => {
    const keys = JSON.parse(keyString);
    state.areKeysActive(keys) && handler();
  });
}

/**
 * @type {import("./types").Core['subscribe']}
 */
export const subscribe = (keys, handler) => {
  // 对 keys 数组进行排序
  const sortedKeys = [...keys].sort();
  // 将排序后的 keys 数组转换为字符串，用作 Map 的键
  const keyString = JSON.stringify(sortedKeys);
  handlers.set(keyString, handler);
}

/**
 * @type {import("./types").Core['listen']}
 */
export const listen = async (listened, handler) => {
  switch (listened) {
    case 'keyboard':
      listenKeyboard();
      break;
    case "mouse":
      listenMouse();
      break;
    case "all":
      listenKeyboard();
      listenMouse();
      break;
    default:
      throw new Error(
        `Unset which device to listen: ${chalk.red(listened)}. 
          The ${chalk.yellow("first")} argument of listen() should be ${chalk.yellowBright("'keyboard', 'mouse' or 'all'")}.`
      );
  }
  setListening(true);
  while (true) {
    const device = await interception.wait();
    const stroke = device?.receive();

    let input = null;
    let baseKey = null;
    if (stroke?.type === "keyboard") {
      input = getStrokeKey(stroke);
      baseKey = KeyBaseName(input);
    }

    if (!device || !stroke) {
      break;
    }

    state.listening && handler?.before && await handler.before(stroke, input, baseKey, device);
    device.send(stroke);
    recordKeyState(stroke);

    if (!state.listening) {
      continue;
    }

    dispatchAll();
    handler?.after?.(stroke, input, KeyBaseName(input), device);
  }
  logger.info("Received stop signal, stop intercepting...");
  destroy();
  logger.warn(chalk.yellow("Disconnected"));
}
