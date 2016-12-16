import {
  getDisplayNameForCategory,
  getDisplayNameForIndication,
  getDisplayNameForSeverity,
} from 'analyses/helpers';


export const mapSeverityToString = getDisplayNameForSeverity;

export const mapIndicationToString = getDisplayNameForIndication;

export const mapCategoryToString = getDisplayNameForCategory;
