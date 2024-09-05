import { parentPort, workerData } from 'worker_threads';
import { waitSync } from "../core/utils.js";
import { useKey } from '../core/index.js';

const { data, speed, breakSignal, continueSignal, onLoop } = workerData;

const shootStep = () => {
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
  parentPort.postMessage({ type: 'done' });
};

shootStep();