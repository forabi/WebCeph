require('jimp');

interface JimpImage {
  _originalMime: 'image/bmp' | 'image/jpeg' | 'image/png',
  bitmap: {
    data: ArrayBuffer,
    width: number,
    height: number,
  },
};

declare const Jimp: {
  read(url: string): Promise<JimpImage>;
  distance(img1: JimpImage, img2: JimpImage): number;
  diff(img1: JimpImage, img2: JimpImage): { percent: number, image: JimpImage };
};

let _ref: JimpImage | null = null;
let url = require('url!./assets/cephalo.jpg');

async function readReferenceImage(): Promise<JimpImage> {
  if (!_ref) {
    _ref = await Jimp.read(url);
  }
  return _ref;
}

export async function doesLookLikeCephalometricRadiograph(img: JimpImage): Promise<boolean> {
  const ref = await readReferenceImage();
  const distance = Jimp.distance(img, ref);
  const { percent: diff } = Jimp.diff(img, ref);
  return (distance < 0.18 || diff < 0.15);
}