# Investigación: Sistema ERP Integral

## Decisión: Seguir modelo relacional definido en data-model.md

**Justificación**: El modelo relacional proporciona una estructura completa y probada para un sistema ERP, cubriendo todos los módulos empresariales con sus relaciones correctas, referencias cruzadas entre módulos y patrones ERP estándar.

## Decisiones Arquitectónicas

- **Datos maestros compartidos**: `companies`, `addresses`, `currencies`, `tax_codes` son compartidos por todos los módulos
- **Maestro de productos unificado**: `products` en el módulo de inventario sirve como fuente única para ventas, compras, fabricación y calidad
- **Referencias polimórficas**: Usadas para `journal_entries`, `inventory_transactions`, `quality_inspections` con resolución a nivel de aplicación
- **Relación circular**: `departments.manager_employee_id` ↔ `employees.department_id` manejada con nullable y poblamiento diferido
- **Trazabilidad completa**: Cadena orden-a-cobro y compra-a-pago completamente rastreable
- **Claves primarias**: Enteros surrogate (`<tabla>_id`), excepto claves naturales donde aplique

## Módulos Implementados

1. **Core/Shared** - Datos maestros compartidos
2. **HR/Payroll** - Gestión de recursos humanos y nómina
3. **Finance/Accounting** - Contabilidad, cuentas por cobrar/pagar, activos
4. **Logistics/Inventory** - Inventario, almacenes, embarques
5. **CRM** - Gestión de relaciones con clientes
6. **Sales** - Ventas, cotizaciones, órdenes
7. **Procurement/Purchasing** - Compras, proveedores
8. **Operations/Manufacturing** - Producción, BOM, rutas
9. **Quality Control** - Inspecciones, no conformidades
