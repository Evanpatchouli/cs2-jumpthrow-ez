// import { Toast } from "evp-design-ui";

// const pushToast = (type) => (text) => Toast[type]?.(text, null, null, 'rightBottom');

// const toast = (text) => Toast(text, null, null, 'rightBottom');
// toast.success = pushToast('success');
// toast.info = pushToast('info');
// toast.error = pushToast('error');
// toast.warn = pushToast('warn');

import Toast from "react-hot-toast";

const toastInfo = (text) => Toast(text, {
  position: "bottom-right",
  duration: 3000,
  icon: "ℹ️",
  style: {
    color: "#3178BE",
    borderRadius: "20px",
  },
  // progressStyle: { backgroundColor: "#3178BE" },
});
const toastSuccess = (text) => Toast(text, {
  position: "bottom-right",
  duration: 3000,
  icon: "✅",
  style: {
    // backgroundColor: "#4CAF50",
    color: "#4CAF50",
    borderRadius: "20px",
  },
});
const toastError = (text) => Toast(text, {
  position: "bottom-right",
  duration: 3000,
  icon: "❌",
  style: {
    // backgroundColor: "#F44336",
    color: "#F44336",
    borderRadius: "20px",
  },
});
const toastWarn = (text) => Toast(text, {
  position: "bottom-right",
  duration: 3000,
  icon: "⚠️",
  style: {
    // backgroundColor: "#FFC107",
    color: "#FFC107",
    borderRadius: "20px",
  },
});

/**
 * @type {import("../types").Monitor.Utils.Toast}
 */
const toast = toastInfo;
toast.success = toastSuccess;
toast.info = toastInfo;
toast.error = toastError;
toast.warn = toastWarn;

export default toast;