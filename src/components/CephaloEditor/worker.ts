importScripts('https://cdn.rawgit.com/oliver-moran/jimp/v0.2.27/browser/lib/jimp.min.js');

declare var Jimp: any;

import { Edit } from './index'

export interface ImageWorkerData {
  image: string,
  edits: Array<Edit>,
} 

self.addEventListener('message', e => {
  console.log('Got message', e.data);
  const { image, edits } = e.data as ImageWorkerData;
  Jimp.read(image).then(data => {
    edits.reduce(
      (data, edit) => data[edit.method].apply(data, edit.args),
      data
    ).getBuffer(Jimp.MIME_BMP, (err, src) => {
      self.postMessage({ image: src });
    });
  });
});
