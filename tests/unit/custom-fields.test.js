import { describe, expect, it } from 'vitest';
import { normalizeConfig } from '../../src/module-config.js';
import { addEntity, loadEntities } from '../../src/storage.js';
import { validateCustomFields } from '../../src/validation.js';

const { config } = normalizeConfig({
  moduleName: 'X',
  customFields: [
    { target: 'entity', key: 'priority', label: 'Prioridad', type: 'number', required: true },
    { target: 'entity', key: 'due', label: 'Vence', type: 'date' },
    { target: 'entity', key: 'segment', label: 'Segmento', type: 'select', options: ['A', 'B'] },
    { target: 'document', key: 'reference', label: 'Referencia', type: 'text', required: true }
  ]
});

describe('campos personalizados', () => {
  it('exige los campos requeridos', () => {
    const errors = validateCustomFields({ customFields: {} }, 'entity', config);
    expect(errors[0].code).toBe('REQUIRED');
    expect(errors[0].field).toBe('customFields.priority');
  });

  it('valida número, fecha y select', () => {
    const errors = validateCustomFields(
      { customFields: { priority: 'abc', due: '2026-99-99', segment: 'Z' } },
      'entity',
      config
    );
    const codes = errors.map((error) => error.code);
    expect(codes).toContain('INVALID_NUMBER');
    expect(codes).toContain('INVALID_DATE');
    expect(codes).toContain('INVALID_FORMAT');
  });

  it('separa campos por target', () => {
    const entityErrors = validateCustomFields({ customFields: {} }, 'entity', config);
    expect(entityErrors.some((error) => error.field === 'customFields.reference')).toBe(false);
    const documentErrors = validateCustomFields({ customFields: {} }, 'document', config);
    expect(documentErrors.some((error) => error.field === 'customFields.reference')).toBe(true);
  });

  it('persiste los valores de campos personalizados', () => {
    addEntity({ name: 'Acme', code: 'AC-1', customFields: { priority: '3' } }, config);
    expect(loadEntities()[0].customFields.priority).toBe('3');
  });
});
