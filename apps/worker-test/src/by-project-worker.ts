import { parentPort } from 'worker_threads';
import { handleFiles } from './handle';

if (!parentPort) {
  throw new Error();
}

parentPort.on('message', (msg) => {
  if (msg.type === 'process') {
    handleFiles(msg.paths);
    parentPort.postMessage({
      type: 'ready',
      paths: msg.paths,
    });
  }
});
