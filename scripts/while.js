let now = 0;
const end = 100;
while ((now += 1) < end) {
  // 空循环，阻塞主线程
  console.log(now);
}