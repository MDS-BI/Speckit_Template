# Plan de Implementación: Módulo de Adquisiciones y Compras

**Rama**: `001-erp-base-module` | **Fecha**: 2026-10-22 | **Especificación base**: [spec.md](spec.md)
**MER de referencia**: [README.md — Módulo de Adquisiciones y Compras](../../README.md#módulo-de-adquisiciones-y-compras-modelo-entidad-relación-mer)
**Entrada**: Modelo Entidad-Relación del módulo de Adquisiciones y Compras (Proveedor, Empleado, Categoría, Producto, Orden de compra y Detalle de compra) construido sobre el módulo base ERP.

## Resumen

El módulo de **Adquisiciones y Compras** es una instanciación del módulo base ERP que cubre el proceso de comprar bienes a proveedores: a quién se compra (**Proveedor**), qué se compra (**Producto** y **Categoría**), quién registra la compra (**Empleado**) y cuánto cuesta (**Orden de compra** con su **Detalle de compra**). El módulo base aporta el CRUD, la generación de identidad, las marcas de tiempo, la persistencia en `localStorage`, la navegación, la búsqueda y la eliminación en cascada; el módulo añade los datos maestros de Empleado, Categoría y Producto, las líneas de detalle, el cálculo del total, la actualización de stock y las vistas de análisis. Las **ventas** pertenecen a otro módulo distinto y quedan fuera de este alcance.

De los seis conceptos del MER, solo dos se apoyan directamente en el módulo base: **Proveedor** se gestiona como Entidad y **Orden de compra** como Documento. Los otros cuatro —Empleado, Categoría, Producto y Detalle de compra— son extensiones que el módulo implementa sobre el almacenamiento y los formularios del base, sin alterar la semántica de sus campos ni sus claves de persistencia.

## Contexto Técnico

**Lenguaje/Versión**: JavaScript (ES2022), HTML, CSS
**Dependencias Principales**: Vite, sin framework de interfaz pesado
**Almacenamiento**: `localStorage` del navegador. El base conserva `erp_base_module:entities` (proveedores) y `erp_base_module:documents` (órdenes de compra); la extensión añade `erp_purchasing:employees`, `erp_purchasing:categories`, `erp_purchasing:products` y `erp_purchasing:purchase-order-lines`
**Pruebas**: Vitest con jsdom para pruebas unitarias y de integración
**Plataforma Objetivo**: Navegadores modernos de escritorio y móviles
**Tipo de Proyecto**: Aplicación web de una sola página
**Objetivos de Rendimiento**: Interacciones responsivas con al menos 500 proveedores y 500 órdenes; el cálculo de totales, la búsqueda y el renderizado de listas deben percibirse instantáneos, incluso con varias líneas por orden
**Restricciones**: Sin backend; se mantienen los campos, validaciones y claves de almacenamiento del módulo base; todo contenido introducido por el usuario se sanitiza antes de renderizarse; la extensión no debe romper los módulos base existentes
**Escala/Alcance**: Seis entidades del MER, CRUD de proveedores y órdenes con líneas, datos maestros de apoyo, ciclo de vida de estados, control de stock y panel de análisis

## Verificación de la Constitución

*COMPROBACIÓN: Debe pasar antes de la investigación de la Fase 0. Reverificar tras el diseño de la Fase 1.*

- **Calidad**: Las reglas del dominio de compras (totales, estados, stock e integridad referencial) se aislarán en un módulo de dominio con funciones pequeñas y nombres consistentes, manteniendo el almacenamiento y la identidad en el código base.
- **Pruebas**: Cada regla de negocio del MER —cálculo del total, transiciones de estado, recepción y aumento de stock, cascada y restricciones de borrado— tendrá pruebas automatizadas unitarias y de integración antes de considerarse completa.
- **Experiencia de Usuario**: La terminología configurada (Proveedor, Orden de Compra) se aplicará en todas las pantallas; los formularios de orden y líneas mostrarán validaciones claras, estados vacíos y confirmaciones, dentro del marco visual del módulo base.
- **Rendimiento**: Las listas y el panel de análisis se renderizarán de forma incremental y se validarán con al menos 500 proveedores y 500 órdenes, sin bloqueos perceptibles.

## Alcance

### Incluido

- Gestión de proveedores como entidad base, con código y nombre obligatorios.
- Gestión de empleados, categorías y productos como datos maestros de la extensión.
- Creación y edición de órdenes de compra vinculadas a un proveedor y a un empleado.
- Registro de líneas de detalle con producto, cantidad y costo unitario.
- Cálculo automático del total de la orden a partir de sus líneas.
- Ciclo de vida de estados `borrador → pendiente → aprobado → recibido`, con cancelación permitida desde los estados no terminales.
- Aumento de stock de los productos al recibir una orden.
- Eliminación en cascada de proveedor → órdenes → líneas.
- Panel de visualización con indicadores de compras.
- Búsqueda de proveedores, empleados, categorías y productos.

### Excluido

- Ventas, facturación, cobros y pagos.
- Recepciones parciales de mercadería.
- Gestión de múltiples bodegas o ubicaciones de stock.
- Autenticación, roles y permisos.
- Sincronización con servidores o servicios externos.
- Numeración automática de folios (se evalúa como extensión futura).

## Modelo de Datos del Módulo

El MER se compone de dos registros del módulo base y cuatro estructuras de extensión. Los campos base conservan sus nombres y su semántica; los campos propios del MER se mapean a ellos o se persisten como extensiones.

### Proveedor — Entidad base

Dato maestro del módulo: la empresa o persona a quien se le compra. Se almacena en `erp_base_module:entities`.

| Campo del MER | Campo persistido | Tipo | Restricciones |
|---|---|---|---|
| `entity_id` | `entity_id` | string | Generado automáticamente, único; vínculo con las órdenes |
| `codigo` | `code` | string | Obligatorio, no vacío |
| `nombre` | `name` | string | Obligatorio, no vacío |
| `rut` | `taxId` | string | Opcional; se guarda recortado |
| `email` | `email` | string | Opcional; formato de correo válido |
| `telefono` | `phone` | string | Opcional |
| `direccion` | `address` | string | Opcional |

Hereda además `id`, `createdAt` y `updatedAt`. Los campos base `category`, `description`, `targetDate`, `creditLimit` y `paymentTerms` no forman parte del MER y permanecen opcionales y sin uso en este módulo.

### Empleado — Extensión

Persona de la organización que registra una orden de compra. Se persiste en `erp_purchasing:employees`.

| Campo | Tipo | Restricciones |
|---|---|---|
| `id_empleado` | string | Generado automáticamente, único |
| `nombre` | string | Obligatorio, no vacío |
| `cargo` | string | Obligatorio, no vacío |
| `createdAt` / `updatedAt` | string | Generados automáticamente |

### Categoría — Extensión

Grupo que organiza los productos (por ejemplo, insumos de oficina o materias primas). Se persiste en `erp_purchasing:categories`.

| Campo | Tipo | Restricciones |
|---|---|---|
| `id_categoria` | string | Generado automáticamente, único |
| `nombre` | string | Obligatorio, no vacío y único sin distinguir mayúsculas |
| `createdAt` / `updatedAt` | string | Generados automáticamente |

### Producto — Extensión

Bien que se adquiere. Se persiste en `erp_purchasing:products`.

| Campo | Tipo | Restricciones |
|---|---|---|
| `id_producto` | string | Generado automáticamente, único |
| `nombre` | string | Obligatorio, no vacío |
| `unidad_medida` | string | Obligatorio (unidad, kilo, caja, litro, etc.) |
| `stock` | number | Entero no negativo; por defecto 0 |
| `id_categoria` | string | Obligatorio; debe referenciar una categoría existente |
| `createdAt` / `updatedAt` | string | Generados automáticamente |

### Orden de compra — Documento base

Documento transaccional que representa un pedido hecho a un proveedor y registrado por un empleado. Se almacena en `erp_base_module:documents`.

| Campo del MER | Campo persistido | Tipo | Restricciones |
|---|---|---|---|
| `id_orden_compra` | `id` | string | Generado automáticamente, único |
| `entity_id` | `entity_id` | string | Obligatorio; debe referenciar un proveedor existente |
| `id_empleado` | `id_empleado` (extensión) | string | Obligatorio; debe referenciar un empleado existente |
| `folio` | `folio` | number | Obligatorio; entero positivo |
| `fecha_emision` | `startDate` | string | Obligatoria; fecha válida `YYYY-MM-DD` |
| `fecha_entrega` | `endDate` | string | Obligatoria; fecha válida igual o posterior a `startDate` |
| `estado` | `status` | string | Obligatorio; restringido al ciclo de vida configurado |
| `total` | `totalAmount` | number | Número no negativo; derivado de las líneas |

Hereda `createdAt` y `updatedAt`. Los campos base `series`, `subtotal`, `discount`, `taxAmount`, `currency`, `paymentTerms`, `notes` y `quantity` no son necesarios para el MER; si se incorporan más adelante, el total deberá seguir la regla `subtotal − descuento + impuesto`.

### Detalle de compra — Extensión (línea de orden)

Cada línea de una orden indica qué producto se pide, en qué cantidad y a qué costo unitario. Se persiste en `erp_purchasing:purchase-order-lines`.

| Campo | Tipo | Restricciones |
|---|---|---|
| `id_orden_compra` | string | Parte de la clave primaria; debe referenciar una orden existente |
| `id_producto` | string | Parte de la clave primaria; debe referenciar un producto existente |
| `cantidad` | number | Entero positivo |
| `costo_unitario` | number | Número no negativo; conserva el precio histórico de la compra |

La clave primaria es compuesta: el par (`id_orden_compra`, `id_producto`) identifica cada línea. Si se intenta agregar dos veces el mismo producto a una orden, el sistema lo rechaza o consolida la cantidad, nunca crea líneas duplicadas. El importe de la línea (`cantidad × costo_unitario`) es un valor derivado y no se persiste.

### Relaciones y cardinalidades

| Relación | Cardinalidad | Regla |
|---|---|---|
| Proveedor → Orden de compra | 1:N | Un proveedor puede recibir muchas órdenes; cada orden pertenece exactamente a un proveedor. |
| Empleado → Orden de compra | 1:N | Un empleado puede registrar muchas órdenes; cada orden la registra un solo empleado. |
| Orden de compra → Detalle de compra | 1:N (mínimo 1) | Una orden debe tener al menos una línea y puede tener varias. |
| Producto → Detalle de compra | 1:N | Un producto puede aparecer en muchas líneas de distintas órdenes. |
| Categoría → Producto | 1:N | Una categoría agrupa muchos productos; cada producto tiene una sola categoría. |

Entre **Orden de compra** y **Producto** existe una relación de muchos a muchos que se resuelve con **Detalle de compra**. El total de la orden es la suma de `cantidad × costo_unitario` de todas sus líneas.

### Reglas de integridad y validación

- Un proveedor debe tener `code` y `name` no vacíos; el correo, cuando exista, debe ser válido.
- Un empleado debe tener nombre y cargo no vacíos.
- Una categoría debe tener nombre no vacío y no puede repetirse sin distinguir mayúsculas.
- Un producto debe tener nombre, unidad de medida y categoría existente; el stock debe ser un entero no negativo.
- Una orden debe referenciar un proveedor y un empleado existentes, tener folio entero positivo, fechas válidas con entrega igual o posterior a la emisión, un estado permitido y al menos una línea.
- Cada línea debe referenciar un producto existente, tener cantidad entera positiva y costo unitario no negativo.
- El total se recalcula cada vez que se agrega, edita o elimina una línea; se redondea a dos decimales para evitar errores de coma flotante.
- El folio debe ser único entre las órdenes; si en el futuro se incorpora `series`, la unicidad se valida por serie.
- Las transiciones de estado solo se permiten según el ciclo de vida configurado; una transición inválida se rechaza con una explicación.
- Al pasar una orden a `recibido`, el stock de cada producto aumenta según la cantidad de su línea. La operación es idempotente: una orden no puede aplicar stock dos veces (se registra internamente si ya fue aplicado).
- Una orden en estado `recibido` o `cancelado` es inmutable: no admite edición de cabecera ni de líneas.
- Eliminar un proveedor elimina en cascada sus órdenes y las líneas de esas órdenes.
- Eliminar una orden elimina sus líneas.
- Eliminar un empleado, una categoría o un producto referenciado se bloquea con un mensaje explicativo para preservar el historial de compras.
- Todos los textos se normalizan para la búsqueda y se sanitizan antes de insertarse en el DOM.

## Flujo Funcional de Compra

1. **Se configura el módulo**: en `userConfig` se define el nombre del módulo, se renombran Entidad → Proveedor y Documento → Orden de Compra, y se declara el ciclo de vida de estados.
2. **Se registran los datos maestros**: proveedores (con nombre y código obligatorios), empleados, y las categorías y productos del catálogo.
3. **Se crea una orden de compra**: se elige el proveedor, se indica qué empleado la registra, el folio, la fecha de emisión y la fecha de entrega esperada. El sistema impide guardar si falta el proveedor, el empleado, el folio o las fechas, o si la fecha de entrega es anterior a la de emisión.
4. **Se agregan las líneas de detalle**: por cada producto se indica la cantidad y el costo unitario. El costo se guarda en la propia línea, de modo que el precio pagado queda como registro histórico aunque después cambie.
5. **Se calcula el total**: es la suma de cantidad × costo unitario de las líneas. El módulo base valida cada importe por separado, pero no calcula el total automáticamente; esa regla la implementa este módulo.
6. **La orden avanza de estado**: solo se ofrecen las transiciones permitidas y cualquier transición inválida se rechaza con una explicación.
7. **Al recibir la mercadería**, el `stock` de cada producto de la orden aumenta según la cantidad recibida.
8. **Integridad de los datos**: si se elimina un proveedor, el módulo base elimina en cascada todas sus órdenes de compra y la extensión elimina sus líneas.

## Configuración del Módulo

`src/module-config.js` centraliza la adaptación, sin cambios en el código base:

```js
export const userConfig = {
  moduleName: "Adquisiciones y Compras",
  labels: {
    entity: "Proveedor",
    entities: "Proveedores",
    document: "Orden de Compra",
    documents: "Órdenes de Compra",
  },
  statusLifecycle: {
    statuses: ["borrador", "pendiente", "aprobado", "recibido", "cancelado"],
    transitions: {
      borrador: ["pendiente", "cancelado"],
      pendiente: ["aprobado", "cancelado"],
      aprobado: ["recibido", "cancelado"],
      recibido: [],
      cancelado: [],
    },
  },
  theme: { accentColor: "#0f62fe" },
};
```

No se declaran `customFields` para este módulo: los campos del MER son campos base o pertenecen a la extensión. Las claves reservadas del base están documentadas en [data-model.md](data-model.md).

## Estructura del Proyecto

### Documentación (esta funcionalidad)

```text
specs/001-erp-base-module/
├── plan.md              (este archivo: plan del módulo de Adquisiciones y Compras)
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
└── tasks.md
```

### Código Fuente (raíz del repositorio)

```text
src/
├── main.js
├── app.js
├── styles.css
├── storage.js
├── module-config.js
├── domain/
│   └── purchasing.js        (reglas de totales, estados, stock, folio e integridad)
└── components/
    ├── shell.js             (marco del espacio de trabajo: barra superior, logotipo, barra lateral)
    ├── dashboard.js         (panel de inicio con acciones rápidas y contadores)
    ├── entity-form.js       (formulario de proveedores)
    ├── document-form.js     (formulario de órdenes: cabecera, fechas y estado)
    ├── master-data-form.js  (formularios de empleados, categorías y productos)
    ├── purchase-order-lines.js (editor de líneas con producto, cantidad y costo)
    └── purchasing-dashboard.js (indicadores de compras, stock y entregas)

tests/
├── unit/
├── integration/
└── setup/
```

**Decisión de Estructura**: Se conserva la aplicación Vite simple del módulo base y se agrega un módulo de dominio (`src/domain/purchasing.js`) para las reglas que el base no cubre: cálculo del total, transiciones de estado, aplicación idempotente de stock y validación de folios. Los formularios se separan entre proveedores/órdenes (pares base) y datos maestros de apoyo (extensión), de modo que la extensión pueda evolucionar sin tocar los componentes base. Las líneas de detalle se editan en un componente propio porque el documento base maneja una sola cantidad. El panel de compras reutiliza el marco del espacio de trabajo (`shell.js`) y lee tanto las claves del base como las de la extensión.

## Fases de Implementación

### Fase 0 — Investigación

- Confirmar la persistencia de las extensiones sin modificar el esquema del base.
- Definir el redondeo monetario y su comparación en pruebas.
- Definir la marca interna de stock aplicado y el bloqueo de órdenes terminales.
- Resolver la política de borrado para empleados, categorías y productos referenciados (bloqueo frente a cascada).
- Confirmar si el folio será único global o por serie.

### Fase 1 — Diseño

- Completar el modelo de datos de la extensión y sus contratos de almacenamiento.
- Diseñar los formularios de datos maestros, la cabecera de la orden y el editor de líneas.
- Diseñar el panel de compras y los indicadores definidos en el MER.
- Definir los casos de prueba unitarios y de integración.

### Fase 2 — Tareas

- Implementar el dominio de compras y sus pruebas unitarias.
- Implementar el almacenamiento y los formularios de empleados, categorías y productos.
- Implementar la orden de compra con líneas, cálculo de total y ciclo de vida.
- Implementar la recepción con actualización de stock y las reglas de borrado.
- Implementar el panel de compras, la búsqueda y la sanitización.
- Ejecutar la suite completa y validar el rendimiento con 500 registros.

## Estrategia de Pruebas

**Unitarias**

- Cálculo del total con varias líneas, decimales y redondeo a dos cifras.
- Rechazo de cantidades no positivas, costos negativos y productos duplicados en una orden.
- Transiciones válidas e inválidas del ciclo de vida.
- Aplicación de stock al recibir y garantía de que no se aplica dos veces.
- Validaciones de proveedor, empleado, categoría, producto y orden.
- Cascada proveedor → órdenes → líneas y bloqueo de borrado de datos referenciados.

**De integración**

- Crear proveedor, empleado, categoría y producto, y verlos en sus listas.
- Crear una orden con líneas y comprobar que el total coincide con la suma de los importes.
- Impedir guardar una orden sin proveedor, sin empleado, sin folio, sin líneas o con fechas inconsistentes.
- Avanzar una orden hasta `recibido` y verificar el aumento de stock; comprobar que una segunda recepción no lo duplica.
- Eliminar un proveedor y verificar que desaparecen sus órdenes y líneas.
- Intentar eliminar un producto referenciado y verificar el mensaje de bloqueo.
- Verificar los indicadores del panel: gasto por proveedor, compras por mes, órdenes por estado, entregas próximas o vencidas, compras por empleado, productos más comprados y stock por categoría.
- Verificar que nombres y notas con HTML se muestran escapados.

**Rendimiento**

- Renderizar y buscar con 500 proveedores y 500 órdenes sin bloqueos perceptibles.
- Mantener los totales y contadores sincronizados con el almacenamiento tras cada operación.

## Rendimiento, UX y Seguridad

- El panel y las listas deben seguir siendo ágiles con al menos 500 registros de entidad y 500 órdenes; el renderizado se hará por fragmentos y sin reconstruir toda la pantalla.
- Las estadísticas deben coincidir siempre con los datos almacenados y recalcularse al volver al panel.
- La interfaz mantiene el marco, la navegación, los estados vacíos y los mensajes del módulo base, con la terminología Proveedor / Orden de Compra.
- Todo contenido introducido por el usuario (nombres de proveedores, empleados, productos, notas) se sanitiza antes de renderizarse para prevenir XSS.
- Los errores de validación se muestran junto al campo correspondiente y explican cómo corregirlos.
- Las órdenes recibidas o canceladas se presentan en modo lectura para proteger el historial.

## Criterios de Aceptación

- Existen y son gestionables las seis entidades del MER con sus campos y restricciones.
- Las cardinalidades se respetan: toda orden tiene un proveedor, un empleado y al menos una línea; todo producto tiene una categoría.
- El total de una orden siempre equivale a la suma de `cantidad × costo_unitario` de sus líneas.
- Solo se permiten las transiciones de estado configuradas.
- Al recibir una orden, el stock aumenta exactamente una vez por línea.
- Eliminar un proveedor elimina sus órdenes y líneas; eliminar datos referenciados se bloquea con explicación.
- El panel de compras muestra los indicadores del MER calculados desde el almacenamiento real.
- La suite de pruebas pasa y el rendimiento se mantiene ágil con 500 proveedores y 500 órdenes.

## Riesgos y Decisiones Abiertas

| Riesgo o decisión | Tratamiento |
|---|---|
| El módulo base no calcula totales ni maneja líneas | Se implementan en `src/domain/purchasing.js` y en el editor de líneas, sin modificar el base. |
| Posible doble aplicación de stock al recibir | Marca interna de stock aplicado y bloqueo de edición en estados terminales. |
| Borrado de productos o empleados con historial | Se bloquea el borrado y se explica qué registros lo impiden. |
| Redondeo de importes | Se redondea a dos decimales y se compara con tolerancia en las pruebas. |
| Unicidad de folio | Se valida de forma global; si se incorpora `series`, se valida por serie. |
| Recepciones parciales | Fuera de alcance; la recepción actualiza el total de la línea. |
| Producto compartido con ventas | Se mantiene una única definición de producto reutilizable por otros módulos. |

## Seguimiento de Complejidad

Este plan no introdujo violaciones de la constitución. La extensión se apoya en los puntos de extensión previstos por el módulo base (campos adicionales, ciclo de vida, partidas de documento y almacenamiento local) y no modifica las claves ni la semántica de los campos base.
