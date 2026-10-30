export function initSearchBar({ config, onSearch }) {
  const input = document.getElementById('search-input');
  if (input) {
    input.oninput = () => onSearch(input.value);
  }
}

export function renderSearchResults(container, entities, { config, emptyElement, term } = {}) {
  if (!container) return;
  container.textContent = '';
  const labels = config.labels || {};

  if (!entities || entities.length === 0) {
    if (emptyElement) {
      emptyElement.hidden = false;
      emptyElement.textContent = term
        ? 'No hay resultados para esta búsqueda.'
        : `No hay ${(labels.entities || 'entidades').toLowerCase()} disponibles.`;
    }
    return;
  }

  if (emptyElement) emptyElement.hidden = true;

  const list = document.createElement('ul');
  list.className = 'record-list search-results-list';

  for (const entity of entities) {
    const item = document.createElement('li');
    item.className = 'record-card';
    item.dataset.id = entity.entity_id;

    const title = document.createElement('h3');
    title.className = 'record-title';
    title.textContent = entity.name || '(sin nombre)';
    item.append(title);

    const code = document.createElement('p');
    code.className = 'record-code';
    code.textContent = `${labels.entity || 'Entidad'}: ${entity.code || ''}`;
    item.append(code);

    if (entity.description) {
      const description = document.createElement('p');
      description.className = 'record-description';
      description.textContent = entity.description;
      item.append(description);
    }

    if (entity.targetDate) {
      const targetDate = document.createElement('p');
      targetDate.className = 'record-date';
      targetDate.textContent = `Fecha objetivo: ${entity.targetDate}`;
      item.append(targetDate);
    }

    for (const field of (config.customFields || []).filter((entry) => entry.target === 'entity')) {
      const value = entity.customFields ? entity.customFields[field.key] : undefined;
      if (value === undefined || value === null || value === '') continue;
      const paragraph = document.createElement('p');
      paragraph.className = 'record-custom-field';
      paragraph.textContent = `${field.label}: ${value}`;
      item.append(paragraph);
    }

    list.append(item);
  }

  container.append(list);
}

export function focusSearchInput() {
  const input = document.getElementById('search-input');
  if (input) input.focus();
}
