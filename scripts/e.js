import EventEmitter from 'node:events';

const e1 = new EventEmitter();

e1.on('stop', () => {
  console.log('stop event');
})

e1.emit('stop');