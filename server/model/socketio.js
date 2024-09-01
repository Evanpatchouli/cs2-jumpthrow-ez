import { Server } from 'socket.io';
import server from '../server.js';
import logger from '../utils/logger.js';
import * as core from '../../core/index.js';
import state from '../state/index.js';
const { info } = logger;

class SocketIoProxy {
  /**
   * @type {SocketIoProxy|null}
   */
  _instance = null;
  /**
   * @type {Server}
   */
  server = null;
  static _instance = null;
  constructor() {
    this.server = new Server(server, {
      path: "/socket.io/",
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });
    state.socket = this.server;
    info('SocketIo server created!');
    this.server.on('connection', (socket) => {
      const clientInfoStr = socket.handshake.headers['client-info'];
      const clientInfo = JSON.parse(clientInfoStr || "{}");
      state.clients.set(socket.id, clientInfo);
      const clientName = clientInfo.name || 'Unknown';
      info(`Client (${clientName}) connected.`);
      socket.on('message', (data) => {
        socket.emit('message', data);
      });
      socket.on('status', (data) => {
        socket.emit('status', core.isListening());
      })
      socket.on('disconnect', () => {
        info(`Client (${clientName}) disconnected.`);
      });
    });
    this.server.on('close', () => {
      info('SocketIO server closed');
    });
  }

  static instance() {
    if (!this._instance) {
      this._instance = new SocketIoProxy();
    }
    return this._instance;
  }
}

export async function init() {
  return SocketIoProxy.instance();
}

export const instance = SocketIoProxy.instance();

export default {
  init,
  instance
}
