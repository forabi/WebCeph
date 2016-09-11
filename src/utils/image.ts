import Jimp from './jimp';
const url: string = require('./assets/cephalo.jpg');

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

const err = new Error('This image does not look like a cephalometric radiograph');

function isAspectRatioSatisfied(img: Jimp): Promise<void> {
  const ratio = getAspectRatio(img);
  console.info('Aspect ratio: %f', ratio);
  return ratio >= 0.70 && ratio < 1.5 ? Promise.resolve() : Promise.reject(err);
}

async function isDistanceSatisifed(img: Jimp): Promise<void> {
  const distance = getDistance(img, await readReferenceImage());
  console.info('Hamming distance: %f', distance);
  return distance < 0.25 ? Promise.resolve() : Promise.reject(err);
}

async function isDiffSatisfied(img: Jimp): Promise<void> {
  const diff = getPixelDiff(img, await readReferenceImage());
  console.info('Pixel difference %f', diff)
  return diff < 0.15 ? Promise.resolve() : Promise.reject(err);
}

export async function doesLookLikeCephalometricRadiograph(img: Jimp, tryFlipX: boolean = true): Promise<{ isCephalo: boolean, shouldFlipX: boolean }> {
  return Promise.all([
    isAspectRatioSatisfied(img),
    isDistanceSatisifed(img),
    // isDiffSatisfied(img),
  ])
  .then(() => ({ isCephalo: true, shouldFlipX: false }))
  .catch(async (result) => {
    if (tryFlipX) {
      const { isCephalo } = await doesLookLikeCephalometricRadiograph(
        img.clone().flip(true, false),
        false,
      );
      return {
        isCephalo,
        shouldFlipX: isCephalo,
      }
    }
    return result;
  });
}