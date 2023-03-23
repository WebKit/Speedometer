import { helper } from '@ember/component/helper';
import { pluralize } from 'ember-inflector';

export function pluralizeHelper([singular, count]) {
  return count === 1 ? singular : pluralize(singular);
}

export default helper(pluralizeHelper);
