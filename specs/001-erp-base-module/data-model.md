# Modelo de Datos: Módulo Base ERP

**Persistencia**: localStorage del navegador (sin backend).
**Convenciones**:
- Los identificadores (`entity_id`, `document_id`) los genera la aplicación al crear el registro (no hay autoincremento relacional).
- Las fechas se guardan como string `YYYY-MM-DD`.
- Los campos personalizados se guardan en un mapa `customFields` dentro de cada registro, usando la `key` declarada en la configuración.
- No hay claves foráneas impuestas por base de datos; la integridad referencial (documento→entidad y borrado en cascada) la garantiza `src/storage.js`.

---

## Entidad (`entities`)

Registro de datos maestros. Renombrable por configuración (p. ej., "Cliente").

| Campo | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `entity_id` | string | Sí | Identificador generado por la aplicación |
| `name` | string | Sí | Nombre de la entidad |
| `code` | string | Sí | Código único de la entidad |
| `taxId` | string | No | Identificación fiscal |
| `email` | string | No | Correo con formato válido si está presente |
| `phone` | string | No | Teléfono |
| `address` | string | No | Dirección |
| `category` | string | No | Categoría |
| `description` | string | No | Descripción |
| `targetDate` | string (`YYYY-MM-DD`) | No | Fecha objetivo (FR-020) |
| `creditLimit` | number | No | Límite de crédito >= 0 |
| `paymentTerms` | string | No | Condiciones de pago |
| `customFields` | object | No | Valores de campos personalizados (por `key`) |
| `createdAt` | string (ISO) | Sí | Fecha de creación |
| `updatedAt` | string (ISO) | Sí | Fecha de última actualización |

## Documento (`documents`)

Registro transaccional vinculado a una entidad. Renombrable por configuración (p. ej., "Pedido de Venta").

| Campo | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `document_id` | string | Sí | Identificador generado por la aplicación |
| `entity_id` | string | Sí | Referencia a `entities.entity_id` (debe existir) |
| `series` | string | No | Serie del documento |
| `folio` | number | Sí | Entero positivo |
| `startDate` | string (`YYYY-MM-DD`) | Sí | Fecha de inicio |
| `endDate` | string (`YYYY-MM-DD`) | Sí | Fecha de fin, >= `startDate` |
| `quantity` | number | No | Entero positivo |
| `subtotal` | number | No | >= 0 |
| `discount` | number | No | >= 0 y <= `subtotal` |
| `taxAmount` | number | No | >= 0 |
| `totalAmount` | number | No | >= 0 |
| `currency` | string | No | Código de moneda |
| `notes` | string | No | Notas |
| `status` | string | No | Estado libre o limitado por `statusLifecycle` (FR-010) |
| `customFields` | object | No | Valores de campos personalizados (por `key`) |
| `createdAt` | string (ISO) | Sí | Fecha de creación |
| `updatedAt` | string (ISO) | Sí | Fecha de última actualización |

## Configuración (`ModuleConfig`)

Ver `contracts/module-config.md` para el esquema completo. Resumen:

| Campo | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `moduleName` | string | Sí | Nombre mostrado del módulo |
| `labels` | object | No | Singular/plural de entidad y documento |
| `customFields` | array | No | Campos personalizados con `target`, `key`, `label`, `type`, `required`, `options` |
| `statusLifecycle` | object | No | `statuses` y `transitions` permitidas para documentos |
| `theme.accentColor` | string | No | Color CSS válido; fallback si es inválido |

## Relaciones e Integridad

- **Entidad 1 — N Documentos**: cada documento referencia exactamente una entidad mediante `entity_id`.
- **Borrado en cascada**: al eliminar una entidad se eliminan todos los documentos con su `entity_id` (FR-003, SC-002).
- **Validación de referencia**: no se puede crear/editar un documento con un `entity_id` inexistente (FR-009).
- **Búsqueda**: se indexan `name`, `code`, `description` y los valores de `customFields` de las entidades; el término vacío devuelve todas (FR-004).

## Claves de localStorage

| Clave | Contenido |
|---|---|
| `erp.entities` | Array de entidades serializadas |
| `erp.documents` | Array de documentos serializados |
| `erp.schemaVersion` | Versión del esquema (`1.0.0`) escrita en cada guardado |

> Los nombres exactos de las claves pueden ajustarse en `src/storage.js`; el contrato relevante es el esquema de los registros y la integridad referencial, no el nombre de la clave.
