import * as os from "os";
import chalk from "chalk";
import keys from "./key_codes.json" assert { type: "json" };
import mices from "./mouse_codes.json" assert { type: "json" };
import ni from "node-interception";
import state from "./state.js";
import logger from "./logger.js";
import { sequentialify, wait } from "./utils.js";
import emitter, { onListen, offListen, onDestroy } from "./events.js";

const {
  isKeyActive,
  areKeysActive,
  getKeyState,
  noneKeysActive,
  someKeysActive,
} = state;

/**
 * 
 * @param {boolean} value 
 */
const setListening = (value) => {
  if (value) {
    emitter.emit('start');
  } else {
    emitter.emit('stop');
  }
}

/**
 * @type {import("./types".Core['start'])}
 */
const start = () => {
  emitter.emit('start');
}
/**
 * @type {import("./types".Core['stop'])}
 */
const stop = () => {
  emitter.emit('stop');
}
/**
 * @type {import("./types".Core['destroy'])}
 */
const destroy = () => {
  emitter.emit('destroy');
}
/**
 * @type {import("./types".Core['isListenning'])}
 */
const isListening = () => {
  return state.listening;
}

export {
  interception,
  isListening,
  setListening,
  isKeyActive,
  areKeysActive,
  getKeyState,
  noneKeysActive,
  someKeysActive,
  /** @type {import("./types").Core['onListen']} */
  onListen,
  /** @type {import("./types").Core['offListen']} */
  offListen,
  /** @type {import("./types").Core['onDestroy']} */
  onDestroy,
  start,
  stop,
  destroy,
  listenKeyboard,
  listenMouse,
}

os.setPriority(os.constants.priority.PRIORITY_HIGH);

export const keyKeyNames = new Set(Object.keys(keys));
const clickMiceActions = ["MOUSE1", "MOUSE2", "MOUSE3", "MOUSE4", "MOUSE5"];
export const mouseClickKeyNames = new Set(Object.keys(clickMiceActions));

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
 * @param {import("node-interception").MouseStroke} stroke - 键盘或鼠标事件
 * @returns {string|undefined} - 键名
 */
export const getStrokeKey = (stroke) => {
  if ("keyboard" === stroke?.type) {
    return keyCodeToKeyNameMap.get(`${stroke.code}-${stroke.state}`);
  }
  switch (stroke?.state) {
    case 0: {
      return "MOUSEMOVE";
    }
    case 1: { // MOUSE1_DOWN
      return "MOUSE1_down";
    }
    case 2: { // MOUSE1_UP
      return "MOUSE1_up";
    }
    case 4: { // MOUSE2_DOWN
      return "MOUSE2_down";
    }
    case 8: { // MOUSE2_UP
      return "MOUSE2_up";
    }
    case 16: { // MOUSE3_DOWN
      return "MOUSE3_down";
    }
    case 32: { // MOUSE3_UP
      return "MOUSE3_up";
    }
    case 64: { // MOUSE4_DOWN
      return "MOUSE4_down";
    }
    case 128: { // MOUSE4_UP
      return "MOUSE4_up";
    }
    case 256: { // MOUSE5_DOWN
      return "MOUSE5_down";
    }
    case 512: { // MOUSE5_UP
      return "MOUSE5_up";
    }
    case 1024: { // MWHEEL
      if (stroke.rolling > 0) {
        return "MWHEEL_UP";
      }
      return "MWHEEL_DOWN";
    }
    default: {
      return null;
    }
  }

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
    device?.send({
      type: "keyboard",
      code: stroke.code,
      state: stroke.state,
      information: 0,
    });
  });
  await sequentialify(...funcs1);
  const funcs2 = keys[key].up.map((stroke) => () => {
    device?.send({
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
    device?.send({
      type: "keyboard",
      code: stroke.code,
      state: stroke.state,
      information: 0,
    });
  });
  await sequentialify(...funcs1);
  await wait(duration);
  const funcs2 = keys[key].up.map((stroke) => () => {
    device?.send({
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
      device?.send(stroke);
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
      device?.send(stroke);
    };
  });
  await sequentialify(...funcs);
};

const defaultRollingDistance = 120; // mices['MWHEELUP'][0].rolling

/**
 * @type {import("./types").Core.MiceMove}
 */
export const miceMove = (device, delta) => {
  const stroke = mices['MOUSEMOVE'][0];
  stroke.x = delta.x || 0;
  stroke.y = delta.y || 0;
  device?.send(stroke);
}

/**
 * @type {import("./types").Core.MiceRoll}
 */
export const miceRoll = (device, rolling) => {
  const stroke = mices['MWHEELUP'][0];
  stroke.rolling = rolling ?? 0;
  device?.send(stroke);
}

/**
 * @type {import("./types").Core.MiceWheelDown}
 */
export const miceWheelDown = (device, rolling) => {
  miceRoll(device, -Math.abs(rolling ?? defaultRollingDistance));
}

/**
 * @type {import("./types").Core.MiceWheelUp}
 */
export const miceWheelUp = (device, rolling) => {
  miceRoll(device, Math.abs(rolling ?? defaultRollingDistance));
}

/**
 * @type {import("./types").Core.UseKey}
 */
export const useKey = async (key, {
  pressDuration: dr = void 0,
  mode = void 0,
  device = void 0,
  rolling,
  x,
  y,
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
  if (mouseClickKeyNames.has(key)) {
    return await (dr ? micePress(device || mice, key, dr) : miceClick(device || mice, key));
  }
  switch (key) {
    case "MOUSEMOVE": {
      return miceMove(device || mice, { x, y });
    }
    case "MWHEELDOWN": {
      return miceWheelDown(device || mice, rolling);
    }
    case "MWHEELUP": {
      return miceWheelUp(device || mice, rolling);
    }
  }
  logger.error(`Unsupported key: ${key}`);
  return Promise.resolve();
};

/**
 * @type {import("./types").Core.DownKey}
 */
export const downKey = async (device, key) => {
  const funcs1 = keys[key].down.map((stroke) => () => {
    device?.send({
      type: "keyboard",
      code: stroke.code,
      state: stroke.state,
      information: 0,
    });
  });
  await sequentialify(...funcs1);
};

/**
 * @type {import("./types").Core.UpKey}
 */
export const upKey = async (device, key) => {
  const funcs2 = keys[key].up.map((stroke) => () => {
    device?.send({
      type: "keyboard",
      code: stroke.code,
      state: stroke.state,
      information: 0,
    });
  });
  await sequentialify(...funcs2);
};

/**
 * 清除鼠标滚动和移动状态记录
 */
const clearMouseState = () => {
  state.clearActiveKey('MWHEELUP');
  state.clearActiveKey('MWHEELDOWN');
  state.clearActiveKey('MOUSEMOVE');
}

/**
 * @param {import("node-interception").Stroke} stroke
 * @param {string} input
 * @param {string} base
 */
const recordKeyState = (stroke, input, base) => {
  const strokeKey = getStrokeKey(stroke);
  const baseKey = KeyBaseName(strokeKey);
  if (stroke.type === "keyboard") {
    if (strokeKey.endsWith('_down')) {
      state.setActiveKey(baseKey);
    } else if (strokeKey.endsWith('_up')) {
      state.removeActiveKey(baseKey);
    }
  } else if (stroke.type === "mouse") {
    if (['MWHEELDOWN', 'MWHEELUP', 'MOUSEMOVE'].includes(baseKey)) {
      return state.setActiveKey(baseKey);
    }
    if (strokeKey.endsWith('_down')) {
      state.setActiveKey(baseKey);
    } else if (strokeKey.endsWith('_up')) {
      state.removeActiveKey(baseKey);
    }
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
    input = getStrokeKey(stroke);
    baseKey = KeyBaseName(input);

    if (!device || !stroke) {
      break;
    }

    clearMouseState();
    state.listening && handler?.before && await handler.before(stroke, input, baseKey, device);
    device?.send(stroke);
    recordKeyState(stroke);

    if (!state.listening) {
      continue;
    }

    dispatchAll();
    handler?.after?.(stroke, input, KeyBaseName(input), device);
  }
  destroy();
  logger.warn(chalk.yellow("Disconnected"));
}

export const emit = (event) => {
  emitter.emit(event);
}