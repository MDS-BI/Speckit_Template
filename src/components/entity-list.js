export function renderEntityList(container, entities, { config, onEdit, onDelete }) {
  if (!container) return;
  container.textContent = '';
  const labels = config.labels || {};

  if (!entities || entities.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'empty-state';
    empty.textContent = `No hay ${(labels.entities || 'entidades').toLowerCase()} todavía.`;
    container.append(empty);
    return;
  }

  const list = document.createElement('ul');
  list.className = 'record-list entity-list';
  const customFields = (config.customFields || []).filter((field) => field.target === 'entity');
  const entityLabel = labels.entity || 'Entidad';

  for (const entity of entities) {
    const item = document.createElement('li');
    item.className = 'record-card';
    item.setAttribute('data-id', entity.entity_id || '');

    const title = document.createElement('h3');
    title.className = 'record-title';
    title.textContent = entity.name || '(sin nombre)';
    item.append(title);

    const code = document.createElement('p');
    code.className = 'record-code';
    code.textContent = `${entityLabel}: ${entity.code || ''}`;
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

    for (const field of customFields) {
      const value = entity.customFields ? entity.customFields[field.key] : undefined;
      if (value === undefined || value === null || value === '') continue;
      const paragraph = document.createElement('p');
      paragraph.className = 'record-custom-field';
      paragraph.textContent = `${field.label}: ${value}`;
      item.append(paragraph);
    }

    const actions = document.createElement('div');
    actions.className = 'record-actions';

    const edit = document.createElement('button');
    edit.type = 'button';
    edit.textContent = 'Editar';
    edit.setAttribute('data-action', 'edit');

    const remove = document.createElement('button');
    remove.type = 'button';
    remove.textContent = 'Eliminar';
    remove.setAttribute('data-action', 'delete');

    actions.append(edit, remove);
    item.append(actions);
    list.append(item);
  }

  list.onclick = (event) => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;
    const card = button.closest('.record-card');
    const id = card ? card.getAttribute('data-id') : null;
    if (button.getAttribute('data-action') === 'edit') {
      if (onEdit) onEdit(id);
    } else if (button.getAttribute('data-action') === 'delete') {
      if (onDelete) onDelete(id);
    }
  };
  container.append(list);
}
