import * as ts from 'typescript';
import * as babel from 'babel-core';
import * as bluebird from 'bluebird';
import * as deepAssign from 'deep-assign';
import * as fs from 'fs';
import * as _ from 'lodash';

import { readFileAsString, glob, writeAsJSON } from './helpers';

const tsConfig: ts.TranspileOptions = deepAssign(
  {},
  fs.readFileSync('tsconfig.json'),
  {
    compilerOptions: {
      isolatedModules: true,
      module: 'es2015',
      jsx: 'preserve',
    },
  },
);

const babelConfig: babel.TransformOptions = {
  presets: ['es2015', 'react'],
  plugins: ['react-intl'],
};

async function getLocales(file: string) {
  const js = ts.transpileModule(file, tsConfig);
  const result: any = babel.transform(js.outputText, babelConfig);
  return result.metadata['react-intl'].messages;
}

async function main() {
  try {
    const templatePath = 'locale.json';
    const messagesPerFile = await bluebird.map(
      glob('src/components/**/index.ts*'),
      (path: string) => readFileAsString(path),
    ).map(getLocales);
    const allMessages = _.chain(messagesPerFile).flatten().sortBy('id').sortedUniqBy('id').value();
    await writeAsJSON(templatePath, allMessages);
    console.info('Finished. Number of messages: ', allMessages.length);
  } catch (e) {
    console.error('Failed to generate locale template:', e);
    process.exit(1);
  }
}

main();
