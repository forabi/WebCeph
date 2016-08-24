require('jimp');
const url = require('url!./assets/cephalo.jpg');

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
async function readReferenceImage(): Promise<JimpImage> {
  if (!_ref) {
    _ref = await Jimp.read(url);
  }
  return _ref;
}

const getAspectRatio = (img: JimpImage) => img.bitmap.width / img.bitmap.height;
const getDistance = (img: JimpImage, ref: JimpImage) => Jimp.distance(img, ref);
const getPixelDiff = (img: JimpImage, ref: JimpImage) => Jimp.diff(img, ref).percent;

function rejectIfFalse(value: boolean): Promise<boolean> {
  return !value ? Promise.reject(value) : Promise.resolve(value);
}

export function doesLookLikeCephalometricRadiograph(img: JimpImage): Promise<boolean> {
  return Promise.all([
    () => rejectIfFalse(getAspectRatio(img) < 0.73),
    async () => rejectIfFalse(getDistance(img, await readReferenceImage()) < 0.30),
    async () => rejectIfFalse(getPixelDiff(img, await readReferenceImage()) < 0.15),
  ])
  .then(() => true)
  .catch(() => false);
}