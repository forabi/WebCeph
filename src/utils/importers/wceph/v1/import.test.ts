import fs from 'fs';
import importFile from './import';
import { isV1GeometricalPoint } from './validate';
import { isActionOfType } from 'utils/store';

test.skip('WCeph Importer', async () => {
  const buffer = fs.readFileSync(__dirname + '/fixtures/valid/1.wceph').buffer;
  const file = new File([buffer], 'Test WCeph 1.wceph');
  const actions = await importFile(file, { });
  expect(actions.length).toBeGreaterThan(0);
  for (const action of actions) {
    if (isActionOfType(action, 'SET_IMAGE_PROPS')) {
      expect(action.payload.tracing).toBeDefined();
      expect(action.payload.tracing!.manualLandmarks).toBeDefined();
      // tslint:disable-next-line no-string-literal
      const N = action.payload.tracing!.manualLandmarks!['N'];
      expect(N).toBeDefined();
      expect(isV1GeometricalPoint(N)).toBe(true);
      expect(action.payload.flipX).toBe(true);
      expect(action.payload.tracing).toMatchSnapshot();
    }
  }
});
