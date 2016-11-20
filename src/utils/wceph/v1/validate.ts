import {
  WCephJSON,
  JSON_FILE_NAME,
} from './format';

import JSZip from 'jszip';

import filter from 'lodash/filter';
import map from 'lodash/map';
import negate from 'lodash/negate';
import isUndefined from 'lodash/isUndefined';
import isPlainObject from 'lodash/isPlainObject';
import every from 'lodash/every';
import has from 'lodash/has';
import keys from 'lodash/keys';
import values from 'lodash/values';
import isBoolean from 'lodash/isBoolean';
import isNumber from 'lodash/isNumber';
import isString from 'lodash/isString';

import { isGeometricalObject } from 'utils/math';

const isTrue = (value: any) => value === true;
const isDefined = negate(isUndefined);

type Rule<T> = (data: T) => true | false;
type ErrorMaker<T> = (data: T) => ValidationError;
type Fixer<T> = (data: T, error: ValidationError) => T;

enum ValidationErrorType {
  UNSPECIFIED_FILE_VERSION,
  NO_REFS,
  MISSING_REFS,
  MISSING_DATA,
  INCOMPATIBLE_IMAGE_TYPE,
  INCOMPATIBLE_BRIGHTNESS_VALUE,
  INCOMPATIBLE_CONTRAST_VALUE,
  INVALID_IMAGE_DATA,
  INVALID_TRACING_DATA,
}

const getMessageForError = (type: ValidationErrorType, data?: any) => {
  switch (type) {
    case ValidationErrorType.UNSPECIFIED_FILE_VERSION:
      return (
        `Unspecified file version`
      );
    case ValidationErrorType.MISSING_REFS:
      return (
        `Invalid file format`
      );
    default:
      return ValidationErrorType[type];
  }
};

function createErrorMaker<T>(type: ValidationErrorType): ErrorMaker<T> {
  return (data: T) => ({
    type,
    message: getMessageForError(type, data),
    data,
  });
};

// @TODO: validate json structure
const rules: [
  Rule<WCephJSON>,
  ErrorMaker<WCephJSON>,
  Fixer<WCephJSON> | undefined
][] = [
  [
    ({ version }) => isDefined(version),
    createErrorMaker(ValidationErrorType.UNSPECIFIED_FILE_VERSION),
    undefined,
  ],
  [
    ({ version }) => version === 1,
    createErrorMaker(ValidationErrorType.UNSPECIFIED_FILE_VERSION),
    undefined,
  ],
  [
    ({ refs }) => (
      isPlainObject(refs) &&
      isPlainObject(refs.images) &&
      isPlainObject(refs.thumbs)
    ),
    createErrorMaker(ValidationErrorType.NO_REFS),
    undefined,
  ],
  [
    ({ data }) => isDefined(data) && isPlainObject(data),
    createErrorMaker(ValidationErrorType.MISSING_DATA),
    undefined,
  ],
  [
    ({ data, refs }) => {
      return isPlainObject(refs.images) && every(keys(data), key => has(refs.images, key));
    },
    createErrorMaker(ValidationErrorType.MISSING_REFS),
    undefined,
  ],
  [
    ({ data }) => {
      return every(values(data), (image) => {
        return (
          isString(image.type) &&
          isBoolean(image.flipX) &&
          isBoolean(image.flipY) &&
          isBoolean(image.invertColors) &&
          isNumber(image.brightness) &&
          isNumber(image.contrast)
        );
      });
    },
    createErrorMaker(ValidationErrorType.INVALID_IMAGE_DATA),
    undefined,
  ],
  [
    ({ data }) => {
      return every(values(data), ({ tracing }) => {
        return (
          isPlainObject(tracing) &&
          isString(tracing.mode) &&
          (
            isNumber(tracing.scaleFactor) ||
            tracing.scaleFactor === null
          )
        );
      });
    },
    createErrorMaker(ValidationErrorType.INVALID_TRACING_DATA),
    undefined,
  ],

  [
    ({ data }) => {
      return every(values(data), ({ tracing: { mode } }) => {
        return (
          mode === 'auto' ||
          mode === 'assisted' ||
          mode === 'manual'
        );
      });
    },
    createErrorMaker(ValidationErrorType.INVALID_TRACING_DATA),
    undefined,
  ],
  [
    ({ data }) => {
      return every(values(data), ({ tracing: { manualLandmarks } }) => {
        return (
          isPlainObject(manualLandmarks) &&
          every(values(manualLandmarks), isGeometricalObject)
        );
      });
    },
    createErrorMaker(ValidationErrorType.INVALID_TRACING_DATA),
    undefined,
  ],
  [
    ({ data }) => {
      return every(values(data), ({ tracing: { skippedSteps } }) => {
        return (
          isPlainObject(skippedSteps) &&
          every(values(skippedSteps), isTrue)
        );
      });
    },
    createErrorMaker(ValidationErrorType.INVALID_TRACING_DATA),
    undefined,
  ],
  [
    ({ data }) => {
      return every(values(data), ({ type }) => {
        return (
          type === null ||
          type === 'ceph_lateral' ||
          type === 'ceph_pa' ||
          type === 'photo_lateral' ||
          type === 'photo_frontal' ||
          type === 'panoramic'
        );
      });
    },
    createErrorMaker(ValidationErrorType.INCOMPATIBLE_IMAGE_TYPE),
    undefined,
  ],
  [
    ({ data }) => {
      return every(values(data), ({ brightness }) => {
        return brightness >= 0 && brightness <= 1;
      });
    },
    createErrorMaker(ValidationErrorType.INCOMPATIBLE_BRIGHTNESS_VALUE),
    undefined,
  ],
  [
    ({ data }) => {
      return every(values(data), ({ contrast }) => {
        return contrast >= 0 && contrast <= 1;
      });
    },
    createErrorMaker(ValidationErrorType.INCOMPATIBLE_CONTRAST_VALUE),
    undefined,
  ],
  [
    ({ data }) => {
      return every(values(data), ({ analysis }) => {
        return (
          isString(analysis) || analysis === null
        );
      });
    },
    createErrorMaker(ValidationErrorType.INVALID_TRACING_DATA),
    undefined,
  ],
];

export const validateIndexJSON = (json: WCephJSON): ValidationError[] => {
  return map(
    filter(
      map(rules, rule => {
        const validator = rule[0];
        const errorMaker = rule[1];
        if (validator(json) === true) {
          return true;
        }
        return errorMaker;
      }),
      result => result !== true,
    ),
    (makeError: ErrorMaker<WCephJSON>) => makeError(json),
  );
};

const validateFile: WCeph.Validator = async (fileToValidate, options) => {
  const {

  } = options;
  const zip = new JSZip();
  await zip.loadAsync(fileToValidate);
  const json: WCephJSON = JSON.parse(
    await zip.file(JSON_FILE_NAME).async('string')
  );
  return [
    // @TODO: add unzip errors
    ...validateIndexJSON(json),
  ];
};

export default validateFile;
