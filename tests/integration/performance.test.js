import { describe, expect, it } from 'vitest';
import { renderEntityList } from '../../src/components/entity-list.js';
import { normalizeConfig } from '../../src/module-config.js';
import { searchEntities } from '../../src/search.js';

const { config } = normalizeConfig({ moduleName: 'Rendimiento' });

function buildEntities(count) {
  return Array.from({ length: count }, (_, index) => ({
    entity_id: `ent_${index}`,
    name: `Entidad ${index}`,
    code: `COD-${String(index).padStart(4, '0')}`,
    description: `Descripción ${index}`,
    customFields: { segment: index % 2 === 0 ? 'Oro' : 'Plata' }
  }));
}

describe('rendimiento', () => {
  it('busca y filtra 500 entidades en menos de 100 ms', () => {
    const entities = buildEntities(500);
    const started = performance.now();
    const results = searchEntities(entities, 'COD-0499', config);
    const elapsed = performance.now() - started;

    expect(results).toHaveLength(1);
    expect(elapsed).toBeLessThan(100);
  });

  it('renderiza 500 entidades en menos de 100 ms', () => {
    const entities = buildEntities(500);
    const warmup = document.createElement('div');
    renderEntityList(warmup, entities, { config, onEdit: () => {}, onDelete: () => {} });

    const container = document.createElement('div');
    document.body.append(container);
    const started = performance.now();
    renderEntityList(container, entities, { config, onEdit: () => {}, onDelete: () => {} });
    const elapsed = performance.now() - started;

    expect(container.querySelectorAll('.record-card')).toHaveLength(500);
    expect(elapsed).toBeLessThan(100);
  });
});
