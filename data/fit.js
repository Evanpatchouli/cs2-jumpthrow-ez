import * as weapons from "./shoot";
import fs from "fs";
import path from "path";

const defaultSense = 2.5;
const sense = 0.5;
const useFor = "lua";

const jingdu = 1;

// 遍历所有的数据，将 x, y 乘以 sense / defaultSense, 然后写入新的文件
Object.keys(weapons).forEach((key) => {
  const data = weapons[key];
  const newData = data.map(({ x, y, d }) => ({
    x: Math.round(x * defaultSense / sense),
    y: Math.round(y * defaultSense / sense),
    d,
  }));
  let text = JSON.stringify(newData);
  if (useFor === "lua") {
    // 将数组字符串格式化为 lua table
    text = text.replace(/^\[/, '{').replace(/\]$/, '}').replace(/:/g, '=').replace(/"/g, '');
  }
  fs.writeFileSync(path.resolve(__dirname, `./${key}.${sense}.${useFor === "lua" ? "lua.txt" : "json"}`),
    text
  );
});