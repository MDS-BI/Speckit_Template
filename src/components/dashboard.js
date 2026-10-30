import { loadDocuments, loadEntities } from '../storage.js';

function setText(id, value) {
  const element = document.getElementById(id);
  if (element) element.textContent = value;
}

export function initDashboard({ config, onAction }) {
  setText('dashboard-title', config.labels.dashboard || 'Panel');
  setText('stat-entities-label', config.labels.entities || 'Entidades');
  setText('stat-documents-label', config.labels.documents || 'Documentos');

  const newEntity = document.getElementById('qa-new-entity');
  const newDocument = document.getElementById('qa-new-document');
  const manageEntities = document.getElementById('qa-manage-entities');

  if (newEntity) newEntity.textContent = `Nueva ${(config.labels.entity || 'Entidad').toLowerCase()}`;
  if (newDocument) newDocument.textContent = `Nuevo ${(config.labels.document || 'Documento').toLowerCase()}`;
  if (manageEntities) {
    manageEntities.textContent = `Abrir gestión de ${(config.labels.entities || 'Entidades').toLowerCase()}`;
  }

  const bindings = [
    ['qa-new-entity', 'new-entity'],
    ['qa-new-document', 'new-document'],
    ['qa-manage-entities', 'manage-entities'],
    ['qa-search', 'search']
  ];

  for (const [id, action] of bindings) {
    const button = document.getElementById(id);
    if (button) button.onclick = () => onAction(action);
  }
}

export function refreshDashboard() {
  setText('stat-entities', String(loadEntities().length));
  setText('stat-documents', String(loadDocuments().length));
}
