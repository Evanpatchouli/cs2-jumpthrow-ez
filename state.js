const state = {
  /** 是否启用急停 */
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
  /** 所有手动激活的键 */
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
  /** 询问某键是否处于激活状态 */
  isKeyActive(key) {
    return state.activeKeys.includes(key);
  },
  /** 鼠标和键盘的默认按击时长 */
  pressDuration: 40,
  JTDurations: [50, 80, 100], // 急停按击键盘时长（键程）
  JTDurationIdx: 0,
  /** @param {0 | 1 | 2 |undefined} idx */
  /** 急停的键程短适用于低速移动急停，键程长适用于高速移动急停 */
  JTDuration(idx) {
    return state.JTDurations[idx || state.JTDurationIdx];
  },
  /** 切换急停键程 */
  switchJTDuration() {
    state.JTDurationIdx = (state.JTDurationIdx + 1) % state.JTDurations.length;
  },
};

export default state;
