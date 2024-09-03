import logger from "./logger.js";

/**
 * @type {import("./types").Core.State}
 */
const state = {
  listening: false,
  SET_LISTENING(value) {
    state.listening = value;
    queueMicrotask(() => {
      if (!state.listening) {
        logger.info("Received stop signal, stop intercepting...");
      } else {
        logger.info("Resuming intercepting...");
      }
    })
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
  clearActiveKey(key)  {
    if (state.isKeyActive(key)) {
      state.removeActiveKey(key);
    }
  },
  isKeyActive(key) {
    return state.keyState[key]?.active;
  },
  areKeysActive(keys) {
    return keys.every(key => state.isKeyActive(key));
  },
  noneKeysActive(keys) {
    return keys.every(key => !state.isKeyActive(key));
  },
  someKeysActive(keys) {
    return keys.some(key => state.isKeyActive(key));
  },
  onListen: () => { },
  offListen: () => { },
};

export default state;
