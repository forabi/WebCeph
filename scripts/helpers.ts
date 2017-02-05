import * as _glob from 'glob';
import * as bluebird from 'bluebird';

import * as fs from 'fs';

export const glob = bluebird.promisify<string[], string>(_glob);

export const readFile = (path: string) => bluebird.fromNode(cb => fs.readFile(path, cb));

export const readFileAsString = async (path: string) => String(await readFile(path));

export const readAsJSON = async (path: string) => JSON.parse(await readFileAsString(path));

export const writeFile = (path: string, data: any) => bluebird.fromNode(cb => fs.writeFile(path, data, cb));

export const writeAsJSON = (path: string, data: any) => writeFile(path, JSON.stringify(data, undefined, 2));

export const fileExists = (path: string) => fs.existsSync(path);
