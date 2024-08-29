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
 * wait
 * @param {number} ms
 * @returns
 */
export const wait = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
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
 * 计算两个 performance.now() 之间以毫秒为单位的时间差
 * @type {import("./types").App.getMSDistance}
 * @returns {number} 时间差（毫秒）
 */
export const getMSDistance = (start, end, toFix) => {
  const distance = (end - start).toFixed(toFix ?? 3);
  return distance;
}
