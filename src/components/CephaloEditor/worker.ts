import 'jimp/browser/lib/jimp.js';
import bluebird from 'bluebird';

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
  getBase64(mime: string, cb: (err: Error, base64: string) => void): void;
  _originalMime: 'image/bmp' | 'image/jpeg' | 'image/png';
  bitmap: {
    data: ArrayBuffer;
    width: number;
    height: number;
  };
};

import { readFileAsBuffer } from '../../utils/file';

export interface IImageWorker extends Worker {
  postMessage(request: WorkerRequest): void;
  addEventListener(type: 'message', listener: (event: WorkerEvent) => void): void;
  addEventListener(type: 'error', listener: (event: ErrorEvent ) => void): void;
}

export interface WorkerResult {
  requestId: string;
  url?: string;
  error?: WorkerError;
}

export interface WorkerError {
  message: string,
  code?: string,
}

export type WorkerEvent = Event & { data: WorkerResult }

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

function mapError({ message }: Error): WorkerError {
  if (message.match(/mime/ig)) {
    return {
      message: (
        'Failed to load the image. ' +
        'Make sure it\s a valid image file and that your browser supports images of this type.'
      )
    };
  } else {
    return { message };
  }
}

self.addEventListener('message', async ({ data }: Event & { data: WorkerRequest }) => {
  const { id: requestId, file, edits } = data;
  try {
    const buff = await readFileAsBuffer(file);
    let img = await Jimp.read(buff);
    img = edits.reduce(
      (img: Jimp, edit: Edit) => img[edit.method](...edit.args),
      img
    );
    const url = await bluebird.fromCallback(cb => img.getBase64(Jimp.MIME_BMP, cb));
    self.postMessage({ requestId, url } as WorkerResult);
  } catch (error) {
    self.postMessage({ requestId, error: mapError(error)} as WorkerResult);
  }
});
