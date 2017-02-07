import * as ts from 'typescript';
import * as babel from 'babel-core';
import * as bluebird from 'bluebird';
import * as deepAssign from 'deep-assign';
import * as fs from 'fs';
import * as _ from 'lodash';
import * as parseArgs from 'minimist';
import { Messages } from 'react-intl';

import { readFileAsString, fileExists, glob, writeAsJSON, readAsJSON } from './helpers';

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

type Template = Record<string, string>;

async function getLocales(file: string): Promise<Messages> {
  const js = ts.transpileModule(file, tsConfig);
  const result: any = babel.transform(js.outputText, babelConfig);
  return result.metadata['react-intl'].messages;
}

async function getCurrentTemplate(path: string): Promise<Template | undefined> {
  if (await fileExists(path)) {
    return readAsJSON(path);
  }
  return undefined;
}

async function main() {
  try {
    const { output: templatePath, components } = parseArgs(process.argv.slice(2), {
      string: ['output', 'components'],
      alias: {
        o: 'output',
        i: 'components',
      },
      default: {
        output: 'src/locale.json',
        components: 'src/components/**/index.ts*',
      },
    });

    const [messagesPerFile, currentTemplate] = await bluebird.all([
      bluebird.map(
        glob(components),
        (path: string) => readFileAsString(path),
      ).map(getLocales),
      getCurrentTemplate(templatePath),
    ]);
    const messages = _.chain(messagesPerFile).flatten().sortBy('id').sortedUniqBy('id').value();
    await writeAsJSON(templatePath, messages);
    console.info('Finished.');
    if (currentTemplate !== undefined) {
      const messagesById = _.keyBy(messages, 'id');
      const newMessages = _.pickBy(messagesById, (_, k) => currentTemplate[k!] !== undefined);
      const deletedMessages = _.pickBy(currentTemplate, (_, k) => messagesById[k!] !== undefined);
      console.info(`${_.keys(newMessages).length} new found. ${_.keys(deletedMessages).length} deleted.`);
    }
  } catch (e) {
    console.error('Failed to generate locale template:', e);
    process.exit(1);
  }
}

main();
