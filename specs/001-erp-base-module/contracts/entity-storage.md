# Contrato de Almacenamiento de Entidades y Documentos (Ampliado)

## Propósito

Extiende `contracts/entity-storage.md` con claves, versionado, passthrough de campos personalizados, errores estructurados y atomicidad de cascada.

## Claves de localStorage

Usar claves versionadas/namespaced:

| Clave | Contenido |
| --- | --- |
| `erp.entities` | Array de entidades |
| `erp.documents` | Array de documentos |
| `erp.schemaVersion` | Versión de esquema (ej. `1.0.0`) |

## Versionado de esquema

- Cada blob puede incluir metadatos: `{ version: '1.0.0', data: [...] }` o simplemente almacenar array con `erp.schemaVersion` global
- Al leer, si versión difiere -> intentar migración o fallback seguro
- Migraciones deben ser backward-compatible cuando sea posible

## Forma de los datos

Ver `entity-storage.md` base. Además:
- **Campos personalizados**: cualquier propiedad extra en entidad/documento debe persistirse tal como está (passthrough). No eliminar claves desconocidas al guardar/leer.
- **Timestamps**: `createdAt` y `updatedAt` en formato ISO 8601. Deben ser establecidos/actualizados por helpers de almacenamiento (no confiar solo en el caller).

## Operaciones

### Entidades
- `loadEntities()`: devuelve todas las entidades almacenadas (array). Si no existe -> []
- `saveEntities(entities)`: persiste lista completa. Debe validar estructura básica.
- `addEntity(entity)`: añade nueva entidad. Genera `id` y `entity_id` únicos si faltan. Establece `createdAt`/`updatedAt`. Valida según contrato de validación.
- `updateEntity(id, updates)`: actualiza entidad existente. Actualiza `updatedAt`. Merge con campos existentes (preserva campos personalizados). Valida.
- `deleteEntity(id)`: elimina entidad por id. **Debe** eliminar documentos asociados vía `deleteDocumentsForEntity`.

### Documentos
- `loadDocuments()`: devuelve todos los documentos
- `saveDocuments(documents)`: persiste lista completa
- `addDocument(document)`: añade documento. Genera `id`. Establece timestamps. Valida `entity_id` existente. Aplica ciclo de vida si configurado.
- `updateDocument(id, updates)`: actualiza documento. Valida transiciones si hay `statusLifecycle`. Actualiza `updatedAt`.
- `deleteDocument(id)`: elimina documento por id
- `deleteDocumentsForEntity(entityId)`: elimina todos los documentos con ese `entity_id`. Debe ser llamado por `deleteEntity` para garantizar integridad referencial.

## Validación y errores

Usar `ValidationError[]` (ver `contracts/validation.md`).

Casos de error esperados:
- `addEntity` con `name` o `code` vacío -> `REQUIRED`
- `addEntity` con `email` inválido -> `INVALID_EMAIL`
- `addEntity` con `creditLimit` negativo -> `NEGATIVE_NOT_ALLOWED`
- `addEntity` con `targetDate` inválido -> `INVALID_DATE`
- `addDocument` con `entity_id` inexistente -> `MISSING_ENTITY_REF`
- `addDocument` sin `folio` entero positivo -> `INVALID_FOLIO`
- `addDocument` con `endDate` < `startDate` -> `END_BEFORE_START`
- `addDocument` con `discount` > `subtotal` -> `DISCOUNT_EXCEEDS_SUBTOTAL`
- `updateDocument` con transición inválida bajo ciclo de vida -> error con explicación clara

## Integridad referencial

- Al eliminar entidad, **todos** los documentos con `entity_id` coincidente deben eliminarse
- No deben quedar documentos huérfanos
- Operación debe ser consistente (si posible, atómica desde perspectiva del caller)

## Extensibilidad

- Campos extra (custom fields) deben preservarse sin transformación
- Esquema base estable para módulos personalizados
- Helpers deben ser genéricos, validación delegada/configurable donde aplique

## Pruebas esperadas

- Generación de `id`/`entity_id` únicos
- Passthrough de custom fields
- Eliminación en cascada
- Validación de todos los casos base
- Transiciones de estado válidas/inválidas
- Timestamps actualizados correctamente
