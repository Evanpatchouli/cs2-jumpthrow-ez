import cs2config from "../configs/cs2.config.js";
const { keyBinding: cs2 } = cs2config;
import { areKeysActive, getKeyState, KeyDownName, KeyUpName, useKey } from "../core/index.js";
import * as shootData from "../data/shoot.js";
const ak47key = ["KP_1"]; // ak47
const m4a1key = ['KP_2']; // m4a4
const onKey = 'MOUSE5';
const offKey = 'MOUSE4'; // off alt+g4

global.requestAnimationFrame = (callback) => {
  return setImmediate(() => {
    callback(Date.now());
  });
};

global.cancelAnimationFrame = (id) => {
  clearImmediate(id);
};

const state = {
  useAutoShot: false,
  SET_AUTOSHOT: (value) => state.useAutoShot = value,
  weapon: "ak47",
  SET_WEAPON: (value) => state.weapon = value,
  shootTask: null,
};

/**
 * Use mice
 * @param {keyof typeof shootData} weapon 
 */
const shoot = (weapon) => {
  if (state.shootTask) return;

  const data = shootData[weapon]; // {x,y,d}[]  d 是距离下一次移动的时间差
  let index = 0;
  let lastTime = performance.now();

  const shootStep = (currentTime) => {
    if (index >= data.length) {
      state.shootTask = null;
      return;
    }
    const { x, y, d } = data[index];
    const elapsed = currentTime - lastTime;

    if (elapsed >= d) {
      useKey('MOUSEMOVE', { x, y });
      index++;
      lastTime = currentTime;
    }

    state.shootTask = requestAnimationFrame(shootStep);
  };

  state.shootTask = requestAnimationFrame(shootStep);
};

const useAutoShoot = (isUse, socket) => {
  state.SET_AUTOSHOT(isUse);
  socket?.emit('message', isUse ? '自动压枪已开启' : '自动压枪已关闭');
}

/**
 * @type {import("../types.js").App.AutoShootHandler}
 */
const autoShoot = (stroke, input, _onKey, _offKey, socket) => {
  return () => {
    if (areKeysActive(ak47key)) {
      state.SET_WEAPON('ak47');
      useAutoShoot(true, socket);
      socket?.emit('message', 'AK47');
    } else if (areKeysActive(m4a1key)) {
      state.SET_WEAPON('m4a1');
      useAutoShoot(true, socket);
      socket?.emit('message', 'M4A1');
    }
    const onKeyDown = KeyDownName(_onKey || onKey);
    const offKeyDown = KeyDownName(_offKey || offKey);

    if (input === onKeyDown || input === offKeyDown) {
      const isUse = input === onKeyDown;
      state.SET_AUTOSHOT(isUse);
      useAutoShoot(isUse, socket);
    }
    if (!state.useAutoShot) return;
    if (input === KeyDownName(cs2.attack1) && state.useAutoShot) {

      shoot(state.weapon);
    }
    if (input === KeyUpName(cs2.attack1) && state.shootTask) {
      cancelAnimationFrame(state.shootTask);
      state.shootTask = null;
    }
  };
};

export default autoShoot;