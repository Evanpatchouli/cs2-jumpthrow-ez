import { ak47, m4a1 } from "./shoot";
import fs from "fs";
import path from "path";

const arr = [];
const maxInterval = 30;

const liteify = (data) => { // {x, y, d}[]
  let prev = null;

  for (const item of data) {
    if (prev) {
      const sameDirectionX = (prev.x >= 0 && item.x >= 0) || (prev.x < 0 && item.x < 0);
      const sameDirectionY = (prev.y >= 0 && item.y >= 0) || (prev.y < 0 && item.y < 0);

      if (sameDirectionX && sameDirectionY && (prev.d + item.d <= maxInterval)) {
        prev.x += item.x;
        prev.y += item.y;
        prev.d += item.d;
      } else {
        arr.push(prev);
        prev = { ...item };
      }
    } else {
      prev = { ...item };
    }
  }

  if (prev) {
    arr.push(prev);
  }
};

liteify(ak47);

// 结果保存到 m4a1.lite.json
fs.writeFileSync(path.resolve(__dirname, "m4a1.lite.json"), JSON.stringify(arr, null, 2));