import { describe, expect, it } from 'vitest';
import { normalizeConfig } from '../../src/module-config.js';
import {
  addEntity,
  loadEntities,
  saveEntities,
  updateEntity,
  ValidationFailure
} from '../../src/storage.js';

const config = normalizeConfig({
  moduleName: 'ERP Base',
  customFields: [{ target: 'entity', key: 'priority', label: 'Prioridad', type: 'number' }]
}).config;

describe('storage de entidades', () => {
  it('crea una entidad con identificadores y timestamps', () => {
    const entity = addEntity({ name: 'Acme', code: 'AC-1' }, config);
    expect(entity.entity_id).toBeTruthy();
    expect(entity.id).toBe(entity.entity_id);
    expect(entity.createdAt).toBeTruthy();
    expect(entity.updatedAt).toBeTruthy();
    expect(loadEntities()).toHaveLength(1);
  });

  it('persiste en la clave erp.entities de localStorage', () => {
    addEntity({ name: 'Acme', code: 'AC-1' }, config);
    const raw = JSON.parse(localStorage.getItem('erp.entities'));
    expect(raw[0].name).toBe('Acme');
  });

  it('preserva campos personalizados y claves desconocidas', () => {
    const entity = addEntity(
      { name: 'Acme', code: 'AC-1', customFields: { priority: 5 }, extra: 'kept' },
      config
    );
    expect(entity.customFields.priority).toBe(5);
    expect(entity.extra).toBe('kept');
    expect(loadEntities()[0].customFields.priority).toBe(5);
  });

  it('rechaza entidades sin nombre o código', () => {
    expect(() => addEntity({ name: '  ', code: '' }, config)).toThrow(ValidationFailure);
    try {
      addEntity({ name: '', code: '' }, config);
    } catch (error) {
      const fields = error.errors.map((item) => item.field);
      expect(fields).toContain('name');
      expect(fields).toContain('code');
    }
    expect(loadEntities()).toHaveLength(0);
  });

  it('rechaza códigos duplicados sin distinguir mayúsculas', () => {
    addEntity({ name: 'Acme', code: 'AC-1' }, config);
    expect(() => addEntity({ name: 'Otra', code: 'ac-1' }, config)).toThrow(ValidationFailure);
  });

  it('actualiza preservando createdAt y fusión de campos', () => {
    const entity = addEntity({ name: 'Acme', code: 'AC-1', customFields: { priority: 1 } }, config);
    const updated = updateEntity(entity.entity_id, { name: 'Acme Renombrada' }, config);
    expect(updated.name).toBe('Acme Renombrada');
    expect(updated.createdAt).toBe(entity.createdAt);
    expect(updated.customFields.priority).toBe(1);
  });

  it('saveEntities rechaza valores que no son listas', () => {
    expect(() => saveEntities('nope')).toThrow(ValidationFailure);
  });
});
