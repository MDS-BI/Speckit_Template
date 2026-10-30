# Inicio Rápido: Módulo Base ERP

## Configuración

1. Instalar dependencias: `npm install`
2. Iniciar el servidor de desarrollo: `npm run dev`
3. Abrir la URL local que muestra Vite
4. Ejecutar las pruebas: `npm test`
5. Compilar para producción: `npm run build`

## Estructura de Datos

El módulo usa localStorage con un modelo simple (ver `data-model.md`):
- **Entidades**: datos maestros con campos base y campos personalizados.
- **Documentos**: registros transaccionales vinculados a una entidad por `entity_id`.
- **Configuración**: `src/module-config.js` define nombre, etiquetas, campos, ciclo de vida y color de acento.

## Flujo de Trabajo Típico

### Crear una entidad y un documento
1. Abrir el Panel y elegir "Nueva entidad".
2. Completar el formulario y guardar.
3. Elegir "Nuevo documento" y seleccionar la entidad creada.
4. Completar los detalles del documento y guardar.
5. Verificar que el documento aparece vinculado a su entidad.

### Adaptar el módulo a un dominio (p. ej., Ventas)
1. Editar `src/module-config.js`.
2. Definir `moduleName` y `labels` (Entidad→Cliente, Documento→Pedido de Venta).
3. Declarar `customFields` si se necesitan campos extra.
4. Opcional: definir `statusLifecycle` y `theme.accentColor`.
5. Recargar y verificar que toda la interfaz usa la nueva terminología.

### Buscar
1. Navegar a Búsqueda (barra lateral o acción rápida del Panel).
2. Introducir un término; se buscan nombre, código, descripción y campos personalizados.
3. Ver resultados o un estado vacío claro.

## Validación

- Guardar entidades/documentos inválidos debe mostrar errores por campo y no persistir.
- Eliminar una entidad debe eliminar en cascada sus documentos.
- Una configuración inválida debe caer a valores por defecto con un mensaje legible.
- El contenido de usuario debe mostrarse escapado (sin ejecutar HTML/script).
- Con 500 registros, búsqueda y renderizado deben mantenerse < 100 ms.

## Referencias

- Modelo de datos: `data-model.md`
- Contratos: `contracts/`
