import { getSearchableValues, normalizeText } from './utils.js';

export function searchEntities(entities, term, config = {}) {
  const list = Array.isArray(entities) ? entities : [];
  const query = normalizeText(term);
  if (!query) return list.slice();

  return list.filter((entity) => {
    const values = getSearchableValues(entity);
    return values.some((value) => normalizeText(value).includes(query));
  });
}
