import { isBlank, isValidDate, normalizeText } from './utils.js';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function makeError(field, code, message, context) {
  const result = { field, code, message };
  if (context !== undefined) result.context = context;
  return result;
}

function toNumber(value) {
  if (typeof value === 'number') return value;
  if (isBlank(value)) return NaN;
  return Number(value);
}

function isPositiveInteger(value) {
  const number = toNumber(value);
  return Number.isInteger(number) && number > 0;
}

export function validateCustomFields(record, target, config = {}) {
  const errors = [];
  const fields = (config.customFields || []).filter((field) => field.target === target);
  const values = record.customFields && typeof record.customFields === 'object' ? record.customFields : {};

  for (const field of fields) {
    const value = values[field.key];
    if (field.required && isBlank(value)) {
      errors.push(makeError(`customFields.${field.key}`, 'REQUIRED', `${field.label} es obligatorio.`));
      continue;
    }
    if (isBlank(value)) continue;

    if (field.type === 'number' && !Number.isFinite(Number(value))) {
      errors.push(makeError(`customFields.${field.key}`, 'INVALID_NUMBER', `${field.label} debe ser un número válido.`));
    }
    if (field.type === 'date' && !isValidDate(String(value))) {
      errors.push(makeError(`customFields.${field.key}`, 'INVALID_DATE', `${field.label} debe usar el formato AAAA-MM-DD.`));
    }
    if (field.type === 'select' && Array.isArray(field.options) && !field.options.includes(String(value))) {
      errors.push(makeError(`customFields.${field.key}`, 'INVALID_FORMAT', `${field.label} debe ser una de las opciones permitidas.`));
    }
  }

  return errors;
}

export function validateEntity(entity, { config = {}, existing = [] } = {}) {
  const errors = [];

  if (isBlank(entity.name)) {
    errors.push(makeError('name', 'REQUIRED', 'El nombre es obligatorio.'));
  }
  if (isBlank(entity.code)) {
    errors.push(makeError('code', 'REQUIRED', 'El código es obligatorio.'));
  } else {
    const normalizedCode = normalizeText(entity.code);
    const duplicate = existing.some(
      (item) =>
        item &&
        item.entity_id !== entity.entity_id &&
        normalizeText(item.code) === normalizedCode
    );
    if (duplicate) {
      errors.push(makeError('code', 'DUPLICATE_CODE', 'El código ya está en uso por otra entidad.'));
    }
  }

  if (!isBlank(entity.email) && !EMAIL_PATTERN.test(String(entity.email).trim())) {
    errors.push(makeError('email', 'INVALID_EMAIL', 'El correo electrónico no tiene un formato válido.'));
  }

  if (!isBlank(entity.creditLimit)) {
    const creditLimit = toNumber(entity.creditLimit);
    if (!Number.isFinite(creditLimit)) {
      errors.push(makeError('creditLimit', 'INVALID_NUMBER', 'El límite de crédito debe ser un número.'));
    } else if (creditLimit < 0) {
      errors.push(makeError('creditLimit', 'NEGATIVE_NOT_ALLOWED', 'El límite de crédito no puede ser negativo.'));
    }
  }

  if (!isBlank(entity.targetDate) && !isValidDate(String(entity.targetDate))) {
    errors.push(makeError('targetDate', 'INVALID_DATE', 'La fecha objetivo debe usar el formato AAAA-MM-DD.'));
  }

  errors.push(...validateCustomFields(entity, 'entity', config));

  return errors;
}

export function validateDocument(document, { config = {}, entities = [], previousStatus } = {}) {
  const errors = [];
  const entityId = document.entity_id;

  if (isBlank(entityId)) {
    errors.push(makeError('entity_id', 'MISSING_ENTITY_REF', 'Debe seleccionar una entidad existente.'));
  } else if (!entities.some((entity) => entity.entity_id === entityId)) {
    errors.push(makeError('entity_id', 'MISSING_ENTITY_REF', 'La entidad seleccionada no existe.'));
  }

  if (isBlank(document.folio)) {
    errors.push(makeError('folio', 'REQUIRED', 'El folio es obligatorio.'));
  } else if (!isPositiveInteger(document.folio)) {
    errors.push(makeError('folio', 'INVALID_FOLIO', 'El folio debe ser un entero positivo.'));
  }

  const startValid = !isBlank(document.startDate) && isValidDate(String(document.startDate));
  if (isBlank(document.startDate)) {
    errors.push(makeError('startDate', 'REQUIRED', 'La fecha de inicio es obligatoria.'));
  } else if (!startValid) {
    errors.push(makeError('startDate', 'INVALID_DATE', 'La fecha de inicio debe usar el formato AAAA-MM-DD.'));
  }

  const endValid = !isBlank(document.endDate) && isValidDate(String(document.endDate));
  if (isBlank(document.endDate)) {
    errors.push(makeError('endDate', 'REQUIRED', 'La fecha de fin es obligatoria.'));
  } else if (!endValid) {
    errors.push(makeError('endDate', 'INVALID_DATE', 'La fecha de fin debe usar el formato AAAA-MM-DD.'));
  }

  if (startValid && endValid && String(document.endDate) < String(document.startDate)) {
    errors.push(makeError('endDate', 'END_BEFORE_START', 'La fecha de fin no puede ser anterior a la fecha de inicio.'));
  }

  if (!isBlank(document.quantity) && !isPositiveInteger(document.quantity)) {
    errors.push(makeError('quantity', 'INTEGER_REQUIRED', 'La cantidad debe ser un entero positivo.'));
  }

  for (const field of ['subtotal', 'discount', 'taxAmount', 'totalAmount']) {
    if (isBlank(document[field])) continue;
    const value = toNumber(document[field]);
    if (!Number.isFinite(value)) {
      errors.push(makeError(field, 'INVALID_NUMBER', 'El importe debe ser un número válido.'));
    } else if (value < 0) {
      errors.push(makeError(field, 'NEGATIVE_NOT_ALLOWED', 'El importe no puede ser negativo.'));
    }
  }

  if (!isBlank(document.subtotal) && !isBlank(document.discount)) {
    const subtotal = toNumber(document.subtotal);
    const discount = toNumber(document.discount);
    if (Number.isFinite(subtotal) && Number.isFinite(discount) && discount > subtotal) {
      errors.push(makeError('discount', 'DISCOUNT_EXCEEDS_SUBTOTAL', 'El descuento no puede superar el subtotal.'));
    }
  }

  const lifecycle = config.statusLifecycle;
  if (lifecycle && !isBlank(document.status)) {
    const status = String(document.status);
    if (!lifecycle.statuses.includes(status)) {
      errors.push(makeError('status', 'INVALID_FORMAT', 'El estado no pertenece al ciclo de vida configurado.'));
    } else if (previousStatus && previousStatus !== status) {
      const allowed = lifecycle.transitions[previousStatus] || [];
      if (!allowed.includes(status)) {
        errors.push(
          makeError('status', 'INVALID_TRANSITION', `No se permite pasar de "${previousStatus}" a "${status}".`)
        );
      }
    }
  }

  errors.push(...validateCustomFields(document, 'document', config));

  return errors;
}

export function allowedNextStatuses(lifecycle, previousStatus) {
  if (!lifecycle) return [];
  if (!previousStatus) return [...lifecycle.statuses];
  const allowed = lifecycle.transitions[previousStatus] || [];
  return lifecycle.statuses.filter((status) => status === previousStatus || allowed.includes(status));
}
