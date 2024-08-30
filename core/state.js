/**
 * @type {import("./types").Core.State}
 */
const state = {
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
  areKeysActive(keys) {
    return keys.every(key => state.isKeyActive(key));
  }
};

export default state;
