/**
 * 并发执行
 * @param {Array<()=>void>} funcs
 * @returns
 */
export const concurrentify = (...funcs) => {
  return Promise.all(funcs.map((func) => func()));
};

/**
 * 串行执行
 * @param {Array<()=>void>} funcs
 * @returns
 */
export const sequentialify = (...funcs) => {
  return funcs.reduce((prev, curr) => prev.then(curr), Promise.resolve());
};

/**
 * - 等待时间 | Wait time
 * @param time 等待时间 | The waiting time
 * @type {import("./types").Core['Utils']['wait']}
 */
export const wait = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const waitSync = (ms) => {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    // 空循环，阻塞主线程
  }
};

/**
 * 获取当前时间字符串，精确到微秒
 * @returns {`${YYYY}-${MM}-${DD} ${HH}:${mm}:${ss}.${ms}`}
 */
export const getCurrentTimeString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = ("0" + (now.getMonth() + 1)).slice(-2);
  const date = ("0" + now.getDate()).slice(-2);
  const hour = ("0" + now.getHours()).slice(-2);
  const minute = ("0" + now.getMinutes()).slice(-2);
  const second = ("0" + now.getSeconds()).slice(-2);

  // 使用 performance.now() 获取高精度时间戳
  const performanceNow = performance.now();
  const millisecond = ("000000" + (performanceNow % 1000).toFixed(3)).slice(-6);

  return `${year}-${month}-${date} ${hour}:${minute}:${second}.${millisecond}`;
};

/**
 * - 基于 performance.now() 的时间戳差 | The timestamp difference based on performance.now()
 * @param start 开始时间 | The start time
 * @param end 结束时间 | The end time
 * @param toFix 保留小数位数 | The number of decimal places to keep
 * @returns 时间戳差 (ms) | Timestamp difference (ms)
 * @type {import("./types").Core['Utils']['getMSDistance']}
 */
export const getMSDistance = (start, end, toFix) => {
  const distance = (end - start).toFixed(toFix ?? 3);
  return distance;
};

/**
 * 
 * @param {Array<*>} a 
 * @param {Array<*>} b 
 * @param {boolean|undefined} strict 
 * @returns 
 */
export const ArrayEqual = (a, b, strict = false) => {
  if (a.length !== b.length) {
    return false;
  }
  // 元素相同，不论顺序
  if (strict) {
    return a.every((value, idx) => value === b[idx]);
  } else {
    const bSet = new Set(b);
    return a.every((value) => bSet.has(value));
  }
}
