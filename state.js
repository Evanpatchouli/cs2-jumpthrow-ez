/**
 * @type {import("./types").App.State}
 */
const state = {
  useJiting: false,
  SET_JITING(value) {
    state.useJiting = value;
  },
  listening: false,
  SET_LISTENING(value) {
    state.listening = value;
  },
  keyState: {},
  setActiveKey(key) {
    const prev = state.keyState[key];
    state.keyState[key] = {
      active: true,
      firstActive: prev?.active === false ? performance.now() : (prev?.firstActive || performance.now())
    }
  },
  getKeyState(key) {
    return state.keyState[key];
  },
  removeActiveKey(key) {
    state.keyState[key] = {
      active: false,
      firstActive: state.keyState[key]?.firstActive
    };
  },
  isKeyActive(key) {
    return state.keyState[key]?.active;
  },
  pressDuration: 40,
  JTDurations: [50, 80, 100], // 急停按击键盘时长（键程）
  JTDurationIdx: 0,
  JTDuration(idx) {
    return state.JTDurations[idx || state.JTDurationIdx];
  },
  switchJTDuration() {
    state.JTDurationIdx = (state.JTDurationIdx + 1) % state.JTDurations.length;
  },
};

export default state;
