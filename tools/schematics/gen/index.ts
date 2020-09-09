import {
  chain,
  Tree,
  Rule,
  externalSchematic,
} from '@angular-devkit/schematics';
import { join } from 'path';
import { readFileSync } from 'fs';

export default function (schema: any): Rule {
  const rules = [];
  const start = 0;
  for (let i = start; i < start + 100; i++) {
    const libName = `lib${i}`;
    rules.push(
      externalSchematic('@nrwl/workspace', 'library', {
        name: libName,
        skipFormat: true,
      })
    );
    rules.push((tree: Tree) => {
      for (let _i = 0; _i < 50; _i++) {
        tree.create(
          `libs/lib${i}/src/lib/file${_i}.ts`,
          readFileSync(join(__dirname, './file.ts__tmpl__'))
            .toString()
            .replace(
              '@worker-test/lib0',
              `@worker-test/lib${Math.floor(Math.random() * 20)}`
            )
        );
        tree.create(
          `libs/lib${i}/src/lib/bad-file${_i}.ts`,
          readFileSync(join(__dirname, './bad-file.ts__tmpl__'))
            .toString()
            .replace(
              '@worker-test/lib0',
              `@worker-test/lib${Math.floor(Math.random() * 20)}`
            )
        );
      }
    });
  }
  return chain(rules);
}
