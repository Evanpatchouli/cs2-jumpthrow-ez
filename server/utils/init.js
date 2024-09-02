import logger from './logger.js';
import socketioProxy from '../model/socketio.js';
import * as _ from 'express-async-errors';

export default async function init() {
  logger.info('Initializing the server...');
  await socketioProxy.init();
}