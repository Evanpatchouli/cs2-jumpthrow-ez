import { fileURLToPath } from 'url';
import path from "path";
import appConfig from "../app.config.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT = __dirname;
const PUBLIC = path.join(ROOT, './public');

const config = {
  ROOT,
  PUBLIC,
  name: appConfig.server.name,
  protocol: appConfig.server.protocol,
  host: appConfig.server.host,
  port: appConfig.server.port,
  monitorPath: appConfig.monitor.path
}

export default config;