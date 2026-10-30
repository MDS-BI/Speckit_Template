import { describe, expect, it } from 'vitest';
import { validateDocument } from '../../src/validation.js';

const config = { customFields: [], statusLifecycle: null };
const entities = [{ entity_id: 'ent_1' }];
const base = {
  entity_id: 'ent_1',
  folio: 10,
  startDate: '2026-01-01',
  endDate: '2026-01-31'
};

describe('validación detallada de documentos', () => {
  it('acepta un documento válido', () => {
    const errors = validateDocument(
      { ...base, quantity: 2, subtotal: 100, discount: 10, taxAmount: 5, totalAmount: 95 },
      { config, entities }
    );
    expect(errors).toEqual([]);
  });

  it('exige folio entero positivo', () => {
    expect(validateDocument({ ...base, folio: 1.5 }, { config, entities }).some((error) => error.code === 'INVALID_FOLIO')).toBe(true);
    expect(validateDocument({ ...base, folio: 'abc' }, { config, entities }).some((error) => error.code === 'INVALID_FOLIO')).toBe(true);
  });

  it('exige cantidad entera positiva cuando está presente', () => {
    expect(validateDocument({ ...base, quantity: 0 }, { config, entities }).some((error) => error.code === 'INTEGER_REQUIRED')).toBe(true);
    expect(validateDocument({ ...base, quantity: 2.5 }, { config, entities }).some((error) => error.code === 'INTEGER_REQUIRED')).toBe(true);
  });

  it('rechaza importes negativos y no numéricos', () => {
    const negative = validateDocument({ ...base, subtotal: -1 }, { config, entities });
    expect(negative.some((error) => error.code === 'NEGATIVE_NOT_ALLOWED')).toBe(true);
    const invalid = validateDocument({ ...base, totalAmount: 'abc' }, { config, entities });
    expect(invalid.some((error) => error.code === 'INVALID_NUMBER')).toBe(true);
  });

  it('rechaza fechas con formato inválido', () => {
    const errors = validateDocument({ ...base, startDate: '2026-02-30' }, { config, entities });
    expect(errors.some((error) => error.code === 'INVALID_DATE')).toBe(true);
  });
});
