import { getConfig, setActiveConfig, labelFor } from './module-config.js';
import { loadEntities, loadDocuments, addEntity, updateEntity, deleteEntity, addDocument, updateDocument, deleteDocument, searchEntities } from './storage.js';

let currentModule = 'dashboard';
let editingEntityId = null;
let editingDocumentId = null;

function qs(id){ return document.getElementById(id); }

function renderBrand() {
  const cfg = getConfig();
  qs('brand-name').textContent = cfg.moduleName || 'ERP Base';
  const logo = qs('brand-logo');
  logo.innerHTML = '';
  const initials = (cfg.moduleName || 'ERP').split(' ').map(x=>x[0]).join('').substring(0,2).toUpperCase();
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '32');
  svg.setAttribute('height', '32');
  const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  rect.setAttribute('width', '32');
  rect.setAttribute('height', '32');
  rect.setAttribute('fill', cfg.theme && cfg.theme.accentColor ? cfg.theme.accentColor : 'var(--accent-color)');
  const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  text.setAttribute('x', '16');
  text.setAttribute('y', '20');
  text.setAttribute('text-anchor', 'middle');
  text.setAttribute('fill', 'white');
  text.setAttribute('font-size', '12');
  text.textContent = initials;
  svg.appendChild(rect);
  svg.appendChild(text);
  logo.appendChild(svg);
}

function renderLabels() {
  const cfg = getConfig();
  qs('nav-entities').textContent = cfg.labels.entities || 'Entidades';
  qs('nav-documents').textContent = cfg.labels.documents || 'Documentos';
  qs('nav-dashboard').textContent = 'Panel';
  qs('nav-search').textContent = 'Buscar';
  qs('entities-title').textContent = cfg.labels.entities || 'Entidades';
  qs('documents-title').textContent = cfg.labels.documents || 'Documentos';
  qs('search-title').textContent = 'Buscar';
  qs('stat-entities-label').textContent = cfg.labels.entities || 'Entidades';
  qs('stat-documents-label').textContent = cfg.labels.documents || 'Documentos';
}

function showModule(module) {
  currentModule = module;
  document.querySelectorAll('.view').forEach(v => v.hidden = true);
  if (module === 'dashboard') qs('view-dashboard').hidden = false;
  if (module === 'entities') qs('view-entities').hidden = false;
  if (module === 'documents') qs('view-documents').hidden = false;
  if (module === 'search') qs('view-search').hidden = false;
  document.querySelectorAll('.nav-item').forEach(b => b.classList.toggle('active', b.dataset.module === module));
  if (module === 'dashboard') refreshDashboard();
  if (module === 'entities') { populateEntitySelect(); renderEntityList(); }
  if (module === 'documents') { populateDocumentEntitySelect(); populateDocumentSelect(); renderDocumentList(); renderStatusOptions(); }
  if (module === 'search') { qs('search-input').focus(); renderSearch(''); }
}

function refreshDashboard() {
  const entities = loadEntities();
  const documents = loadDocuments();
  qs('stat-entities').textContent = entities.length;
  qs('stat-documents').textContent = documents.length;
}

function populateEntitySelect() {
  const select = qs('edit-entity');
  select.innerHTML = '';
  for (const e of loadEntities()) {
    const opt = document.createElement('option');
    opt.value = e.id;
    opt.textContent = e.name + ' - ' + e.code;
    select.appendChild(opt);
  }
}

function renderEntityList() {
  const list = qs('entity-list');
  list.innerHTML = '';
  for (const e of loadEntities()) {
    const div = document.createElement('div');
    div.className = 'entity-item';
    div.textContent = (e.name||'') + ' (' + (e.code||'') + ')';
    list.appendChild(div);
  }
}

function populateDocumentEntitySelect() {
  const select = qs('document-entity');
  select.innerHTML = '';
  for (const e of loadEntities()) {
    const opt = document.createElement('option');
    opt.value = e.entity_id;
    opt.textContent = e.name + ' - ' + e.code;
    select.appendChild(opt);
  }
}

function populateDocumentSelect() {
  const select = qs('edit-document');
  select.innerHTML = '';
  for (const d of loadDocuments()) {
    const opt = document.createElement('option');
    opt.value = d.id;
    opt.textContent = (d.series||'') + '-' + d.folio + ' (' + d.entity_id + ')';
    select.appendChild(opt);
  }
}

function renderDocumentList() {
  const list = qs('document-list');
  list.innerHTML = '';
  for (const d of loadDocuments()) {
    const div = document.createElement('div');
    div.className = 'document-item';
    div.textContent = (d.series||'') + '-' + d.folio + ' ' + d.status;
    list.appendChild(div);
  }
}

function renderStatusOptions() {
  const cfg = getConfig();
  const select = qs('status');
  const free = qs('status-free');
  select.innerHTML = '';
  if (cfg.statusLifecycle && Array.isArray(cfg.statusLifecycle.statuses)) {
    select.style.display = 'inline-block';
    free.style.display = 'none';
    for (const s of cfg.statusLifecycle.statuses) {
      const opt = document.createElement('option');
      opt.value = s;
      opt.textContent = s;
      select.appendChild(opt);
    }
  } else {
    select.style.display = 'none';
    free.style.display = 'inline-block';
  }
}

function renderSearch(term) {
  const results = qs('search-results');
  const empty = qs('search-empty');
  results.innerHTML = '';
  const res = searchEntities(term);
  if (res.length === 0) {
    empty.hidden = false;
  } else {
    empty.hidden = true;
    for (const e of res) {
      const div = document.createElement('div');
      div.textContent = e.name + ' - ' + e.code;
      results.appendChild(div);
    }
  }
}

export async function initApp(cfg) {
  try {
    if (cfg) {
      try { if (typeof globalThis !== 'undefined') globalThis.__ERP_CONFIG__ = cfg; } catch(e){}
      if (typeof setActiveConfig === 'function') setActiveConfig(cfg);
    }
  } catch (e) {}
  try {
    const c = typeof getConfig === 'function' ? getConfig() : cfg;
    const accent = c && c.theme && c.theme.accentColor;
    if (accent && typeof document !== 'undefined' && document.documentElement) {
      document.documentElement.style.setProperty('--accent', accent);
      document.documentElement.style.setProperty('--accent-color', accent);
    }
  } catch (e) {}
  return boot();
}

export async function boot() {
  try {
    const c = typeof getConfig === 'function' ? getConfig() : null;
    const accent = c && c.theme && c.theme.accentColor;
    if (accent && typeof document !== 'undefined' && document.documentElement) {
      document.documentElement.style.setProperty('--accent', accent);
      document.documentElement.style.setProperty('--accent-color', accent);
    } else if (typeof document !== 'undefined' && document.documentElement) {
      try { document.documentElement.style.setProperty('--accent', '#2563eb'); document.documentElement.style.setProperty('--accent-color', '#2563eb'); } catch(e){}
    }
  } catch (e) {}
  setActiveConfig(null);
  renderBrand();
  renderLabels();
  // nav
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => showModule(btn.dataset.module));
  });
  // dashboard actions
  qs('qa-new-entity').addEventListener('click', () => { showModule('entities'); });
  qs('qa-new-document').addEventListener('click', () => { showModule('documents'); });
  qs('qa-manage-entities').addEventListener('click', () => { showModule('entities'); });
  qs('qa-search').addEventListener('click', () => { showModule('search'); qs('search-input').focus(); });
  // entity form
  qs('entity-form').addEventListener('submit', (ev) => {
    ev.preventDefault();
    // clear errors
    document.querySelectorAll('#view-entities .error').forEach(e => e.textContent = '');
    const data = {
      name: qs('name').value,
      code: qs('code').value,
      taxId: qs('taxId').value,
      email: qs('email').value,
      phone: qs('phone').value,
      address: qs('address').value,
      category: qs('category').value,
      description: qs('description').value,
      targetDate: qs('targetDate').value,
      creditLimit: qs('creditLimit').value,
      paymentTerms: qs('paymentTerms').value
    };
    try {
      if (editingEntityId) {
        updateEntity(editingEntityId, data);
        editingEntityId = null;
      } else {
        addEntity(data);
      }
      qs('entity-form').reset();
      populateEntitySelect();
      renderEntityList();
      refreshDashboard();
    } catch (err) {
      if (err.errors) {
        for (const k of Object.keys(err.errors)) {
          if (k === 'email') {
            const el = qs('error-email');
            if (el) { el.textContent = err.errors[k]; continue; }
          }
          const el = qs('error-' + k);
          if (el) el.textContent = err.errors[k];
        }
      } else {
        alert(err.message);
      }
    }
  });
  qs('load-entity').addEventListener('click', () => {
    const id = qs('edit-entity').value;
    const e = loadEntities().find(x => x.id === id);
    if (!e) return;
    editingEntityId = e.id;
    qs('name').value = e.name || '';
    qs('code').value = e.code || '';
    qs('taxId').value = e.taxId || '';
    qs('email').value = e.email || '';
    qs('phone').value = e.phone || '';
    qs('address').value = e.address || '';
    qs('category').value = e.category || '';
    qs('description').value = e.description || '';
    qs('targetDate').value = e.targetDate || '';
    qs('creditLimit').value = e.creditLimit !== undefined ? e.creditLimit : '';
    qs('paymentTerms').value = e.paymentTerms || '';
  });
  qs('delete-entity').addEventListener('click', () => {
    const id = qs('edit-entity').value;
    if (confirm('Eliminar?')) {
      deleteEntity(id);
      populateEntitySelect();
      renderEntityList();
      populateDocumentEntitySelect();
      populateDocumentSelect();
      renderDocumentList();
      refreshDashboard();
    }
  });
  // document form
  qs('document-form').addEventListener('submit', (ev) => {
    ev.preventDefault();
    document.querySelectorAll('#view-documents .error').forEach(e => e.textContent = '');
    const cfg = getConfig();
    let statusVal = qs('status-free').value;
    if (cfg.statusLifecycle && Array.isArray(cfg.statusLifecycle.statuses)) {
      statusVal = qs('status').value;
    }
    const data = {
      entity_id: qs('document-entity').value,
      series: qs('series').value,
      folio: qs('folio').value,
      startDate: qs('startDate').value,
      endDate: qs('endDate').value,
      quantity: qs('quantity').value,
      subtotal: qs('subtotal').value,
      discount: qs('discount').value,
      taxAmount: qs('taxAmount').value,
      totalAmount: qs('totalAmount').value,
      currency: qs('currency').value,
      paymentTerms: qs('docPaymentTerms').value,
      notes: qs('notes').value,
      status: statusVal
    };
    try {
      if (editingDocumentId) {
        updateDocument(editingDocumentId, data);
        editingDocumentId = null;
      } else {
        addDocument(data);
      }
      qs('document-form').reset();
      populateDocumentSelect();
      renderDocumentList();
      refreshDashboard();
    } catch (err) {
      if (err.errors) {
        for (const k of Object.keys(err.errors)) {
          if (k === 'entity_id') { const el = qs('error-document-entity'); if (el) el.textContent = err.errors[k]; continue; }
          const el = qs('error-' + k);
          if (el) el.textContent = err.errors[k];
        }
      } else {
        alert(err.message);
      }
    }
  });
  qs('load-document').addEventListener('click', () => {
    const id = qs('edit-document').value;
    const d = loadDocuments().find(x => x.id === id);
    if (!d) return;
    editingDocumentId = d.id;
    qs('document-entity').value = d.entity_id || '';
    qs('series').value = d.series || '';
    qs('folio').value = d.folio || '';
    qs('startDate').value = d.startDate || '';
    qs('endDate').value = d.endDate || '';
    qs('quantity').value = d.quantity !== undefined ? d.quantity : '';
    qs('subtotal').value = d.subtotal !== undefined ? d.subtotal : '';
    qs('discount').value = d.discount !== undefined ? d.discount : '';
    qs('taxAmount').value = d.taxAmount !== undefined ? d.taxAmount : '';
    qs('totalAmount').value = d.totalAmount !== undefined ? d.totalAmount : '';
    qs('currency').value = d.currency || '';
    qs('docPaymentTerms').value = d.paymentTerms || '';
    qs('notes').value = d.notes || '';
    const cfg = getConfig();
    if (cfg.statusLifecycle && Array.isArray(cfg.statusLifecycle.statuses)) {
      qs('status').value = d.status || '';
    } else {
      qs('status-free').value = d.status || '';
    }
  });
  qs('delete-document').addEventListener('click', () => {
    const id = qs('edit-document').value;
    if (confirm('Eliminar?')) {
      deleteDocument(id);
      populateDocumentSelect();
      renderDocumentList();
      refreshDashboard();
    }
  });
  // search
  qs('search-input').addEventListener('input', (e) => {
    renderSearch(e.target.value);
  });
  // initial
  populateEntitySelect();
  populateDocumentEntitySelect();
  populateDocumentSelect();
  renderStatusOptions();
  renderEntityList();
  renderDocumentList();
  refreshDashboard();
  showModule('dashboard');
}
