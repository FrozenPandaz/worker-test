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
  for (let i = start; i < start + 500; i++) {
    const libName = `lib${i}`;
    console.log(libName);
    rules.push(
      externalSchematic('@nrwl/workspace', 'remove', {
        projectName: libName,
      })
    );
    // rules.push(
    //   externalSchematic('@nrwl/workspace', 'library', {
    //     name: libName,
    //     skipFormat: true,
    //   })
    // );
    // rules.push((tree: Tree) => {
    //   for (let _i = 6; _i < 50; _i++) {
    //     tree.create(
    //       `libs/lib${i}/src/lib/ast-utils${_i}.ts`,
    //       readFileSync(join(__dirname, './ast-utils.ts__tmpl__'))
    //     );
    //   }
    // });
  }
  return chain(rules);
}
