import workerpool from "workerpool";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pool = workerpool.pool();

export const shootWorkerPool = workerpool.pool(path.resolve(__dirname, './shootWorker.2.js'));

export default pool;