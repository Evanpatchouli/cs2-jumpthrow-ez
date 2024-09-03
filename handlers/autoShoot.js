import cs2config from "../configs/cs2.config.js";
const { keyBinding: cs2 } = cs2config;
import { areKeysActive, getKeyState, KeyDownName, KeyUpName, useKey } from "../core/index.js";
import * as shootData from "../data/shoot.js";
const ak47key = ['MOUSE3']; // ak47  g3
const m4a1key = ['MOUSE5']; // m4a4 g5
const offKey = 'MOUSE4'; // off alt+g4

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

  const shootStep = () => {
    if (index >= data.length) {
      clearTimeout(state.shootTask);
      state.shootTask = null;
      return;
    }
    const { x, y, d } = data[index];
    useKey('MOUSEMOVE', { x, y })
    index++;
    state.shootTask = setTimeout(shootStep, d);
  };

  shootStep();
};

/**
 * @type {import("../types.js").App.AutoShootHandler}
 */
const autoShoot = (stroke, input, stateKey, socket) => {
  return () => {
    if (stroke?.type !== 'mouse') return;
    if (input === KeyDownName(stateKey || offKey)) {
      state.SET_AUTOSHOT(!state.useAutoShot);
      socket?.emit('message', state.useAutoShot ? '自动压枪已开启' : '自动压枪已关闭');
    }
    if (!state.useAutoShot) return;

    if (areKeysActive(ak47key)) {
      state.SET_WEAPON('ak47');
      socket?.emit('message', 'AK47');
    } else if (areKeysActive(m4a1key)) {
      state.SET_WEAPON('m4a1');
      socket?.emit('message', 'M4A1');
    }

    if (input === KeyDownName(cs2.attack1) && state.useAutoShot) {
      shoot(state.weapon);
    }
    if (input === KeyUpName(cs2.attack1) && state.shootTask) {
      clearTimeout(state.shootTask);
      state.shootTask = null;
    }
  };
};

export default autoShoot;