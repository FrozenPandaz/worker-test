import { performance as perf, PerformanceObserver } from 'perf_hooks';
import * as fs from 'fs';
import { join } from 'path';
import * as workspace from '../../../workspace.json';
import { Worker } from 'worker_threads';
import { handleFile, handleFiles } from './handle';

const obs = new PerformanceObserver((items) => {
  const entry = items.getEntries()[items.getEntries().length - 1];
  console.log(entry.name, entry.duration);
});

obs.observe({ entryTypes: ['measure'] });

function getFiles(path: string) {
  const files = [];
  for (const item of fs.readdirSync(path)) {
    if (fs.lstatSync(join(path, item)).isDirectory()) {
      files.push(...getFiles(join(path, item)));
    } else {
      files.push(join(path, item));
    }
  }
  return files;
}

const nodes = Object.entries(workspace.projects).map(([name, project]) => ({
  name,
  root: project.root,
}));

const numWorkers = 16;

function createProjectGraph() {
  const filesByProject = nodes.map((node) => getFiles(node.root));
  const flatFiles = filesByProject.reduce((a, files) => {
    a.push(...files);
    return a;
  }, []);
  flatFiles.forEach((file) => {
    handleFile(file);
  });
}

function createProjectGraphByProject() {
  const filesByProject = nodes.map((node) => getFiles(node.root));
  filesByProject.forEach((files) => {
    handleFiles(files);
  });
}

async function createProjectGraphAsync() {
  const filesByProject = nodes.map((node) => getFiles(node.root));
  const flatFiles = filesByProject.reduce((a, files) => {
    a.push(...files);
    return a;
  }, []);
  function start(worker: Worker) {
    function process() {
      if (flatFiles.length > 0) {
        const next = flatFiles.pop();
        worker.postMessage({
          type: 'process',
          path: next,
        });
      }
    }
    return new Promise((res) => {
      worker.on('message', (msg) => {
        if (msg.type === 'ready') {
          if (flatFiles.length > 0) {
            process();
          } else {
            worker.terminate();
            res();
          }
        }
      });
      if (flatFiles.length > 0) {
        process();
      } else {
        worker.terminate();
        res();
      }
    });
  }

  const workers = [];
  for (let i = 0; i < numWorkers; i++) {
    workers.push(new Worker(join(__dirname, './worker.js')));
  }

  await Promise.all(workers.map((w) => start(w)));
}

async function createProjectGraphAsyncByProject() {
  const filesByProject = nodes.map((node) => getFiles(node.root));
  function start(worker: Worker) {
    function process() {
      if (filesByProject.length > 0) {
        const next = filesByProject.pop();
        worker.postMessage({
          type: 'process',
          paths: next,
        });
      }
    }
    return new Promise((res) => {
      worker.on('message', (msg) => {
        if (msg.type === 'ready') {
          if (filesByProject.length > 0) {
            process();
          } else {
            worker.terminate();
            res();
          }
        }
      });
      if (filesByProject.length > 0) {
        process();
      } else {
        worker.terminate();
        res();
      }
    });
  }

  const workers = [];
  for (let i = 0; i < numWorkers; i++) {
    workers.push(new Worker(join(__dirname, './by-project-worker.js')));
  }

  await Promise.all(workers.map((w) => start(w)));
}

(async () => {
  perf.mark(`sync per file start`);
  createProjectGraph();

  perf.mark(`sync per file end`);
  perf.measure(`sync per file`, `sync per file start`, `sync per file end`);

  perf.mark(`async per file start`);
  await createProjectGraphAsync();

  perf.mark(`async per file end`);
  perf.measure(`async per file`, `async per file start`, `async per file end`);
  perf.mark(`sync per project start`);
  createProjectGraphByProject();

  perf.mark(`sync per project end`);
  perf.measure(
    `sync per project`,
    `sync per project start`,
    `sync per project end`
  );

  perf.mark(`async per project start`);
  await createProjectGraphAsyncByProject();

  perf.mark(`async per project end`);
  perf.measure(
    `async per project`,
    `async per project start`,
    `async per project end`
  );
})();
