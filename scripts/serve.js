import { exec } from "child_process";
exec("set NODE_ENV=production && bun serve.js", { windowsHide: true });