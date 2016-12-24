/* eslint-disable import/no-extraneous-dependencies */
const tsc = require('typescript');
const { transform } = require('babel-core');
const fs = require('fs');

function requireJSON(path) {
  return JSON.parse(String(fs.readFileSync(path)));
}

const tsConfig = requireJSON('./tsconfig.json');
const babelConfig = requireJSON('./.babelrc');

babelConfig.presets[0] = 'babel-preset-es2015';

module.exports = {
  process(src, path) {
    if (path.endsWith('.ts') || path.endsWith('.tsx')) {
      const tsTranspiledSrc = tsc.transpile(
        src,
        tsConfig.compilerOptions,
        path,
        []
      );
      return transform(tsTranspiledSrc, babelConfig).code;
    }
    return src;
  },
};
