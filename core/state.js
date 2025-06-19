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
  onListen: () => { },
  offListen: () => { },
};

export default state;
