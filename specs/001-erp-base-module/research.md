# Investigación: Módulo Base ERP

## Decisión: Aplicación Vite estática con persistencia en localStorage

**Justificación**: El módulo base debe ser ligero, desplegable como sitio estático y sin backend. Vite ofrece un entorno de desarrollo y compilación simple; localStorage cubre la persistencia de una única instancia del módulo sin infraestructura adicional.

## Decisiones Arquitectónicas

- **Sin backend**: toda la persistencia ocurre en el navegador (`localStorage`). Esto mantiene el despliegue simple y el alcance acotado (FR-007, FR-029).
- **JavaScript vanilla modular**: sin framework de UI pesado; componentes pequeños con responsabilidades claras (shell, dashboard, formularios, listas, búsqueda).
- **Configuración como único punto de adaptación**: `src/module-config.js` centraliza nombre, etiquetas, campos personalizados, ciclo de vida de estados y color de acento (FR-016–FR-019, FR-023).
- **Persistencia desacoplada de la UI**: `src/storage.js` concentra el modelo, la validación y la integridad referencial (cascada entidad→documentos) para que la interfaz no dependa del almacén concreto.
- **Identificadores generados por la aplicación**: `entity_id` y `document_id` se generan al crear el registro; no hay autoincremento relacional (ver `data-model.md`).
- **Renderizado seguro y dirigido**: el contenido de usuario se escapa antes de insertarse en el DOM (FR-024) y las actualizaciones de listas son dirigidas para sostener el objetivo de <= 100 ms con 500 registros (FR-027).
- **Pruebas con Vitest + jsdom**: pruebas unitarias de almacenamiento/validación/configuración y pruebas de integración de los flujos de interfaz (FR-028).

## Alternativas Consideradas

- **Framework de UI (React/Vue)**: descartado por el requisito de huella mínima y despliegue simple.
- **Backend + base de datos relacional**: descartado en el módulo base por el objetivo de simplicidad; los módulos de negocio podrán añadirlo después.
- **Persistencia en memoria**: descartado porque los datos deben sobrevivir a recargas (FR-007).

## Alcance

Este módulo base no implementa módulos ERP de negocio (RRHH, Finanzas, Logística, CRM, Ventas, Compras, Fabricación, Calidad). Quedan fuera de alcance y se construirán sobre esta base en funcionalidades posteriores.
