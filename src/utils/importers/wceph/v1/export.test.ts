import expect from 'expect';

import exportFile from './export';
import importFile from './import';

import { isActionOfType } from 'utils/store';
import { readFileAsDataURL } from 'utils/file';

import find from 'lodash/find';

describe('WCeph Exporter', () => {
  it('should be able to export a valid WCeph v1 file', async () => {
    const url = require('file-loader!./fixtures/images/ceph1.jpg');
    const imageFile = new File([await (await fetch(url)).blob()], 'Export test.jpg');
    const state: Partial<StoreState> = {
      'workspace.mode': 'tracing',
      'workspace.images.activeImageId': 'img_1',
      'workspace.images.props': {
        img_1: {
          name: 'Patient 1',
          type: 'ceph_lateral',
          flipX: true,
          flipY: false,
          brightness: 0.7,
          contrast: 0.1,
          height: 500,
          width: 700,
          scaleFactor: null,
          invertColors: true,
          analysis: {
            activeId: 'downs',
          },
          data: await readFileAsDataURL(imageFile),
        },
      },
      'workspace.images.tracing': {
        img_1: {
          mode: 'assisted',
          manualLandmarks: {
            N: {
              x: 400,
              y: 300,
            },
          },
          skippedSteps: {
            S: true,
          },
        },
      },
    };
    const exportedFile = await exportFile(state as StoreState, { });
    expect(exportedFile).toBeA(File);
    expect(exportedFile.name).toBe('Patient 1.wceph');

    it('should be able to import the exported file correctly', async () => {
      const actions = await importFile(exportedFile, { });
      expect(actions).toExist();
      expect(find(actions, action => isActionOfType(action, 'SET_IMAGE_PROPS'))).toBeTruthy();
      for (const action of actions) {
        if (isActionOfType(action, 'SET_IMAGE_PROPS')) {
          expect(action.payload.type).toBe('ceph_lateral');
          // tslint:disable no-string-literal
          expect(action.payload.tracing!.manualLandmarks!['N']).toMatch({ x: 400, y: 300 });
          expect(action.payload.tracing!.skippedSteps!['S']).toBe(true);
          expect(action.payload.flipX).toBe(true);
        }
      }
    });
  });
});

