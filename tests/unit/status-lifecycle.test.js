import { describe, expect, it } from 'vitest';
import { allowedNextStatuses, validateDocument } from '../../src/validation.js';

const lifecycle = {
  statuses: ['Borrador', 'Aprobado', 'Pagado'],
  transitions: {
    Borrador: ['Aprobado'],
    Aprobado: ['Pagado'],
    Pagado: []
  }
};
const config = { customFields: [], statusLifecycle: lifecycle };
const entities = [{ entity_id: 'ent_1' }];
const base = {
  entity_id: 'ent_1',
  folio: 1,
  startDate: '2026-01-01',
  endDate: '2026-01-02'
};

describe('ciclo de vida de estados', () => {
  it('permite todos los estados al crear', () => {
    expect(allowedNextStatuses(lifecycle, null)).toEqual(['Borrador', 'Aprobado', 'Pagado']);
  });

  it('solo ofrece el estado actual y los siguientes permitidos', () => {
    expect(allowedNextStatuses(lifecycle, 'Borrador')).toEqual(['Borrador', 'Aprobado']);
    expect(allowedNextStatuses(lifecycle, 'Aprobado')).toEqual(['Aprobado', 'Pagado']);
  });

  it('rechaza una transición no permitida', () => {
    const errors = validateDocument(
      { ...base, status: 'Pagado', previousStatus: 'Borrador' },
      { config, entities, previousStatus: 'Borrador' }
    );
    expect(errors.some((error) => error.code === 'INVALID_TRANSITION')).toBe(true);
  });

  it('acepta una transición permitida', () => {
    const errors = validateDocument(
      { ...base, status: 'Aprobado' },
      { config, entities, previousStatus: 'Borrador' }
    );
    expect(errors).toEqual([]);
  });

  it('permite estado de texto libre sin ciclo configurado', () => {
    const errors = validateDocument(
      { ...base, status: 'Estado inventado' },
      { config: { customFields: [], statusLifecycle: null }, entities }
    );
    expect(errors).toEqual([]);
  });
});
