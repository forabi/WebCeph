import { point } from 'analyses/helpers';

/**
 * The most prominent anterior point in the midsagittal
 * plane of the forehead.
 */
export const G = point('G', 'Glabella');

/**
 * The point of greatest concavity in the midline
 * between the forehead and the nose.
 */
export const softN = point('N\'', 'Soft Tissue Nasion');

/**
 * The most prominent or anterior point of the nose 
 * (tip of the nose).
 */
export const Pn = point('Pn', 'Pronasale');

/**
 * The point at which the columella (nasal septum) merges
 * with the upper lip in the midsagittal plane.
 */
export const Sn = point('Sn', 'Subnasale');

/**
 * A point indicating the mucocutaneous border of the upper
 * lip. Usually the most anterior point of the upper lip.
 */
export const Ls = point('Ls', 'Labrale superius');

/**
 * The point of greatest concavity in the midline of the
 * upper lip between Sn and labrale superius.
 */
export const Sls = point('Sls', 'Superior labial sulcus');

/**
 * The median point on the lower margin of the lower
 * membranous lip.
 */
export const Li = point('Li', 'Labrale inferius');

/**
 * Point located perpendicular on madibular symphysis midway between pogonion and menton
 */
export const Gn = point('Gn', 'Gnathion');

/**
 * The most prominent or anterior point on the chin in the
 * midsagittal plane.
 */
export const softPog = point(
  'Pog\'',
  'Soft Tissue Pogonion',
);

/**
 * The point of greatest concavity in the midline of the lower
 * lip between Li and soft tissue pogonion. Also known as
 * labiomental sulcus (SI).
 */
export const Ils = point('Ils', 'Inferior labial sulcus');

/**
 * The uppermost point on the vermilion of the lower lip.
 */
export const Sti = point('Sti', 'Stomion inferius');

/**
 * The uppermost point on the vermilion of the upper lip.
 */
export const Sts = point('Sts', 'Stomion superius');

/**
 * Lowest point on the contour of the soft tissue chin.
 * Found by dropping a perpendicular from horizontal
 * plane through skeletal menton.

 */
export const softMe = point(
  'Me\'',
  'Soft tissue menton',
);
