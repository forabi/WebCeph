import * as _ from 'lodash';
import { readAsJSON, writeAsJSON, fileExists, glob } from './helpers';
import { Messages } from 'react-intl';
import * as bluebird from 'bluebird';
import * as parseArgs from 'minimist';

async function getUpdatedLocales(localePath: string, template: Messages) {
  let data: Record<string, string> = { };
  if (await fileExists(localePath)) {
    data = await readAsJSON(localePath);
  }
  const updated = {
    ..._.mapValues(template, v => v.defaultMessage),
    ..._.mapValues(data, (message, id) => {
      if (message.length === 0) {
        return template[id!].defaultMessage;
      }
      return message;
    }),
  } as Locale;
  return updated;
}

async function main() {
  try {
    const { template: templatePath, input } = parseArgs(process.argv.slice(2), {
      string: ['template', 'input'],
      alias: {
        i: 'input',
        t: 'template',
      },
      default: {
        input: 'src/locale',
        template: 'src/locale.json',
      },
    });
    const template = _.keyBy(await readAsJSON(templatePath), 'id') as Messages;
    const files = await glob(input);
    await bluebird.map(
      files,
      async (localePath: string) => {
        const updated = await getUpdatedLocales(localePath, template);
        return writeAsJSON(localePath, updated);
      },
    );
    console.info(`Finished. ${files.length} locale files updated.`);
  } catch (e) {
    console.error('Failed to update locale files:', e);
  }
}

main();
