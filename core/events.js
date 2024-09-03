import EventEmitter from 'node:events';
import { setListening } from '.';

const emitter = new EventEmitter();

emitter.on('stop', () => {
  setListening(false);
})

export default emitter;