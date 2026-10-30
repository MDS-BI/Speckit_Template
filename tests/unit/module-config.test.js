import { describe, expect, it } from 'vitest';
import { normalizeConfig, validateConfig } from '../../src/module-config.js';

describe('normalización de configuración', () => {
  it('aplica una configuración completa válida', () => {
    const { config, errors } = normalizeConfig({
      moduleName: 'Ventas',
      labels: { entity: 'Cliente', entities: 'Clientes', document: 'Pedido', documents: 'Pedidos' },
      customFields: [{ target: 'entity', key: 'segment', label: 'Segmento', type: 'select', options: ['A', 'B'] }],
      statusLifecycle: { statuses: ['Borrador', 'Aprobado'], transitions: { Borrador: ['Aprobado'] } },
      theme: { accentColor: '#0f62fe' }
    });
    expect(errors).toEqual([]);
    expect(config.moduleName).toBe('Ventas');
    expect(config.labels.entity).toBe('Cliente');
    expect(config.customFields[0].options).toEqual(['A', 'B']);
    expect(config.statusLifecycle.statuses).toEqual(['Borrador', 'Aprobado']);
    expect(config.theme.accentColor).toBe('#0f62fe');
  });

  it('usa valores por defecto con configuración ausente', () => {
    const { config, errors } = normalizeConfig(undefined);
    expect(errors.length).toBeGreaterThan(0);
    expect(config.moduleName).toBe('ERP Base');
    expect(config.labels.entity).toBe('Entidad');
    expect(config.statusLifecycle).toBeNull();
  });

  it('completa etiquetas parciales con los valores por defecto', () => {
    const { config } = normalizeConfig({ moduleName: 'Ventas', labels: { entity: 'Cliente' } });
    expect(config.labels.entity).toBe('Cliente');
    expect(config.labels.entities).toBe('Entidades');
    expect(config.labels.document).toBe('Documento');
  });

  it('detecta colisión de clave con campos base', () => {
    const errors = validateConfig({
      moduleName: 'X',
      customFields: [{ target: 'entity', key: 'name', label: 'Nombre', type: 'text' }]
    });
    expect(errors.some((error) => error.code === 'CUSTOM_KEY_CONFLICT')).toBe(true);
  });

  it('detecta select sin opciones', () => {
    const errors = validateConfig({
      moduleName: 'X',
      customFields: [{ target: 'entity', key: 'segment', label: 'Segmento', type: 'select', options: [] }]
    });
    expect(errors.some((error) => error.code === 'INVALID_SELECT_OPTIONS')).toBe(true);
  });

  it('ignora un color de acento inválido y aplica fallback', () => {
    const { config, errors } = normalizeConfig({ moduleName: 'X', theme: { accentColor: 'not-a-color' } });
    expect(config.theme.accentColor).toBeNull();
    expect(errors.some((error) => error.code === 'INVALID_ACCENT_COLOR')).toBe(true);
  });

  it('ignora un ciclo de vida inválido', () => {
    const { config, errors } = normalizeConfig({
      moduleName: 'X',
      statusLifecycle: { statuses: ['A'], transitions: { A: ['Desconocido'] } }
    });
    expect(config.statusLifecycle).toBeNull();
    expect(errors.length).toBeGreaterThan(0);
  });
});
