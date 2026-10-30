# Contrato de Búsqueda

## Propósito

Definir el alcance, campos buscables, reglas de coincidencia y comportamiento para la búsqueda de entidades (FR-004, FR-019, FR-005).

## Alcance

- La búsqueda se realiza **únicamente sobre entidades** (no sobre documentos).
- Disponible en la pantalla de búsqueda dedicada (HU11) y accesible desde el panel (acción rápida) y barra lateral (FR-021, FR-013, FR-011).
- Los resultados deben mantenerse sincronizados con crear/editar/eliminar (FR-004, FR-022).

## Campos buscables

Buscar en los siguientes campos (si existen):

**Campos base de Entity:**
- `name`
- `code`
- `taxId`
- `email`
- `phone`
- `address`
- `category`
- `description`
- `targetDate`
- `paymentTerms`

**Campos personalizados de Entity:**
- Todos los valores de `customFields` cuyo `target === 'entity'` definidos en la configuración actual (FR-019)

**Nota:** `id`, `entity_id`, `createdAt`, `updatedAt` típicamente no se buscan por defecto, pero el contrato permite incluirlos solo si hay razón explícita. Para este módulo base, los anteriores son suficientes.

## Reglas de coincidencia

- Coincidencia **substring** (contiene el término)
- **Case-insensitive** (ignorar mayúsculas/minúsculas)
- **Diacritic-insensitive** recomendado (ignorar acentos) para mayor usabilidad
- Comparación sobre valores **stringificados** (números/fechas convertidos a string)
- Si el término está vacío -> mostrar todos o mantener estado según UX (no filtrar)
- Si no hay coincidencias -> mostrar estado vacío claro con opción de reintentar (FR-005)

## Comportamiento

- Búsqueda en tiempo real o al enviar según implementación, pero debe sentirse ágil (FR-027)
- Debe funcionar correctamente con al menos 500 registros
- Actualizar resultados al volver a la pantalla o al cambiar datos
- Mantener la lista ordenada de forma coherente con el resto de la app
- Al enfocar desde acción rápida del panel, el campo de búsqueda debe recibir foco (FR-013)

## Integración

- `src/app.js` debe filtrar usando la lógica de búsqueda
- `src/components/search-bar.js` provee la interfaz
- Debe usar configuración actual para conocer campos personalizados buscables
- Los resultados deben mostrar información suficiente para identificar la entidad

## Pruebas esperadas

- Coincidencia por nombre/código/categoría
- Coincidencia por fecha objetivo
- Coincidencia por campo personalizado
- Sin coincidencias -> estado vacío
- Rendimiento con 500 registros
- Sincronización tras crear/editar/eliminar
