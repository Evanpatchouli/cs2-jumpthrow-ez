import EventEmitter from 'node:events';
import state from './state.js';

const emitter = new EventEmitter();

const events = new Map();

emitter.on('stop', () => {
  state.SET_LISTENING(false);
  events.get('stop')?.();
});

emitter.on('start', () => {
  state.SET_LISTENING(true);
  events.get('start')?.();
});


emitter.on('destroy', () => {
  emitter.emit('stop');
  logger.info("Received destroy signal, destroy instance...");
  interception?.destroy();
});

export function onDestroy() {
  emitter.emit('destroy');
}

export const onListen = (cb) => {
  events.set('start', cb);
}

export const offListen = (cb) => {
  events.set('stop', cb);
}

export default emitter;