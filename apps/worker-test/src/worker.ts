import { parentPort } from 'worker_threads';
import { handleFile } from './handle';

if (!parentPort) {
  throw new Error();
}

parentPort.on('message', (msg) => {
  if (msg.type === 'process') {
    handleFile(msg.path);
    parentPort.postMessage({
      type: 'ready',
      path: msg.path,
    });
  }
});
