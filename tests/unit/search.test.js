import { describe, expect, it } from 'vitest';
import { searchEntities } from '../../src/search.js';

const entities = [
  {
    entity_id: '1',
    name: 'Ana Pérez',
    code: 'AC-01',
    description: 'Cliente mayorista',
    email: 'ana@example.com',
    taxId: 'XAXX010101000',
    customFields: { segment: 'Oro' }
  },
  {
    entity_id: '2',
    name: 'Bruno Díaz',
    code: 'BD-02',
    description: 'Proveedor local',
    customFields: { segment: 'Plata' }
  }
];

describe('búsqueda de entidades', () => {
  it('coincide por nombre sin distinguir mayúsculas ni acentos', () => {
    expect(searchEntities(entities, 'perez', {}).map((item) => item.entity_id)).toEqual(['1']);
    expect(searchEntities(entities, 'ANA', {}).map((item) => item.entity_id)).toEqual(['1']);
  });

  it('coincide por código, descripción y campos personalizados', () => {
    expect(searchEntities(entities, 'bd-02', {}).map((item) => item.entity_id)).toEqual(['2']);
    expect(searchEntities(entities, 'proveedor', {}).map((item) => item.entity_id)).toEqual(['2']);
    expect(searchEntities(entities, 'oro', {}).map((item) => item.entity_id)).toEqual(['1']);
  });

  it('no busca en campos fuera del alcance como email o taxId', () => {
    expect(searchEntities(entities, 'example.com', {})).toEqual([]);
    expect(searchEntities(entities, 'XAXX', {})).toEqual([]);
  });

  it('devuelve todas las entidades con término vacío', () => {
    expect(searchEntities(entities, '', {})).toHaveLength(2);
    expect(searchEntities(entities, '   ', {})).toHaveLength(2);
  });

  it('devuelve una lista vacía sin coincidencias', () => {
    expect(searchEntities(entities, 'zzz', {})).toEqual([]);
  });
});
