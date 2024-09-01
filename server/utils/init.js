import logger from './logger.js';
import socketioProxy from '../model/socketio.js';

require('express-async-errors');
export default async function init() {
  logger.info('Initializing the server...');
  await socketioProxy.init();
}