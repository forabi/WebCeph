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
  getBase64(mime: string, cb: (err: Error, base64: string) => void): void;
  getBuffer(mime: string, cb: (err: Error, buffer: ArrayBuffer) => void): void;
  flip(horz: boolean, vert: boolean): this;
  clone(): Jimp;
  _originalMime: 'image/bmp' | 'image/jpeg' | 'image/png';
  bitmap: {
    data: ArrayBuffer;
    width: number;
    height: number;
  };
};

export default Jimp;