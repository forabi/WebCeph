import 'jimp/browser/lib/jimp.js';

export interface JimpImage {
  _originalMime: 'image/bmp' | 'image/jpeg' | 'image/png',
  bitmap: {
    data: ArrayBuffer,
    width: number,
    height: number,
  },
};

export interface Jimp {
  read(url: string): Promise<JimpImage>;
  read(url: string, callback: (err: Error | null, data: JimpImage) => void): void;
  distance(img1: JimpImage, img2: JimpImage): number;
  diff(img1: JimpImage, img2: JimpImage): { percent: number, image: JimpImage };
};

declare var Jimp: any;

import { readFileAsBuffer } from '../../utils/file';

export interface WorkerResult {
  id: string;
  url: string;
}

export interface Edit {
  method: string,
  args: any[]
};

export interface WorkerRequest {
  id: string;
  file: File;
  edits: Edit[];
}

self.addEventListener('message', async ({ data }: { data: WorkerRequest }) => {
  console.log('Got message', data);
  const { id, file, edits } = data;
  const buff = await readFileAsBuffer(file);
  const jImg = await Jimp.read(buff);
  edits.reduce(
    (jImg: JimpImage, edit: Edit) => jImg[edit.method].apply(jImg, edit.args),
    jImg
  ).getBase64(Jimp.MIME_BMP, (err: Error, url: string) => {
    self.postMessage({ id, url } as WorkerResult);
  });
});
