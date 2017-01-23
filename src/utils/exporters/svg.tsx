import zipObject from 'lodash/zipObject';
import map from 'lodash/map';
import pickBy from 'lodash/pickBy';

import * as React from 'react';
import { render } from 'react-dom';
import GeoViewer from 'components/GeoViewer';

import {
  getWorkspaceImageIds,
} from 'store/reducers/workspace';

import {
  getImageProps,
  getActiveImageId,
} from 'store/reducers/workspace/image';

import {
  getAllGeoObjects,
} from 'store/reducers/workspace/analyses';

const createExport: Exporter = async (state, options, _) => {
  let {
    imagesToSave = getWorkspaceImageIds(state),
    includeRasterImage = true,
    objectsToExport,
  } = options;

  const getObjectsByImageId = getAllGeoObjects(state);
  objectsToExport = zipObject(
    imagesToSave,
    imgId => pickBy(
      getObjectsByImageId(imgId),
      (_, symbol) => {
        return (
          typeof objectsToExport === 'undefined' || (
            typeof objectsToExport[imageId] !== 'undefined' &&
            objectsToExport[imageId][symbol] === true
          )
        );
      }
    ),
  );

  if (includeRasterImage && imagesToSave.length > 1) {
    // We do not support exporting more than one reference image
    throw new RangeError('Cannot export more than one image');
  }
  const getProps = getImageProps(state);
  const [imageId] = getActiveImageId(state) || getWorkspaceImageIds(state);
  const imageToExport = getProps(imageId);

  const fragment = new DocumentFragment();
  render(
    (
      <svg>
        {includeRasterImage ? <image xlinkHref={imageToExport.data} /> : null}
        {map(objectsToExport, (objects, imgId) => {
          <GeoViewer
            key={imgId}
            objects={objects}
            top={0}
            left={0}
            width={500}
            height={500}
          />
        })}
      </svg>
    ),
    fragment as Element,
  );
  const { serializeToString } = new XMLSerializer();
  const str = serializeToString(fragment);
  const basename = imageToExport.name || 'Exported image';
  return new File([str], `${basename}.svg`);
};

export default createExport;
