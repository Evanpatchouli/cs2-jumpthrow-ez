import * as core from "../core/index.js";
import { concurrentify, wait } from "../core/utils.js";
import cs2config from "../configs/cs2.config.js";
import state from "../state.js";

const { keyBinding: cs2 } = cs2config;

const { useKey, KeyUpName } = core;

/**
 * @type {import("../types.js").App.JumpThrowHandler}
 */
export const jumpThrow = (stroke, input, key) => {
  return () => {
    if (stroke?.type !== "keyboard") return;
    if (input === KeyUpName(key || "F7")) {
      concurrentify(
        () => {
          useKey(cs2.attack1, { pressDuration: state.pressDuration });
        },
        () => {
          useKey(cs2.jump);
        }
      );
    }
  };
};

/**
 * @type {import("../types.js").App.JumpThrowHandler}
 */
export const jumpThrow2 = (stroke, input, key) => {
  return () => {
    if (stroke?.type !== "keyboard") return;
    if (input === KeyUpName(key || "F8")) {
      concurrentify(
        () => {
          useKey(cs2.attack2, { pressDuration: state.pressDuration });
        },
        () => {
          useKey(cs2.jump);
        }
      );
    }
  };
};

/**
 * @type {import("../types.js").App.ForwardJumpThrowHandler}
 */
export const forwardJumpThrow = (stroke, input, key) => {
  return () => {
    if (stroke?.type !== "keyboard") return;
    if (input === KeyUpName(key || "F9")) {
      concurrentify(
        () => {
          useKey(cs2.forward, {
            pressDuration: state.pressDuration,
            mode: 'clickOrPress',
          });
        },
        () => {
          useKey(cs2.attack1, {
            pressDuration: state.pressDuration,
          });
        },
        () => {
          useKey(cs2.jump);
        }
      );
    }
  };
};

/**
 * @type {import("../types.js").App.JumpThrowHandler}
 */
export const jumpDoubleThrow = (stroke, input, key) => {
  return () => {
    if (stroke?.type !== "keyboard") return;
    if (input === KeyUpName(key || "F10")) {
      concurrentify(
        () => {
          useKey(cs2.attack1, {
            pressDuration: state.pressDuration,
          });
        },
        () => {
          useKey(cs2.attack2, {
            pressDuration: state.pressDuration,
          });
        },
        () => {
          useKey(cs2.jump);
        }
      );
    }
  };
};

/**
 * @type {import("../types.js").App.JumpThrowHandler}
 */
export const forwardJumpDoubleThrow = (stroke, input, key) => {
  return () => {
    if (stroke?.type !== "keyboard") return;
    if (input === KeyUpName(key || "F11")) {
      concurrentify(
        () => {
          useKey(cs2.forward, {
            pressDuration: state.pressDuration,
            mode: 'clickOrPress',
          });
        },
        () => {
          useKey(cs2.attack1, {
            pressDuration: state.pressDuration,
          });
        },
        () => {
          useKey(cs2.attack2, {
            pressDuration: state.pressDuration,
          });
        },
        () => {
          useKey(cs2.jump);
        }
      );
    }
  };
};

/**
 * @type {import("../types.js").App.JumpThrowHandler}
 */
export const rightJumpThrow = (stroke, input, key) => {
  return async () => {
    if (stroke?.type !== "keyboard") return;
    if (input === KeyUpName(key || "F12")) {
      useKey(cs2.right, {
        pressDuration: 400,
        mode: 'clickOrPress'
      });
      await wait(100);
      concurrentify(
        () => {
          useKey(cs2.attack1, {
            pressDuration: state.pressDuration,
          });
        },
        () => {
          useKey(cs2.jump);
        }
      );
    }
  };
};