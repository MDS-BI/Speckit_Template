function documentSummary(document, config) {
  const parts = [];
  if (document.series) parts.push(document.series);
  if (document.folio !== undefined && document.folio !== '') parts.push(`#${document.folio}`);
  return parts.join(' ');
}

export function renderDocumentList(container, documents, entities, { config, onEdit, onDelete, filterEntityId } = {}) {
  if (!container) return;
  container.textContent = '';
  const labels = config.labels || {};
  const filtered = Array.isArray(documents)
    ? documents.filter((document) => !filterEntityId || document.entity_id === filterEntityId)
    : [];

  if (filtered.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'empty-state';
    empty.textContent = `No hay ${(labels.documents || 'documentos').toLowerCase()} todavía.`;
    container.append(empty);
    return;
  }

  const groups = new Map();
  for (const document of filtered) {
    if (!groups.has(document.entity_id)) groups.set(document.entity_id, []);
    groups.get(document.entity_id).push(document);
  }

  for (const [entityId, group] of groups) {
    const entity = (entities || []).find((item) => item.entity_id === entityId);
    const section = document.createElement('section');
    section.className = 'document-group';

    const heading = document.createElement('h3');
    heading.textContent = entity ? entity.name : entityId;
    section.append(heading);

    const list = document.createElement('ul');
    list.className = 'record-list document-list';

    for (const documentRecord of group) {
      const item = document.createElement('li');
      item.className = 'record-card';
      item.dataset.id = documentRecord.document_id;

      const title = document.createElement('h4');
      title.className = 'record-title';
      title.textContent = documentSummary(documentRecord, config) || documentRecord.document_id;
      item.append(title);

      if (documentRecord.status) {
        const status = document.createElement('p');
        status.className = 'record-status';
        status.textContent = `Estado: ${documentRecord.status}`;
        item.append(status);
      }

      if (documentRecord.startDate || documentRecord.endDate) {
        const dates = document.createElement('p');
        dates.className = 'record-date';
        dates.textContent = `${documentRecord.startDate || ''} → ${documentRecord.endDate || ''}`;
        item.append(dates);
      }

      if (documentRecord.totalAmount !== undefined && documentRecord.totalAmount !== '') {
        const total = document.createElement('p');
        total.className = 'record-total';
        total.textContent = `Total: ${documentRecord.totalAmount}${documentRecord.currency ? ` ${documentRecord.currency}` : ''}`;
        item.append(total);
      }

      if (documentRecord.notes) {
        const notes = document.createElement('p');
        notes.className = 'record-notes';
        notes.textContent = documentRecord.notes;
        item.append(notes);
      }

      for (const field of (config.customFields || []).filter((entry) => entry.target === 'document')) {
        const value = documentRecord.customFields ? documentRecord.customFields[field.key] : undefined;
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
      edit.dataset.action = 'edit';
      edit.dataset.id = documentRecord.document_id;
      edit.onclick = () => onEdit && onEdit(documentRecord.document_id);

      const remove = document.createElement('button');
      remove.type = 'button';
      remove.textContent = 'Eliminar';
      remove.dataset.action = 'delete';
      remove.dataset.id = documentRecord.document_id;
      remove.onclick = () => onDelete && onDelete(documentRecord.document_id);

      actions.append(edit, remove);
      item.append(actions);
      list.append(item);
    }

    section.append(list);
    container.append(section);
  }
}
