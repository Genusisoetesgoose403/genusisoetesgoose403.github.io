import { VIEWS as BASE_VIEWS } from '../views.js';
import { renderStudy } from './study.js';

export const VIEWS = {
  ...BASE_VIEWS,
  study: renderStudy
};
