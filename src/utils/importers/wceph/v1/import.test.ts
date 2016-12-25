import expect from 'expect';
import importFile from './import';
import { isV1GeometricalPoint } from './validate';
import { isActionOfType } from 'utils/store';

const url = require('file-loader!./fixtures/valid/1.wceph');

it('WCeph Importer', async () => {
  const blob = await (await fetch(url)).blob();
  const file = new File([blob], 'Test WCeph 1.wceph');
  const actions = await importFile(file, { });
  expect(actions.length).toBeGreaterThan(0);
  for (const action of actions) {
    if (isActionOfType(action, 'SET_IMAGE_PROPS')) {
      expect(action.payload.tracing).toExist();
      expect(action.payload.tracing!.manualLandmarks).toExist();
      // tslint:disable-next-line no-string-literal
      const N = action.payload.tracing!.manualLandmarks!['N'];
      expect(N).toExist();
      expect(isV1GeometricalPoint(N)).toBe(true);
      expect(action.payload.flipX).toBe(true);
      // expect(action.payload.tracing).toMatchSnapshot();
    }
  }
});
