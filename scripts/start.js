import { exec } from "child_process";
exec("set NODE_ENV=production && bun index.js", { windowsHide: true });