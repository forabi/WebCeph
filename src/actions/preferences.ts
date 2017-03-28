import { createActionCreator } from 'utils/store';

export const setUserPreferredLocale = createActionCreator('SET_USER_PREFERRED_LOCALE');
export const unsetUserPreferredLocale = createActionCreator('UNSET_USER_PREFERRED_LOCALE');

