import { readFileSync } from 'fs';
import { createSourceFile, ScriptTarget } from 'typescript';

export function handleFile(path) {
  if (path.endsWith('.ts')) {
    createSourceFile(
      path,
      readFileSync(path).toString(),
      ScriptTarget.Latest,
      true
    );
  } else {
    readFileSync(path);
  }
}

export function handleFiles(paths) {
  paths.forEach((path) => {
    handleFile(path);
  });
}
