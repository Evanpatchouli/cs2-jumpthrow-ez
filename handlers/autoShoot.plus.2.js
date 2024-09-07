import cs2config from "../configs/cs2.config.js";
const { keyBinding: cs2 } = cs2config;
import { areKeysActive, getKeyState, KeyDownName, KeyUpName } from "../core/index.js";
import { Worker } from 'node:worker_threads';
import path from 'path';
import * as shootData from "../data/shoot.js";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ak47key = ["KP_1"]; // ak47
const m4a1key = ['KP_2']; // m4a4
const onKey = 'MOUSE5';
const offKey = 'MOUSE4'; // off alt+g4

const state = {
  useAutoShot: false,
  SET_AUTOSHOT: (value) => state.useAutoShot = value,
  weapon: "ak47",
  SET_WEAPON: (value) => state.weapon = value,
  /** @type {Worker} */
  shootTask: null,
};

const speed = 1;

/**
 * Use mice
 * @param {keyof typeof shootData} weapon 
 */
const shoot = (weapon) => {
  if (state.shootTask) return;

  const data = shootData[weapon].slice(30); // {x,y,d}[]  d 是距离下一次移动的时间差

  const breakSignal = state.shootTask;
  const continueSignal = false;
  const onLoop = null;

  const worker = new Worker(path.resolve(__dirname, './shootWorker.js'), {
    workerData: { data, speed, breakSignal, continueSignal, onLoop }
  });

  worker.on('message', (message) => {
    if (message.type === 'done') {
      state.shootTask = null;
    } else if (message.type === 'break') {
      worker.terminate();
      state.shootTask = null;
    }
  });

  worker.on('error', (error) => {
    console.error(error);
  });

  state.shootTask = worker;
};

const useAutoShoot = (isUse, socket) => {
  state.SET_AUTOSHOT(isUse);
  socket?.emit('message', isUse ? '自动压枪已开启' : '自动压枪已关闭');
};

/**
 * Effect is not good due to nodejs cannot sleep pariculary.
 * @type {import("../types.js").App.AutoShootHandler}
 */
const autoShoot = (stroke, input, _onKey, _offKey, socket) => {
  return () => {
    if (stroke?.type === 'keyboard') {
      if (areKeysActive(ak47key)) {
        state.SET_WEAPON('ak47');
        useAutoShoot(true, socket);
        socket?.emit('message', 'AK47');
      } else if (areKeysActive(m4a1key)) {
        state.SET_WEAPON('m4a1');
        useAutoShoot(true, socket);
        socket?.emit('message', 'M4A1');
      }
      return;
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
      state.shootTask?.terminate();
      state.shootTask = null;
    }
  };
};

export default autoShoot;