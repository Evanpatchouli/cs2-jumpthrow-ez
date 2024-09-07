let now = 0;
const end = 10;

async function sleep(interval) {
  return new Promise((resolve) => setTimeout(resolve, interval));
}

async function main(params) {
  while ((now += 1) < end) {
    const $now = now;
    // 空循环，阻塞主线程
    console.log(`main: ${now}`);
    const loopInner = async () => {
      // 空循环，占用 CPU
      let i = 0;
      while (i <= 3) {
        console.log(`now: ${$now} inner: ${i}`);
        await sleep(3000);
        i++;
      }
    }
    setImmediate(loopInner);
    await sleep(1000);
  }
}

main();