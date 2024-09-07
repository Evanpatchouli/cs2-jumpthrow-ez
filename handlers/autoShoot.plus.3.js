import { areKeysActive, KeyDownName, KeyUpName } from "../core/index.js";
import cs2config from "../configs/cs2.config.js";
import * as shootData from "../data/shoot.js";
import { shootWorkerPool } from "./pool.js";

const { keyBinding: cs2 } = cs2config;

const ak47key = ["KP_1"]; // ak47
const m4a1key = ["KP_2"]; // m4a4
const onKey = "MOUSE5";
const offKey = "MOUSE4"; // off alt+g4

const state = {
  useAutoShot: false,
  SET_AUTOSHOT: (value) => (state.useAutoShot = value),
  weapon: "ak47",
  SET_WEAPON: (value) => (state.weapon = value),
  shootTask: null,
};

const speed = 1;

/**
 * Use mice
 * @param {keyof typeof shootData} weapon
 */
const shoot = (weapon) => {
  if (state.shootTask) return;

  const data = shootData[weapon]; // {x,y,d}[]  d 是距离下一次移动的时间差

  const breakSignal = state.shootTask;
  const continueSignal = false;
  const onLoop = null;

  state.shootTask = true;
  shootWorkerPool
    .exec("shootStep", [data, speed, breakSignal, continueSignal, onLoop])
    .catch((e) => console.error(e))
    .then(() => {
      state.shootTask = null;
    });
};

const useAutoShoot = (isUse, socket) => {
  state.SET_AUTOSHOT(isUse);
  socket?.emit("message", isUse ? "自动压枪已开启" : "自动压枪已关闭");
};

/**
 * Effect is not good due to nodejs cannot sleep pariculary.
 * @type {import("../types.js").App.AutoShootHandler}
 */
const autoShoot = (stroke, input, _onKey, _offKey, socket) => {
  return () => {
    if (stroke?.type === "keyboard") {
      if (areKeysActive(ak47key)) {
        state.SET_WEAPON("ak47");
        useAutoShoot(true, socket);
        socket?.emit("message", "AK47");
      } else if (areKeysActive(m4a1key)) {
        state.SET_WEAPON("m4a1");
        useAutoShoot(true, socket);
        socket?.emit("message", "M4A1");
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
      state.shootTask = true;
      shoot(state.weapon);
    }
    if (input === KeyUpName(cs2.attack1) && state.shootTask) {
      state.shootTask = false;
      console.log("terminate");
      shootWorkerPool.terminate();
      return;
    }
  };
};

export default autoShoot;
