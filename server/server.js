import { createServer } from 'http';
import app from './apps/app.js';
const server = createServer(app);

export default server;
