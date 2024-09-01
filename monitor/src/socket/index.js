import { io } from 'socket.io-client';
import appConfig from '../../../app.config.js';

export const socket = io(appConfig.serverPath(), {
  path: "/socket.io",
  autoConnect: false,
  transports: ['websocket'],
  extraHeaders: {
    'client-info': JSON.stringify(appConfig.client.monitor)
  }
});