import { waitSync } from "../core/utils.js";
import { useKey } from '../core/index.js';
import { worker } from 'workerpool';

const shootStep = (data, speed, breakSignal, continueSignal, onLoop) => {
  let index = 0;
  while (index < data.length) {
    const { x, y, d } = data[index];
    useKey('MOUSEMOVE', { x, y });
    index++;
    waitSync(d / speed, {
      onLoop: onLoop,
      breakSignal: breakSignal,
      continueSignal: continueSignal,
    });
  }
};

worker({
  shootStep: shootStep,
})