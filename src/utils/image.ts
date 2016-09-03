import Jimp from './jimp';
const url: string = require('./assets/cephalo.jpg');

console.log('url', url);


let _ref: Jimp | null = null;
async function readReferenceImage(): Promise<Jimp> {
  if (!_ref) {
    _ref = await Jimp.read(url);
    console.log('image read')
  }
  return _ref;
}

const getAspectRatio = (img: Jimp) => img.bitmap.width / img.bitmap.height;
const getDistance = (img: Jimp, ref: Jimp) => Jimp.distance(img, ref);
const getPixelDiff = (img: Jimp, ref: Jimp) => Jimp.diff(img, ref).percent;

const err = new Error;

function isAspectRatioSatisfied(img: Jimp): Promise<void> {
  const ratio = getAspectRatio(img);
  console.log('aspect ratio', ratio);
  return ratio >= 0. && ratio < 1.2 ? Promise.resolve() : Promise.reject(err);
}

async function isDistanceSatisifed(img: Jimp): Promise<void> {
  const distance = getDistance(img, await readReferenceImage());
  console.log('distance', distance);
  return distance < 0.3 ? Promise.resolve() : Promise.reject(err);
}

async function isDiffSatisfied(img: Jimp): Promise<void> {
  const diff = getPixelDiff(img, await readReferenceImage());
  console.log('diff', diff)
  return diff < 0.15 ? Promise.resolve() : Promise.reject(err);
}

export async function doesLookLikeCephalometricRadiograph(img: Jimp): Promise<boolean> {
  return Promise.all([
    isAspectRatioSatisfied(img),
    isDistanceSatisifed(img),
    // isDiffSatisfied(img),
  ])
  .then(() => true)
  .catch(() => false);
}