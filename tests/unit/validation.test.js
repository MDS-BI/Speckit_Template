import { describe, expect, it } from 'vitest';
import { validateDocument, validateEntity } from '../../src/validation.js';

const config = { customFields: [], statusLifecycle: null };

describe('validación de entidades', () => {
  it('exige nombre y código', () => {
    const errors = validateEntity({ name: '', code: '  ' }, { config });
    expect(errors.map((error) => error.field)).toEqual(expect.arrayContaining(['name', 'code']));
  });

  it('valida email, crédito y fecha objetivo', () => {
    const errors = validateEntity(
      { name: 'Acme', code: 'AC-1', email: 'nope', creditLimit: -1, targetDate: '2026-13-01' },
      { config }
    );
    const codes = errors.map((error) => error.code);
    expect(codes).toContain('INVALID_EMAIL');
    expect(codes).toContain('NEGATIVE_NOT_ALLOWED');
    expect(codes).toContain('INVALID_DATE');
  });

  it('detecta código duplicado', () => {
    const errors = validateEntity(
      { name: 'Acme', code: 'AC-1' },
      { config, existing: [{ entity_id: 'other', code: 'ac-1' }] }
    );
    expect(errors.some((error) => error.code === 'DUPLICATE_CODE')).toBe(true);
  });
});

describe('validación de documentos', () => {
  const entities = [{ entity_id: 'ent_1' }];

  it('valida folio y fechas obligatorias', () => {
    const errors = validateDocument({ entity_id: 'ent_1', folio: 0 }, { config, entities });
    const fields = errors.map((error) => error.field);
    expect(fields).toContain('folio');
    expect(fields).toContain('startDate');
    expect(fields).toContain('endDate');
  });

  it('detecta fecha final anterior a la inicial', () => {
    const errors = validateDocument(
      {
        entity_id: 'ent_1',
        folio: 1,
        startDate: '2026-02-01',
        endDate: '2026-01-01'
      },
      { config, entities }
    );
    expect(errors.some((error) => error.code === 'END_BEFORE_START')).toBe(true);
  });

  it('detecta descuento mayor que el subtotal', () => {
    const errors = validateDocument(
      {
        entity_id: 'ent_1',
        folio: 1,
        startDate: '2026-01-01',
        endDate: '2026-01-02',
        subtotal: 10,
        discount: 20
      },
      { config, entities }
    );
    expect(errors.some((error) => error.code === 'DISCOUNT_EXCEEDS_SUBTOTAL')).toBe(true);
  });

  it('detecta entidad inexistente', () => {
    const errors = validateDocument(
      { entity_id: 'missing', folio: 1, startDate: '2026-01-01', endDate: '2026-01-02' },
      { config, entities }
    );
    expect(errors.some((error) => error.code === 'MISSING_ENTITY_REF')).toBe(true);
  });
});
