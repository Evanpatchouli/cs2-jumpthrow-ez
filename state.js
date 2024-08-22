const state = {
  useJiting: false,
  /**
   * SET_JITING
   * @param {boolean} value
   */
  SET_JITING(value) {
    state.useJiting = value;
  },
  listening: false,
  /**
   * SET_LISTENING
   * @param {boolean} value
   */
  SET_LISTENING(value) {
    state.listening = value;
  },
  activeKeys: [],
  pushActiveKeys(key) {
    if (!state.activeKeys.includes(key)) {
      state.activeKeys.push(key);
    }
  },
  removeActiveKeys(key) {
    const index = state.activeKeys.indexOf(key);
    if (index > -1) {
      state.activeKeys.splice(index, 1);
    }
  },
  isKeyActive(key) {
    return state.activeKeys.includes(key);
  },
};

export default state;
