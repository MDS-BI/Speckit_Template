# Especificación de la Funcionalidad: Módulo Base de Software de Planificación de Recursos Empresariales (ERP)

**Rama de la funcionalidad**: 001-erp-base-module  
**Creada**: 2026-07-08  
**Estado**: Implementado  
**Entrada**: Descripción del usuario: "Construir un módulo base de software de planificación de recursos empresariales (ERP) que pueda extenderse en módulos ERP personalizados. Debe proporcionar gestión de datos maestros (entidades) y documentos transaccionales vinculados con capacidades de crear/editar/eliminar/buscar."

## Propósito

Este proyecto sirve como módulo base reutilizable para construir módulos ERP personalizados. Establece los patrones comunes que todo módulo ERP necesita: gestionar registros de datos maestros y sus documentos transaccionales asociados, con navegación, validación, persistencia y búsqueda ya implementadas. El sistema cubre todos los módulos del modelo de datos: Datos Maestros Compartidos (empresas, direcciones, monedas, códigos fiscales), RRHH/Nómina, Finanzas/Contabilidad, Logística/Inventario, CRM, Ventas, Compras/Adquisiciones, Operaciones/Fabricación y Control de Calidad, con relaciones entre módulos debidamente definidas e integradas en la interfaz.

## Escenarios de Usuario y Pruebas *(obligatorio)*

### Historia de Usuario 1 - Gestionar datos maestros compartidos (Prioridad: P1)
Como usuario de negocio, quiero gestionar datos maestros compartidos (empresas, direcciones, monedas, códigos fiscales) para poder establecer la base organizativa del ERP.

**Por qué esta prioridad**: Estos registros son referenciados por todos los demás módulos; sin ellos no es posible crear empleados, productos, clientes o transacciones.

**Prueba Independiente**: Un usuario puede crear una empresa con dirección y moneda, y verla correctamente vinculada.

**Escenarios de Aceptación**:
1. **Dado** que el usuario está en el módulo de datos maestros, **cuando** crea una empresa con nombre fiscal, dirección y moneda, **entonces** la empresa se guarda y queda correctamente relacionada.
2. **Dado** que se definen monedas y códigos fiscales, **cuando** se usan en otros módulos, **entonces** las validaciones y relaciones funcionan correctamente.

---

### Historia de Usuario 2 - Gestionar RRHH y nómina (Prioridad: P1)
Como usuario de RRHH, quiero gestionar departamentos, puestos, empleados, contratos, ausencias, asistencia, nómina y prestaciones para mantener la estructura organizativa.

**Por qué esta prioridad**: Los empleados son referenciados por prácticamente todos los demás módulos (ventas, compras, aprobaciones, etc.).

**Prueba Independiente**: Un usuario puede crear un departamento, asignar un gerente, crear empleados con sus puestos y contratos.

**Escenarios de Aceptación**:
1. **Dado** un departamento, **cuando** se asigna un gerente empleado, **entonces** la relación circular se maneja correctamente (gerente puede ser nullable inicialmente).
2. **Dado** un empleado con contrato, **cuando** se procesa nómina, **entonces** los conceptos de nómina se aplican correctamente.

---

### Historia de Usuario 3 - Gestionar Finanzas y Contabilidad (Prioridad: P1)
Como usuario de finanzas, quiero gestionar el plan de cuentas, períodos fiscales, centros de costo, presupuestos, asientos contables, bancos, cuentas por cobrar/pagar y activos fijos.

**Por qué esta prioridad**: La contabilidad es fundamental para el control financiero y se integra con todas las transacciones operativas.

**Prueba Independiente**: Un usuario puede crear un asiento contable con líneas de débito/crédito balanceadas.

**Escenarios de Aceptación**:
1. **Dado** un asiento contable, **cuando** se crea con líneas, **entonces** los débitos deben igualar a los créditos.
2. **Dado** facturas por cobrar/pagar, **cuando** se aplican recibos/pagos, **entonces** los saldos se actualizan correctamente.

---

### Historia de Usuario 4 - Gestionar Logística e Inventario (Prioridad: P1)
Como usuario de almacén, quiero gestionar productos, categorías, unidades de medida, almacenes, ubicaciones, existencias, movimientos, transferencias y embarques.

**Por qué esta prioridad**: El maestro de productos es el núcleo que une ventas, compras, fabricación y calidad.

**Prueba Independiente**: Un usuario puede recibir mercancía, actualizar existencias y rastrear movimientos con referencias polimórficas.

**Escenarios de Aceptación**:
1. **Dado** un producto en almacén, **cuando** ocurre una transacción de inventario, **entonces** las existencias se actualizan correctamente.
2. **Dado** una orden de compra, **cuando** se recibe mercancía, **entonces** se genera un recibo de mercancía y se actualiza el inventario.

---

### Historia de Usuario 5 - Gestionar CRM y Ventas (Prioridad: P1)
Como usuario de ventas, quiero gestionar clientes, contactos, prospectos, oportunidades, cotizaciones, órdenes de venta, devoluciones y campañas.

**Por qué esta prioridad**: Genera ingresos y se integra con inventario, facturación y entregas.

**Prueba Independiente**: Un usuario puede convertir un prospecto en cliente, crear una cotización y convertirla en orden de venta.

**Escenarios de Aceptación**:
1. **Dado** una cotización aprobada, **cuando** se convierte a orden de venta, **entonces** se genera la orden correctamente vinculada.
2. **Dado** una orden de venta, **cuando** se embarca, **entonces** se genera el embarque y se actualiza el inventario.

---

### Historia de Usuario 6 - Gestionar Compras y Aprovisionamiento (Prioridad: P1)
Como usuario de compras, quiero gestionar proveedores, solicitudes de compra, solicitudes de cotización, cotizaciones de proveedores, órdenes de compra y recepción de mercancía.

**Por qué esta prioridad**: Asegura el abastecimiento y se integra con inventario y cuentas por pagar.

**Prueba Independiente**: Un usuario puede crear una solicitud de compra, enviar RFQ a proveedores, comparar cotizaciones y generar orden de compra.

**Escenarios de Aceptación**:
1. **Dado** una orden de compra, **cuando** se recibe mercancía, **entonces** se crea el recibo y se genera la factura por pagar.
2. **Dado** múltiples cotizaciones, **cuando** se selecciona una, **entonces** se genera la orden de compra correctamente.

---

### Historia de Usuario 7 - Gestionar Operaciones y Fabricación (Prioridad: P1)
Como usuario de producción, quiero gestionar listas de materiales, rutas, centros de trabajo, órdenes de producción, consumo de materiales y producción terminada.

**Por qué esta prioridad**: Permite la fabricación de productos terminados con trazabilidad completa.

**Prueba Independiente**: Un usuario puede crear una orden de producción para un producto con BOM, consumir materiales y registrar producción terminada.

**Escenarios de Aceptación**:
1. **Dado** una orden de producción, **cuando** se consumen materiales, **entonces** las existencias se reducen correctamente.
2. **Dado** producción terminada, **cuando** se registra, **entonces** las existencias de producto terminado aumentan.

---

### Historia de Usuario 8 - Gestionar Control de Calidad (Prioridad: P1)
Como usuario de calidad, quiero gestionar planes de inspección, criterios, inspecciones, resultados y acciones correctivas con referencias polimórficas.

**Por qué esta prioridad**: Asegura la calidad en recepción, producción y embarque.

**Prueba Independiente**: Un usuario puede crear un plan de inspección, realizar inspección de mercancía recibida y registrar no conformidades con acciones correctivas.

**Escenarios de Aceptación**:
1. **Dado** una recepción de mercancía, **cuando** se realiza inspección, **entonces** se registra con referencia polimórfica.
2. **Dado** una no conformidad, **cuando** se crea una acción correctiva, **entonces** se asigna a responsable con fecha límite.

---

## Requisitos Funcionales

### Datos Maestros Compartidos
- **FR-001**: El sistema DEBE gestionar empresas con nombre fiscal, dirección, moneda y datos fiscales.
- **FR-002**: El sistema DEBE gestionar direcciones reutilizables.
- **FR-003**: El sistema DEBE gestionar monedas con código ISO, nombre y símbolo.
- **FR-004**: El sistema DEBE gestionar códigos fiscales con tasas.

### RRHH / Nómina
- **FR-005**: El sistema DEBE gestionar departamentos con jerarquía y gerente (relación circular manejable).
- **FR-006**: El sistema DEBE gestionar puestos de trabajo y niveles.
- **FR-007**: El sistema DEBE gestionar empleados con datos personales, departamento, puesto, gerente y estado.
- **FR-008**: El sistema DEBE gestionar contratos de empleados con tipo, vigencia, salario y moneda.
- **FR-009**: El sistema DEBE gestionar tipos de ausencia, solicitudes y aprobaciones.
- **FR-010**: El sistema DEBE gestionar registros de asistencia.
- **FR-011**: El sistema DEBE gestionar conceptos de nómina, corridas de nómina, recibos de nómina y líneas.
- **FR-012**: El sistema DEBE gestionar prestaciones y asignación a empleados.
- **FR-013**: El sistema DEBE gestionar evaluaciones de desempeño.

### Finanzas / Contabilidad
- **FR-014**: El sistema DEBE gestionar el plan de cuentas con jerarquía y tipo.
- **FR-015**: El sistema DEBE gestionar períodos fiscales por empresa.
- **FR-016**: El sistema DEBE gestionar centros de costo vinculados a departamentos.
- **FR-017**: El sistema DEBE gestionar presupuestos por centro de costo, cuenta y período.
- **FR-018**: El sistema DEBE gestionar asientos contables con módulo origen y referencia polimórfica.
- **FR-019**: El sistema DEBE gestionar líneas de asiento con débito/crédito.
- **FR-020**: El sistema DEBE gestionar cuentas bancarias y transacciones bancarias.
- **FR-021**: El sistema DEBE gestionar facturas por cobrar con líneas, impuestos y aplicaciones de recibos.
- **FR-022**: El sistema DEBE gestionar facturas por pagar con líneas, impuestos y aplicaciones de pagos.
- **FR-023**: El sistema DEBE gestionar activos fijos y depreciación.

### Logística / Inventario
- **FR-024**: El sistema DEBE gestionar categorías de productos con jerarquía.
- **FR-025**: El sistema DEBE gestionar unidades de medida.
- **FR-026**: El sistema DEBE gestionar productos con SKU, tipo, costo estándar y estado.
- **FR-027**: El sistema DEBE gestionar almacenes, ubicaciones y existencias por producto/almacén/ubicación.
- **FR-028**: El sistema DEBE gestionar transacciones de inventario con referencias polimórficas.
- **FR-029**: El sistema DEBE gestionar transferencias entre almacenes.
- **FR-030**: El sistema DEBE gestionar transportistas y embarques con líneas.
- **FR-031**: El sistema DEBE gestionar recibos de mercancía con líneas.

### CRM
- **FR-032**: El sistema DEBE gestionar clientes con dirección, ejecutivo asignado y datos de contacto.
- **FR-033**: El sistema DEBE gestionar contactos por cliente.
- **FR-034**: El sistema DEBE gestionar prospectos con origen, estado y ejecutivo asignado.
- **FR-035**: El sistema DEBE gestionar etapas de oportunidad y oportunidades.
- **FR-036**: El sistema DEBE gestionar interacciones con clientes/contactos/empleados.
- **FR-037**: El sistema DEBE gestionar campañas y miembros.
- **FR-038**: El sistema DEBE gestionar tickets de soporte.

### Ventas
- **FR-039**: El sistema DEBE gestionar listas de precios con vigencia y artículos.
- **FR-040**: El sistema DEBE gestionar cotizaciones con líneas y vinculación a oportunidad/cliente.
- **FR-041**: El sistema DEBE gestionar órdenes de venta con líneas y vinculación a cotización/oportunidad/cliente.
- **FR-042**: El sistema DEBE gestionar devoluciones RMA con líneas.

### Compras
- **FR-043**: El sistema DEBE gestionar proveedores con datos de pago.
- **FR-044**: El sistema DEBE gestionar productos por proveedor con SKU proveedor, tiempo de entrega y costo.
- **FR-045**: El sistema DEBE gestionar solicitudes de compra con líneas.
- **FR-046**: El sistema DEBE gestionar solicitudes de cotización y cotizaciones de proveedores.
- **FR-047**: El sistema DEBE gestionar órdenes de compra con líneas.

### Operaciones / Fabricación
- **FR-048**: El sistema DEBE gestionar listas de materiales con componentes.
- **FR-049**: El sistema DEBE gestionar rutas con operaciones por centro de trabajo.
- **FR-050**: El sistema DEBE gestionar centros de trabajo.
- **FR-051**: El sistema DEBE gestionar órdenes de producción con BOM, ruta y vinculación a orden de venta.
- **FR-052**: El sistema DEBE gestionar operaciones de orden de producción.
- **FR-053**: El sistema DEBE gestionar consumo de materiales y producción terminada.

### Control de Calidad
- **FR-054**: El sistema DEBE gestionar planes de inspección por producto y etapa.
- **FR-055**: El sistema DEBE gestionar criterios de inspección.
- **FR-056**: El sistema DEBE gestionar inspecciones con referencias polimórficas.
- **FR-057**: El sistema DEBE gestionar resultados de inspección.
- **FR-058**: El sistema DEBE gestionar no conformidades y acciones correctivas.

### Integración y Arquitectura
- **FR-059**: El sistema DEBE soportar referencias polimórficas para asientos contables, transacciones de inventario e inspecciones de calidad.
- **FR-060**: El sistema DEBE manejar relaciones circulares (departamentos-gerentes) de forma segura.
- **FR-061**: El sistema DEBE mantener integridad referencial entre módulos.
- **FR-062**: El sistema DEBE soportar trazabilidad completa entre órdenes de venta, embarques, facturas y recibos.

## Criterios de Éxito

- **SC-001**: Se puede establecer la estructura organizativa completa (empresa, departamentos, empleados) sin errores.
- **SC-002**: El ciclo orden-a-cobro (cotización → orden → embarque → factura → recibo) funciona correctamente.
- **SC-003**: El ciclo compra-a-pago (solicitud → RFQ → OC → recepción → factura → pago) funciona correctamente.
- **SC-004**: La fabricación con BOM y ruta actualiza correctamente inventario de componentes y productos terminados.
- **SC-005**: Las inspecciones de calidad se registran con referencias correctas a los documentos origen.
- **SC-006**: Los asientos contables se generan correctamente desde transacciones operativas.
- **SC-007**: Todas las relaciones entre módulos se mantienen correctamente con integridad referencial.
- **SC-008**: El sistema maneja correctamente las relaciones circulares y las referencias polimórficas.

## Suposiciones

- Las claves primarias son enteros autoincrementales con sufijo `_id`, excepto códigos naturales donde se especifica.
- Las referencias polimórficas se resuelven a nivel de aplicación con columnas discriminadoras.
- La relación circular departamentos-empleados se resuelve haciendo nullable `manager_employee_id` y poblando después.
- El maestro de productos es compartido por todos los módulos.
- Las direcciones son reutilizables entre empresas, clientes, proveedores y almacenes.
- Los períodos fiscales controlan la contabilización.
- El diagrama ERD en `erp_erd.mermaid` es la representación visual canónica.
