import config from "./cs2.config";
import { getMSDistance } from "./core/utils";

const reversAxis = (config["a_-_f_acclerate"]) / (config["a_-_f_acclerate"] + 2 * config["f_acclerate"]);

/**
 * @type {import("./types").App.State}
 */
const state = {
  useJiting: false,
  SET_JITING(value) {
    state.useJiting = value;
  },
  pressDuration: 40,
  useJTDurationCalc: false,
  calcJTDuration(start) {
    const now = performance.now();
    const distance = getMSDistance(start, now);
    // 摩擦系数和按键力系数 / 按键力系数
    // console.log(distance * reversAxis)
    const du = Math.min(Math.max(distance * reversAxis, state.JTMinDuration), state.JTMaxDuration);
    return du;
  },
  SET_USE_JT_DURATION_CALC(value) {
    state.useJTDurationCalc = value;
  },
  JTMinDuration: 20,
  JTMaxDuration: 100,
  JTDurations: [40, 80, 100], // 急停按击键盘时长（键程）
  JTDurationIdx: 0,
  JTDuration(idx) {
    return state.JTDurations[idx || state.JTDurationIdx];
  },
  switchJTDuration() {
    state.JTDurationIdx = (state.JTDurationIdx + 1) % state.JTDurations.length;
  },
};

export default state;
