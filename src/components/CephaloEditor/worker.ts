import 'jimp/browser/lib/jimp.js';

declare class Jimp {
  static read(url: string): Promise<Jimp>;
  static read(buff: ArrayBuffer): Promise<Jimp>;
  static read(url: string, callback: (err: Error | null, data: Jimp) => void): void;
  static MIME_BMP: 'image/bmp';
  static MIME_JPG: 'image/jpeg';
  static MIME_PNG: 'image/png';
  distance(img1: Jimp, img2: Jimp): number;
  diff(img1: Jimp, img2: Jimp): { percent: number, image: Jimp };
  scaleToFit(height: number, width: number): Jimp;
  _originalMime: 'image/bmp' | 'image/jpeg' | 'image/png';
  bitmap: {
    data: ArrayBuffer;
    width: number;
    height: number;
  };
};

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

declare var self: WorkerGlobalScope;

self.addEventListener('message', async ({ data }: { data: WorkerRequest }) => {
  console.log('Got message', data);
  const { id, file, edits } = data;
  const buff = await readFileAsBuffer(file);
  const jImg = await Jimp.read(buff);
  edits.reduce(
    (jImg: Jimp, edit: Edit) => jImg[edit.method](...edit.args),
    jImg
  ).getBase64(Jimp.MIME_BMP, (err: Error, url: string) => {
    self.postMessage({ id, url } as WorkerResult);
  });
});
