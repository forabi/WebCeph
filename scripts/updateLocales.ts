import * as _ from 'lodash';
import { readAsJSON, writeAsJSON, fileExists } from './helpers';
import { Messages } from 'react-intl';
import * as bluebird from 'bluebird';

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
  };
  return updated;
}

const supportedLocales = ['ar', 'en'];

async function main() {
  try {
    const templatePath = 'locale.json';
    const template = _.keyBy(await readAsJSON(templatePath), 'id') as Messages;
    await bluebird.map(
      supportedLocales.map(l => `messages/${l}.json`),
      async (localePath: string) => {
        const updated = await getUpdatedLocales(localePath, template);
        return writeAsJSON(localePath, updated);
      },
    );
    console.log('Finished.');
  } catch (e) {
    console.error('Failed to update locale files:', e);
  }
}

main();
