import { isBlank } from '../utils.js';

const BASE_FIELDS = [
  'name',
  'code',
  'taxId',
  'email',
  'phone',
  'address',
  'category',
  'description',
  'targetDate',
  'creditLimit',
  'paymentTerms'
];

let config = null;
let onSubmit = null;
let editingId = null;

function formElement() {
  return document.getElementById('entity-form');
}

function customContainer() {
  return document.getElementById('custom-entity-fields');
}

function renderCustomFields() {
  const container = customContainer();
  if (!container) return;
  container.textContent = '';
  const fields = (config.customFields || []).filter((field) => field.target === 'entity');

  for (const field of fields) {
    const wrapper = document.createElement('div');
    wrapper.className = 'form-field';

    const label = document.createElement('label');
    label.htmlFor = `custom-entity-${field.key}`;
    label.textContent = field.required ? `${field.label} *` : field.label;

    let input;
    if (field.type === 'select') {
      input = document.createElement('select');
      const placeholder = document.createElement('option');
      placeholder.value = '';
      placeholder.textContent = 'Seleccione...';
      input.append(placeholder);
      for (const option of field.options || []) {
        const optionElement = document.createElement('option');
        optionElement.value = option;
        optionElement.textContent = option;
        input.append(optionElement);
      }
    } else {
      input = document.createElement('input');
      input.type = field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text';
    }

    input.id = `custom-entity-${field.key}`;
    input.name = `custom-${field.key}`;
    input.dataset.customKey = field.key;
    if (field.required) input.setAttribute('aria-required', 'true');

    const error = document.createElement('div');
    error.className = 'error';
    error.id = `error-custom-entity-${field.key}`;

    wrapper.append(label, input, error);
    container.append(wrapper);
  }
}

function clearErrors() {
  const form = formElement();
  if (!form) return;
  form.querySelectorAll('.error').forEach((element) => {
    element.textContent = '';
    element.classList.remove('visible');
  });
  form.querySelectorAll('[aria-invalid="true"]').forEach((element) => {
    element.removeAttribute('aria-invalid');
  });
}

function errorElement(field) {
  if (field.startsWith('customFields.')) {
    return document.getElementById(`error-custom-entity-${field.slice('customFields.'.length)}`);
  }
  return document.getElementById(`error-${field}`);
}

function inputElement(field) {
  if (field.startsWith('customFields.')) {
    const key = field.slice('customFields.'.length);
    const container = customContainer();
    if (!container) return null;
    return Array.from(container.querySelectorAll('[data-custom-key]')).find(
      (element) => element.dataset.customKey === key
    );
  }
  return document.getElementById(field);
}

export function initEntityForm({ config: nextConfig, onSubmit: handler }) {
  config = nextConfig;
  onSubmit = handler;
  editingId = null;
  renderCustomFields();
  clearErrors();

  const form = formElement();
  if (form) {
    form.onsubmit = (event) => {
      event.preventDefault();
      if (onSubmit) onSubmit(readEntityForm(), editingId);
    };
  }
}

export function readEntityForm() {
  const values = {};
  for (const field of BASE_FIELDS) {
    const element = document.getElementById(field);
    const value = element ? element.value : '';
    if (!isBlank(value)) values[field] = value;
  }

  const customValues = {};
  const container = customContainer();
  if (container) {
    for (const element of container.querySelectorAll('[data-custom-key]')) {
      if (!isBlank(element.value)) customValues[element.dataset.customKey] = element.value;
    }
  }
  values.customFields = customValues;
  return values;
}

export function setEntityFormEntity(entity) {
  editingId = entity ? entity.entity_id || entity.id || null : null;
  const form = formElement();
  if (!form || !entity) return;
  clearErrors();

  for (const field of BASE_FIELDS) {
    const element = document.getElementById(field);
    if (element) element.value = entity[field] ?? '';
  }

  const container = customContainer();
  if (container) {
    const values = entity.customFields || {};
    for (const element of container.querySelectorAll('[data-custom-key]')) {
      element.value = values[element.dataset.customKey] ?? '';
    }
  }
}

export function resetEntityForm() {
  editingId = null;
  const form = formElement();
  if (form) form.reset();
  const container = customContainer();
  if (container) {
    for (const element of container.querySelectorAll('[data-custom-key]')) {
      element.value = '';
    }
  }
  clearErrors();
}

export function showEntityErrors(errors) {
  clearErrors();
  for (const error of errors) {
    const target = errorElement(error.field);
    if (target) {
      target.textContent = error.message;
      target.classList.add('visible');
    }
    const input = inputElement(error.field);
    if (input) input.setAttribute('aria-invalid', 'true');
  }
}

export function getEditingEntityId() {
  return editingId;
}

export function focusEntityForm() {
  const name = document.getElementById('name');
  if (name) name.focus();
}
