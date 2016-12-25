import expect from 'expect';

import exportFile from './export';
import importFile from './import';

it('WCeph Exporter', async () => {
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
        data: 'whatever',
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
  const file = await exportFile(state as StoreState, { });
  expect(file).toBeA(File);
  expect(file.name).toBe('Patient 1.wceph');
  // expect(importFile(file, { })).toNotThrow();
});
