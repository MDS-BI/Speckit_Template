# Especificación de la Funcionalidad: Módulo Base de Software de Planificación de Recursos Empresariales (ERP)

**Rama de la funcionalidad**: 001-erp-base-module  
**Creada**: 2026-07-08  
**Estado**: Borrador (replanificado; sin código en el repositorio)  
**Entrada**: Descripción del usuario: "Construir un módulo base de software de planificación de recursos empresariales (ERP) que pueda extenderse en módulos ERP personalizados. Debe proporcionar gestión de datos maestros (entidades) y documentos transaccionales vinculados con capacidades de crear/editar/eliminar/buscar."

## Propósito

Este proyecto es un módulo base reutilizable para construir módulos ERP personalizados. Establece los patrones comunes que todo módulo ERP necesita: gestionar registros de datos maestros (Entidades) y sus documentos transaccionales asociados (Documentos), con navegación, validación, persistencia y búsqueda ya implementadas. La adaptación a un dominio concreto (por ejemplo, Ventas) se realiza sin tocar el código central, mediante un único archivo de configuración (`src/module-config.js`) que define terminología, campos personalizados, ciclo de vida de documentos y color de acento.

El alcance es deliberadamente acotado al módulo base. Los módulos ERP de negocio (RRHH, Finanzas, Logística, CRM, Ventas, Compras, Fabricación, Calidad) quedan fuera de esta especificación y podrán construirse sobre este módulo base en funcionalidades posteriores.

## Glosario

- **Entidad**: registro de datos maestros. Es renombrable por configuración (p. ej., "Cliente").
- **Documento**: registro transaccional vinculado a una entidad. Es renombrable por configuración (p. ej., "Pedido").
- **Módulo / vista**: pantalla de primer nivel del espacio de trabajo: Panel, Gestión de entidades, Gestión de documentos, Búsqueda.
- **Configuración del módulo**: objeto exportado por `src/module-config.js` que adapta el módulo base a un dominio.
- **Campos personalizados**: campos declarados en la configuración y renderizados dinámicamente en formularios, listas y búsqueda.

## Escenarios de Usuario y Pruebas *(obligatorio)*

### Historia de Usuario 1 - Crear y organizar entidades (Prioridad: P1)
Como usuario de negocio, quiero crear entidades y verlas en una lista para organizar mis datos maestros.

**Por qué esta prioridad**: Es la base sobre la que se apoyan los documentos y el resto de vistas.

**Prueba Independiente**: Un usuario abre la aplicación, envía el formulario de entidad y ve la nueva entidad aparecer en la lista.

**Escenarios de Aceptación**:
1. **Dado** que el usuario está en el formulario de entidad, **cuando** introduce un nombre válido y guarda, **entonces** la entidad se persiste y aparece en la lista.
2. **Dado** un formulario con campos obligatorios vacíos, **cuando** el usuario guarda, **entonces** se muestran errores por campo y no se persiste nada.

---

### Historia de Usuario 2 - Editar y eliminar entidades (Prioridad: P1)
Como usuario, quiero editar o eliminar entidades existentes para mantener los datos correctos.

**Por qué esta prioridad**: Los datos maestros cambian y deben poder corregirse o retirarse.

**Prueba Independiente**: Un usuario edita una entidad existente y ve el cambio; al eliminarla, desaparece de la lista con sus documentos.

**Escenarios de Aceptación**:
1. **Dado** una entidad existente, **cuando** el usuario la edita y guarda, **entonces** la lista muestra los valores actualizados.
2. **Dado** una entidad con documentos, **cuando** el usuario la elimina, **entonces** la entidad y todos sus documentos se eliminan.

---

### Historia de Usuario 3 - Panel de inicio con acciones rápidas y estadísticas (Prioridad: P1)
Como usuario, quiero un panel de inicio con acciones rápidas y estadísticas en vivo para empezar a trabajar en un clic.

**Por qué esta prioridad**: Es el punto de entrada principal de la aplicación.

**Prueba Independiente**: La aplicación abre en un panel con acciones rápidas (nueva entidad, nuevo documento, gestión de entidades, buscar registros); las tarjetas muestran recuentos coherentes con el almacenamiento.

**Escenarios de Aceptación**:
1. **Dado** el panel, **cuando** el usuario activa "Nueva entidad", **entonces** llega a la gestión de entidades con el formulario limpio y listo.
2. **Dado** entidades y documentos almacenados, **cuando** se muestra el panel, **entonces** las tarjetas de estadísticas coinciden con los recuentos reales.

> Nota: la pantalla de bienvenida de dos botones de la versión original queda sustituida por este panel.

---

### Historia de Usuario 4 - Gestionar entidades y documentos en una pantalla dedicada (Prioridad: P1)
Como usuario, quiero una pantalla de gestión para crear, editar y eliminar entidades y documentos.

**Por qué esta prioridad**: Concentra las operaciones de escritura del módulo.

**Prueba Independiente**: Un usuario añade, edita y elimina una entidad y un documento desde la pantalla de gestión.

**Escenarios de Aceptación**:
1. **Dado** la pantalla de gestión, **cuando** el usuario crea una entidad y luego un documento para ella, **entonces** ambos se guardan y se muestran vinculados.
2. **Dado** un documento existente, **cuando** el usuario lo edita o elimina, **entonces** el cambio se refleja en el almacenamiento y en la interfaz.

---

### Historia de Usuario 5 - Definir un perfil de configuración del módulo (Prioridad: P1)
Como desarrollador, quiero adaptar la identidad del módulo mediante configuración sin editar el código central.

**Por qué esta prioridad**: Habilita la reutilización del módulo para dominios distintos.

**Prueba Independiente**: Con una configuración de Ventas la aplicación carga mostrándola; al quitarla se restauran los valores por defecto Entidad/Documento sin errores.

**Escenarios de Aceptación**:
1. **Dado** un `module-config.js` válido, **cuando** la aplicación arranca, **entonces** usa el nombre y las etiquetas configuradas.
2. **Dado** un archivo de configuración ausente o inválido, **cuando** la aplicación arranca, **entonces** aplica los valores por defecto e informa del problema de forma legible.

---

### Historia de Usuario 6 - Reetiquetar pantallas desde la configuración (Prioridad: P1)
Como usuario de un módulo adaptado, quiero ver la terminología de mi dominio en toda la interfaz.

**Por qué esta prioridad**: Un módulo de Ventas debe hablar de "Clientes" y "Pedidos", no de "Entidades".

**Prueba Independiente**: Con Entidad→Cliente y Documento→Pedido de Venta, cada botón, etiqueta, encabezado y mensaje usa los términos mapeados; el comportamiento no cambia.

**Escenarios de Aceptación**:
1. **Dado** una configuración de etiquetas, **cuando** se recorren todas las pantallas, **entonces** no aparece ningún término base filtrado.
2. **Dado** una configuración parcial de etiquetas, **cuando** se renderiza la interfaz, **entonces** los términos faltantes usan los valores por defecto.

---

### Historia de Usuario 7 - Declarar campos personalizados para los registros (Prioridad: P1)
Como desarrollador, quiero declarar campos personalizados que fluyan automáticamente por formularios, validación, persistencia, listas y búsqueda.

**Por qué esta prioridad**: Evita modificar el código de interfaz para cada dominio.

**Prueba Independiente**: Un campo numérico obligatorio declarado se renderiza como entrada numérica, bloquea guardados vacíos, muestra su valor en la lista y coincide en la búsqueda.

**Escenarios de Aceptación**:
1. **Dado** un campo personalizado `required` de tipo `number`, **cuando** el usuario deja el valor vacío, **entonces** se impide guardar con un error claro.
2. **Dado** un campo personalizado con valor, **cuando** el usuario busca ese valor, **entonces** la entidad coincide.

---

### Historia de Usuario 8 - Buscar y encontrar entidades rápidamente (Prioridad: P2)
Como usuario, quiero buscar y filtrar entidades para encontrar registros rápido.

**Por qué esta prioridad**: Con muchos registros, la navegación manual no escala.

**Prueba Independiente**: Un usuario introduce un término y ve solo las entidades coincidentes, o un estado vacío claro si no hay coincidencias.

**Escenarios de Aceptación**:
1. **Dado** un término que coincide con el nombre o un campo personalizado, **cuando** el usuario busca, **entonces** se muestran solo las coincidencias.
2. **Dado** un término sin coincidencias, **cuando** el usuario busca, **entonces** se muestra un estado vacío claro.

---

### Historia de Usuario 9 - Registrar una fecha objetivo (Prioridad: P2)
Como usuario, quiero adjuntar una fecha objetivo opcional a una entidad.

**Por qué esta prioridad**: Añade seguimiento temporal a los datos maestros.

**Prueba Independiente**: Un usuario fija una fecha en una entidad y la ve en la lista.

**Escenarios de Aceptación**:
1. **Dado** una entidad sin fecha, **cuando** el usuario añade una fecha válida, **entonces** se persiste y se muestra en la lista.
2. **Dado** una fecha con formato inválido, **cuando** el usuario guarda, **entonces** se muestra un error de validación.

---

### Historia de Usuario 10 - Registrar los detalles de documentos de una entidad (Prioridad: P2)
Como usuario, quiero registrar documentos vinculados a una entidad y verlos juntos.

**Por qué esta prioridad**: Los documentos transaccionales dan sentido a los datos maestros.

**Prueba Independiente**: Un usuario añade un documento a una entidad y ve sus detalles con ella; eliminar la entidad elimina sus documentos.

**Escenarios de Aceptación**:
1. **Dado** una entidad existente, **cuando** el usuario crea un documento, **entonces** el documento queda vinculado por `entity_id` y visible con la entidad.
2. **Dado** una entidad con documentos, **cuando** se elimina la entidad, **entonces** los documentos se eliminan en cascada.

---

### Historia de Usuario 11 - Buscar entidades en una pantalla dedicada (Prioridad: P2)
Como usuario, quiero una pantalla de búsqueda dedicada accesible desde el panel y la barra lateral.

**Por qué esta prioridad**: Mantiene la edición en gestión y la consulta en su propia vista.

**Prueba Independiente**: Un usuario navega a Búsqueda, busca, ve resultados o estado vacío y vuelve al Panel.

**Escenarios de Aceptación**:
1. **Dado** la vista de búsqueda, **cuando** el usuario busca, **entonces** ve resultados o un estado vacío.
2. **Dado** la vista de búsqueda, **cuando** el usuario vuelve al Panel, **entonces** la navegación funciona y los datos se conservan.

---

### Historia de Usuario 12 - Configurar el ciclo de vida de estados de documentos (Prioridad: P2)
Como usuario de un módulo adaptado, quiero que los documentos solo permitan transiciones de estado válidas.

**Por qué esta prioridad**: Modela procesos de negocio reales (p. ej., cotización→pedido→facturado).

**Prueba Independiente**: Con un ciclo configurado solo se ofrecen los estados siguientes válidos; los inválidos se rechazan con explicación. Sin configuración, el estado es texto libre.

**Escenarios de Aceptación**:
1. **Dado** un `statusLifecycle` configurado, **cuando** el usuario intenta una transición no permitida, **entonces** se rechaza con una explicación.
2. **Dado** que no hay `statusLifecycle`, **cuando** el usuario guarda un estado, **entonces** se acepta como texto libre.

---

### Historia de Usuario 13 - Marco de espacio de trabajo ERP con marca (Prioridad: P1)
Como usuario, quiero un marco persistente con barra superior y barra lateral para navegar el módulo de forma coherente.

**Por qué esta prioridad**: Da identidad y navegación consistentes a todas las pantallas.

**Prueba Independiente**: En cada pantalla se ven la barra superior y la barra lateral, el módulo activo está resaltado, la navegación conserva los datos y la barra lateral se contrae en ventanas estrechas.

**Escenarios de Aceptación**:
1. **Dado** cualquier vista, **cuando** se renderiza, **entonces** la barra superior (logotipo + nombre) y la barra lateral están presentes.
2. **Dado** el módulo activo, **cuando** el usuario navega, **entonces** el botón activo se resalta con `aria-current` y los datos persisten.

---

## Requisitos Funcionales

### Gestión de entidades
- **FR-001**: El sistema DEBE permitir crear entidades con validación de campos obligatorios y persistirlas.
- **FR-002**: El sistema DEBE permitir editar entidades existentes y reflejar los cambios en la lista.
- **FR-003**: El sistema DEBE permitir eliminar entidades y eliminar en cascada todos sus documentos.

### Búsqueda
- **FR-004**: El sistema DEBE buscar entidades en tiempo real por campos base y campos personalizados, sin distinguir mayúsculas ni acentos.
- **FR-005**: El sistema DEBE mostrar un estado vacío claro cuando una búsqueda no tiene coincidencias o el término está vacío.

### Validación y persistencia
- **FR-006**: El sistema DEBE validar entidades, documentos y configuración con mensajes de error consistentes asociados al campo.
- **FR-007**: El sistema DEBE persistir entidades y documentos en localStorage del navegador.
- **FR-008**: El sistema DEBE permitir crear, editar y eliminar documentos.
- **FR-009**: El sistema DEBE vincular cada documento a una entidad existente mediante `entity_id`.
- **FR-010**: El sistema DEBE aplicar el ciclo de vida de estados configurado a los documentos y permitir estado de texto libre cuando no haya configuración.

### Marco y navegación
- **FR-011**: El sistema DEBE renderizar un marco persistente con barra superior (logotipo derivado del nombre + nombre del módulo) y barra lateral en todas las pantallas.
- **FR-012**: El sistema DEBE enrutar entre módulos desde la barra lateral y resaltar el módulo activo con `aria-current`.
- **FR-013**: El sistema DEBE ofrecer en el panel acciones rápidas para nueva entidad, nuevo documento, gestión de entidades y buscar registros.
- **FR-014**: El sistema DEBE mostrar en el panel estadísticas de registros en vivo coherentes con el almacenamiento.
- **FR-015**: El sistema DEBE incluir un botón "Panel" en la barra lateral que vuelva al panel de inicio.

### Configuración del módulo
- **FR-016**: El sistema DEBE cargar `src/module-config.js` al arrancar con valores por defecto seguros.
- **FR-017**: El sistema DEBE informar de una configuración ausente o inválida de forma legible y aplicar valores por defecto sin fallar.
- **FR-018**: El sistema DEBE derivar todas las etiquetas visibles al usuario de la configuración.
- **FR-019**: El sistema DEBE hacer fluir los campos personalizados declarados por formulario, validación, persistencia, lista y búsqueda.

### Datos e interfaz
- **FR-020**: El sistema DEBE permitir una fecha objetivo opcional en las entidades, validando su formato.
- **FR-021**: El sistema DEBE ofrecer una pantalla de búsqueda dedicada accesible desde el panel y la barra lateral.
- **FR-022**: El sistema DEBE preservar los datos almacenados al navegar entre módulos.
- **FR-023**: El sistema DEBE aplicar el color de acento configurado globalmente, con un valor por defecto seguro si es inválido o ausente.
- **FR-024**: El sistema DEBE escapar todo contenido de usuario antes de insertarlo en el DOM.
- **FR-025**: El sistema DEBE cumplir accesibilidad básica: etiquetas de formulario, orden de foco lógico, `aria-current` y estructura semántica.
- **FR-026**: El sistema DEBE contraer la barra lateral a una columna de iconos accesible en ventanas estrechas.

### Calidad
- **FR-027**: El sistema DEBE mantener la búsqueda y el renderizado de listas en <= 100 ms con 500 registros, con actualizaciones dirigidas del DOM.
- **FR-028**: El sistema DEBE cubrir los flujos centrales (crear, editar, eliminar, buscar, cascada, configuración) con pruebas automatizadas.
- **FR-029**: El sistema DEBE compilar y ejecutarse como aplicación estática sin backend.

## Criterios de Éxito

- **SC-001**: Crear, editar o eliminar una entidad actualiza la lista en < 100 ms y sin errores en consola.
- **SC-002**: Eliminar una entidad elimina el 100% de sus documentos (verificado por prueba automatizada).
- **SC-003**: Una búsqueda devuelve únicamente coincidencias por nombre, descripción, notas o campos personalizados.
- **SC-004**: Con 500 entidades, la búsqueda y el renderizado de la lista permanecen < 100 ms y la interfaz sigue interactiva.
- **SC-005**: Con una configuración de Ventas, todas las etiquetas visibles cambian y no aparece ningún término base filtrado.
- **SC-006**: Una configuración ausente o inválida cae a los valores por defecto y muestra un mensaje legible sin fallar.
- **SC-007**: Los campos personalizados aparecen en formulario, validación, lista y búsqueda sin cambios en el código central.
- **SC-008**: Todas las pantallas se renderizan dentro del marco con la barra lateral y el módulo activo resaltado.

## Casos Límite

- Entidad sin nombre o con campos obligatorios vacíos → error por campo, no se guarda.
- Entidad con documentos eliminada → se eliminan también los documentos (cascada).
- Configuración ausente, parcial o inválida → valores por defecto + un mensaje legible.
- Búsqueda con término vacío → mostrar todos o mantener estado, sin filtrar.
- Búsqueda sin coincidencias → estado vacío claro con opción de reintentar.
- 500 registros → búsqueda y renderizado < 100 ms.
- Documento con estado no permitido por el ciclo de vida → rechazado con explicación.
- Documento con `entity_id` inexistente → error de validación.
- Valor de campo personalizado con HTML/script → mostrado escapado, nunca ejecutado.
- Color de acento inválido → fallback sin errores fatales.

## Suposiciones

- Los identificadores (`entity_id`, `document_id`) los genera la aplicación y se persisten en localStorage; no hay tablas relacionales ni autoincremento.
- El módulo opera sobre una única instancia de espacio de trabajo en el navegador.
- No hay backend ni autenticación en el alcance del módulo base.
- Cada documento pertenece a exactamente una entidad.
- La configuración se define en un único archivo (`src/module-config.js`).
- El contenido mostrado se escapa; los datos provienen de localStorage y de la entrada del usuario.
