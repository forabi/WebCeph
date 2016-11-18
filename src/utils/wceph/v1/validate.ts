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

const isDefined = negate(isUndefined);

type Rule<T> = (data: T) => true | false;
type ErrorMaker<T> = (data: T) => ValidationError;
type Fixer<T> = (data: T, error: ValidationError) => T;

enum ErrorType {
  UNSPECIFIED_FILE_VERSION,
  NO_REFS,
  MISSING_REFS,
  MISSING_DATA,
  INCOMPATIBLE_IMAGE_TYPE,
  INCOMPATIBLE_BRIGHTNESS_VALUE,
  INCOMPATIBLE_CONTRAST_VALUE,
}

const getMessageForError = (type: ErrorType, data?: any) => {
  switch (type) {
    case ErrorType.UNSPECIFIED_FILE_VERSION:
      return (
        `Unspecified file version`
      );
    case ErrorType.MISSING_REFS:
      return (
        `Invalid file format`
      );
    default:
      return ErrorType[type];
  }
};

function createErrorMaker<T>(type: ErrorType): ErrorMaker<T> {
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
    createErrorMaker(ErrorType.UNSPECIFIED_FILE_VERSION),
    undefined,
  ],
  [
    ({ version }) => version === 1,
    createErrorMaker(ErrorType.UNSPECIFIED_FILE_VERSION),
    undefined,
  ],
  [
    ({ refs }) => isDefined(refs) && isPlainObject(refs),
    createErrorMaker(ErrorType.NO_REFS),
    undefined,
  ],
  [
    ({ data }) => isDefined(data) && isPlainObject(data),
    createErrorMaker(ErrorType.MISSING_DATA),
    undefined,
  ],
  [
    ({ data, refs }) => {
      return every(keys(data), key => has(refs, key));
    },
    createErrorMaker(ErrorType.MISSING_REFS),
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
    createErrorMaker(ErrorType.INCOMPATIBLE_IMAGE_TYPE),
    undefined,
  ],
  [
    ({ data }) => {
      return every(values(data), ({ brightness }) => {
        return brightness >= 0 && brightness <= 1;
      });
    },
    createErrorMaker(ErrorType.INCOMPATIBLE_BRIGHTNESS_VALUE),
    undefined,
  ],
  [
    ({ data }) => {
      return every(values(data), ({ contrast }) => {
        return contrast >= 0 && contrast <= 1;
      });
    },
    createErrorMaker(ErrorType.INCOMPATIBLE_CONTRAST_VALUE),
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
