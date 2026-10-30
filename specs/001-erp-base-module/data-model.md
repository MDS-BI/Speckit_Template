# ERP Relational Data Model

**Modules covered:** Finance/Accounting · HR/Payroll · Logistics/Inventory · CRM · Sales · Procurement/Purchasing · Operations/Manufacturing · Quality Control

**Conventions**
- All primary keys are surrogate integer keys named `<entity>_id`, except `currencies` (natural key `currency_code`) and `tax_codes` (surrogate `tax_code_id`).
- `FK` = foreign key. `FK (self)` = self-referencing foreign key (same table).
- Columns marked *(polymorphic)* are logical references resolved by an application-level `reference_module` / `reference_type` discriminator column rather than a database-enforced foreign key, since they can point to rows in different tables. This pattern is used sparingly (inventory transactions, journal entries, quality inspections) and is called out explicitly.
- `employees.department_id → departments` and `departments.manager_employee_id → employees` form a circular reference. In practice this is resolved by making `departments.manager_employee_id` nullable and populating it after the first employee row exists (or by deferring the constraint).
- A companion diagram, `erp_erd.mermaid`, mirrors this document exactly (same tables, same PK/FK names, same relationships).

---

## 0. Core / Shared Master Data

Reference data used by two or more modules.

#### `companies`
Legal entity / operating company.

| Column | Type | Key | References |
|---|---|---|---|
| company_id | INT | PK | |
| company_name | VARCHAR | | |
| tax_id | VARCHAR | | |
| currency_code | VARCHAR | FK | currencies.currency_code |
| address_id | INT | FK | addresses.address_id |

#### `addresses`
Reusable postal address record.

| Column | Type | Key | References |
|---|---|---|---|
| address_id | INT | PK | |
| line1 | VARCHAR | | |
| line2 | VARCHAR | | |
| city | VARCHAR | | |
| state_region | VARCHAR | | |
| postal_code | VARCHAR | | |
| country | VARCHAR | | |

#### `currencies`
| Column | Type | Key | References |
|---|---|---|---|
| currency_code | VARCHAR(3) | PK | |
| currency_name | VARCHAR | | |
| symbol | VARCHAR | | |

#### `tax_codes`
| Column | Type | Key | References |
|---|---|---|---|
| tax_code_id | INT | PK | |
| tax_name | VARCHAR | | |
| tax_rate | DECIMAL | | |

---

## 1. HR / Payroll Module

#### `departments`
| Column | Type | Key | References |
|---|---|---|---|
| department_id | INT | PK | |
| company_id | INT | FK | companies.company_id |
| department_name | VARCHAR | | |
| manager_employee_id | INT | FK (nullable, circular) | employees.employee_id |

#### `job_titles`
| Column | Type | Key | References |
|---|---|---|---|
| job_title_id | INT | PK | |
| title_name | VARCHAR | | |
| grade_level | VARCHAR | | |

#### `employees`
Employee master record — referenced extensively by every other module (sales reps, buyers, inspectors, approvers, etc.).

| Column | Type | Key | References |
|---|---|---|---|
| employee_id | INT | PK | |
| department_id | INT | FK | departments.department_id |
| job_title_id | INT | FK | job_titles.job_title_id |
| manager_id | INT | FK (self) | employees.employee_id |
| first_name | VARCHAR | | |
| last_name | VARCHAR | | |
| email | VARCHAR | | |
| hire_date | DATE | | |
| employment_status | VARCHAR | | |

#### `employee_contracts`
| Column | Type | Key | References |
|---|---|---|---|
| contract_id | INT | PK | |
| employee_id | INT | FK | employees.employee_id |
| contract_type | VARCHAR | | |
| start_date | DATE | | |
| end_date | DATE | | |
| base_salary | DECIMAL | | |
| currency_code | VARCHAR | FK | currencies.currency_code |

#### `leave_types`
| Column | Type | Key | References |
|---|---|---|---|
| leave_type_id | INT | PK | |
| leave_type_name | VARCHAR | | |
| is_paid | BOOLEAN | | |

#### `leave_requests`
| Column | Type | Key | References |
|---|---|---|---|
| leave_request_id | INT | PK | |
| employee_id | INT | FK | employees.employee_id |
| leave_type_id | INT | FK | leave_types.leave_type_id |
| approved_by | INT | FK | employees.employee_id |
| start_date | DATE | | |
| end_date | DATE | | |
| status | VARCHAR | | |

#### `attendance_records`
| Column | Type | Key | References |
|---|---|---|---|
| attendance_id | INT | PK | |
| employee_id | INT | FK | employees.employee_id |
| work_date | DATE | | |
| check_in | DATETIME | | |
| check_out | DATETIME | | |
| hours_worked | DECIMAL | | |

#### `payroll_concepts`
Definitions of earnings/deductions (e.g., base salary, overtime, tax withholding).

| Column | Type | Key | References |
|---|---|---|---|
| concept_id | INT | PK | |
| concept_name | VARCHAR | | |
| concept_type | VARCHAR | | (`earning` / `deduction`) |

#### `payroll_runs`
| Column | Type | Key | References |
|---|---|---|---|
| payroll_run_id | INT | PK | |
| company_id | INT | FK | companies.company_id |
| period_start | DATE | | |
| period_end | DATE | | |
| run_date | DATE | | |
| status | VARCHAR | | |

#### `payslips`
| Column | Type | Key | References |
|---|---|---|---|
| payslip_id | INT | PK | |
| payroll_run_id | INT | FK | payroll_runs.payroll_run_id |
| employee_id | INT | FK | employees.employee_id |
| gross_pay | DECIMAL | | |
| net_pay | DECIMAL | | |

#### `payslip_lines`
| Column | Type | Key | References |
|---|---|---|---|
| payslip_line_id | INT | PK | |
| payslip_id | INT | FK | payslips.payslip_id |
| concept_id | INT | FK | payroll_concepts.concept_id |
| amount | DECIMAL | | |

#### `benefits`
| Column | Type | Key | References |
|---|---|---|---|
| benefit_id | INT | PK | |
| benefit_name | VARCHAR | | |
| provider | VARCHAR | | |
| cost | DECIMAL | | |

#### `employee_benefits`
| Column | Type | Key | References |
|---|---|---|---|
| employee_benefit_id | INT | PK | |
| employee_id | INT | FK | employees.employee_id |
| benefit_id | INT | FK | benefits.benefit_id |
| enrollment_date | DATE | | |

#### `performance_reviews`
| Column | Type | Key | References |
|---|---|---|---|
| review_id | INT | PK | |
| employee_id | INT | FK | employees.employee_id |
| reviewer_id | INT | FK | employees.employee_id |
| review_date | DATE | | |
| score | DECIMAL | | |
| comments | TEXT | | |

---

## 2. Finance / Accounting Module

#### `chart_of_accounts`
| Column | Type | Key | References |
|---|---|---|---|
| account_id | INT | PK | |
| parent_account_id | INT | FK (self) | chart_of_accounts.account_id |
| account_code | VARCHAR | | |
| account_name | VARCHAR | | |
| account_type | VARCHAR | | (asset/liability/equity/revenue/expense) |

#### `fiscal_periods`
| Column | Type | Key | References |
|---|---|---|---|
| period_id | INT | PK | |
| company_id | INT | FK | companies.company_id |
| period_name | VARCHAR | | |
| start_date | DATE | | |
| end_date | DATE | | |
| status | VARCHAR | | |

#### `cost_centers`
| Column | Type | Key | References |
|---|---|---|---|
| cost_center_id | INT | PK | |
| department_id | INT | FK | departments.department_id *(cross-module: HR)* |
| cost_center_name | VARCHAR | | |

#### `budgets`
| Column | Type | Key | References |
|---|---|---|---|
| budget_id | INT | PK | |
| cost_center_id | INT | FK | cost_centers.cost_center_id |
| account_id | INT | FK | chart_of_accounts.account_id |
| period_id | INT | FK | fiscal_periods.period_id |
| budgeted_amount | DECIMAL | | |

#### `journal_entries`
| Column | Type | Key | References |
|---|---|---|---|
| journal_entry_id | INT | PK | |
| period_id | INT | FK | fiscal_periods.period_id |
| created_by | INT | FK | employees.employee_id *(cross-module: HR)* |
| entry_date | DATE | | |
| description | VARCHAR | | |
| source_module | VARCHAR | *(polymorphic)* | e.g. `sales`, `procurement`, `payroll` |
| source_reference_id | INT | *(polymorphic)* | id of the originating document |

#### `journal_entry_lines`
| Column | Type | Key | References |
|---|---|---|---|
| journal_entry_line_id | INT | PK | |
| journal_entry_id | INT | FK | journal_entries.journal_entry_id |
| account_id | INT | FK | chart_of_accounts.account_id |
| debit_amount | DECIMAL | | |
| credit_amount | DECIMAL | | |

#### `bank_accounts`
| Column | Type | Key | References |
|---|---|---|---|
| bank_account_id | INT | PK | |
| company_id | INT | FK | companies.company_id |
| currency_code | VARCHAR | FK | currencies.currency_code |
| bank_name | VARCHAR | | |
| account_number | VARCHAR | | |

#### `bank_transactions`
| Column | Type | Key | References |
|---|---|---|---|
| bank_transaction_id | INT | PK | |
| bank_account_id | INT | FK | bank_accounts.bank_account_id |
| transaction_date | DATE | | |
| amount | DECIMAL | | |
| transaction_type | VARCHAR | | |
| reconciled_flag | BOOLEAN | | |

#### `ar_invoices` (Accounts Receivable)
| Column | Type | Key | References |
|---|---|---|---|
| ar_invoice_id | INT | PK | |
| customer_id | INT | FK | customers.customer_id *(cross-module: CRM)* |
| sales_order_id | INT | FK | sales_orders.sales_order_id *(cross-module: Sales)* |
| invoice_date | DATE | | |
| due_date | DATE | | |
| total_amount | DECIMAL | | |
| status | VARCHAR | | |

#### `ar_invoice_lines`
| Column | Type | Key | References |
|---|---|---|---|
| ar_invoice_line_id | INT | PK | |
| ar_invoice_id | INT | FK | ar_invoices.ar_invoice_id |
| product_id | INT | FK | products.product_id *(cross-module: Logistics/Inventory)* |
| tax_code_id | INT | FK | tax_codes.tax_code_id |
| quantity | DECIMAL | | |
| unit_price | DECIMAL | | |
| line_total | DECIMAL | | |

#### `ar_receipts`
| Column | Type | Key | References |
|---|---|---|---|
| ar_receipt_id | INT | PK | |
| customer_id | INT | FK | customers.customer_id *(cross-module: CRM)* |
| bank_account_id | INT | FK | bank_accounts.bank_account_id |
| receipt_date | DATE | | |
| amount | DECIMAL | | |

#### `ar_receipt_applications`
Links receipts to the invoice(s) they settle (many-to-many).

| Column | Type | Key | References |
|---|---|---|---|
| ar_application_id | INT | PK | |
| ar_receipt_id | INT | FK | ar_receipts.ar_receipt_id |
| ar_invoice_id | INT | FK | ar_invoices.ar_invoice_id |
| applied_amount | DECIMAL | | |

#### `ap_invoices` (Accounts Payable)
| Column | Type | Key | References |
|---|---|---|---|
| ap_invoice_id | INT | PK | |
| vendor_id | INT | FK | vendors.vendor_id *(cross-module: Procurement)* |
| purchase_order_id | INT | FK | purchase_orders.purchase_order_id *(cross-module: Procurement)* |
| invoice_date | DATE | | |
| due_date | DATE | | |
| total_amount | DECIMAL | | |
| status | VARCHAR | | |

#### `ap_invoice_lines`
| Column | Type | Key | References |
|---|---|---|---|
| ap_invoice_line_id | INT | PK | |
| ap_invoice_id | INT | FK | ap_invoices.ap_invoice_id |
| product_id | INT | FK | products.product_id *(cross-module: Logistics/Inventory)* |
| tax_code_id | INT | FK | tax_codes.tax_code_id |
| quantity | DECIMAL | | |
| unit_price | DECIMAL | | |
| line_total | DECIMAL | | |

#### `ap_payments`
| Column | Type | Key | References |
|---|---|---|---|
| ap_payment_id | INT | PK | |
| vendor_id | INT | FK | vendors.vendor_id *(cross-module: Procurement)* |
| bank_account_id | INT | FK | bank_accounts.bank_account_id |
| payment_date | DATE | | |
| amount | DECIMAL | | |

#### `ap_payment_applications`
| Column | Type | Key | References |
|---|---|---|---|
| ap_application_id | INT | PK | |
| ap_payment_id | INT | FK | ap_payments.ap_payment_id |
| ap_invoice_id | INT | FK | ap_invoices.ap_invoice_id |
| applied_amount | DECIMAL | | |

#### `fixed_assets`
| Column | Type | Key | References |
|---|---|---|---|
| asset_id | INT | PK | |
| department_id | INT | FK | departments.department_id *(cross-module: HR)* |
| purchase_order_id | INT | FK | purchase_orders.purchase_order_id *(cross-module: Procurement)* |
| asset_name | VARCHAR | | |
| acquisition_date | DATE | | |
| acquisition_cost | DECIMAL | | |
| useful_life_years | INT | | |

#### `asset_depreciation`
| Column | Type | Key | References |
|---|---|---|---|
| depreciation_id | INT | PK | |
| asset_id | INT | FK | fixed_assets.asset_id |
| period_id | INT | FK | fiscal_periods.period_id |
| depreciation_amount | DECIMAL | | |

---

## 3. Logistics / Inventory Module

#### `product_categories`
| Column | Type | Key | References |
|---|---|---|---|
| product_category_id | INT | PK | |
| parent_category_id | INT | FK (self) | product_categories.product_category_id |
| category_name | VARCHAR | | |

#### `units_of_measure`
| Column | Type | Key | References |
|---|---|---|---|
| uom_id | INT | PK | |
| uom_name | VARCHAR | | |
| uom_symbol | VARCHAR | | |

#### `products`
Item master — the single source of truth for anything bought, sold, stocked, or manufactured. Referenced by nearly every other module.

| Column | Type | Key | References |
|---|---|---|---|
| product_id | INT | PK | |
| product_category_id | INT | FK | product_categories.product_category_id |
| uom_id | INT | FK | units_of_measure.uom_id |
| sku | VARCHAR | | |
| product_name | VARCHAR | | |
| product_type | VARCHAR | | (raw_material / finished_good / service) |
| standard_cost | DECIMAL | | |
| is_active | BOOLEAN | | |

#### `warehouses`
| Column | Type | Key | References |
|---|---|---|---|
| warehouse_id | INT | PK | |
| company_id | INT | FK | companies.company_id |
| address_id | INT | FK | addresses.address_id |
| warehouse_name | VARCHAR | | |

#### `warehouse_locations`
| Column | Type | Key | References |
|---|---|---|---|
| location_id | INT | PK | |
| warehouse_id | INT | FK | warehouses.warehouse_id |
| location_code | VARCHAR | | |
| aisle | VARCHAR | | |
| rack | VARCHAR | | |
| bin | VARCHAR | | |

#### `inventory_stock`
Current on-hand balances (one row per product/warehouse/location).

| Column | Type | Key | References |
|---|---|---|---|
| stock_id | INT | PK | |
| product_id | INT | FK | products.product_id |
| warehouse_id | INT | FK | warehouses.warehouse_id |
| location_id | INT | FK | warehouse_locations.location_id |
| quantity_on_hand | DECIMAL | | |
| quantity_reserved | DECIMAL | | |

#### `inventory_transactions`
Full movement ledger (receipts, issues, transfers, adjustments).

| Column | Type | Key | References |
|---|---|---|---|
| inventory_transaction_id | INT | PK | |
| product_id | INT | FK | products.product_id |
| warehouse_id | INT | FK | warehouses.warehouse_id |
| transaction_type | VARCHAR | | |
| quantity | DECIMAL | | |
| transaction_date | DATETIME | | |
| reference_module | VARCHAR | *(polymorphic)* | e.g. `sales`, `procurement`, `manufacturing` |
| reference_id | INT | *(polymorphic)* | id of the originating document |

#### `stock_transfers`
| Column | Type | Key | References |
|---|---|---|---|
| transfer_id | INT | PK | |
| from_warehouse_id | INT | FK | warehouses.warehouse_id |
| to_warehouse_id | INT | FK | warehouses.warehouse_id |
| transfer_date | DATE | | |
| status | VARCHAR | | |

#### `stock_transfer_lines`
| Column | Type | Key | References |
|---|---|---|---|
| transfer_line_id | INT | PK | |
| transfer_id | INT | FK | stock_transfers.transfer_id |
| product_id | INT | FK | products.product_id |
| quantity | DECIMAL | | |

#### `carriers`
| Column | Type | Key | References |
|---|---|---|---|
| carrier_id | INT | PK | |
| carrier_name | VARCHAR | | |
| contact_info | VARCHAR | | |

#### `shipments`
Outbound deliveries fulfilling sales orders.

| Column | Type | Key | References |
|---|---|---|---|
| shipment_id | INT | PK | |
| sales_order_id | INT | FK | sales_orders.sales_order_id *(cross-module: Sales)* |
| warehouse_id | INT | FK | warehouses.warehouse_id |
| carrier_id | INT | FK | carriers.carrier_id |
| ship_date | DATE | | |
| tracking_number | VARCHAR | | |
| status | VARCHAR | | |

#### `shipment_lines`
| Column | Type | Key | References |
|---|---|---|---|
| shipment_line_id | INT | PK | |
| shipment_id | INT | FK | shipments.shipment_id |
| product_id | INT | FK | products.product_id |
| quantity_shipped | DECIMAL | | |

#### `goods_receipts`
Inbound receipts fulfilling purchase orders.

| Column | Type | Key | References |
|---|---|---|---|
| goods_receipt_id | INT | PK | |
| purchase_order_id | INT | FK | purchase_orders.purchase_order_id *(cross-module: Procurement)* |
| warehouse_id | INT | FK | warehouses.warehouse_id |
| receipt_date | DATE | | |

#### `goods_receipt_lines`
| Column | Type | Key | References |
|---|---|---|---|
| goods_receipt_line_id | INT | PK | |
| goods_receipt_id | INT | FK | goods_receipts.goods_receipt_id |
| product_id | INT | FK | products.product_id |
| quantity_received | DECIMAL | | |

---

## 4. CRM Module

#### `customers`
| Column | Type | Key | References |
|---|---|---|---|
| customer_id | INT | PK | |
| address_id | INT | FK | addresses.address_id |
| assigned_employee_id | INT | FK | employees.employee_id *(cross-module: HR)* |
| customer_name | VARCHAR | | |
| email | VARCHAR | | |
| phone | VARCHAR | | |
| customer_since | DATE | | |

#### `contacts`
Individual people at a customer account.

| Column | Type | Key | References |
|---|---|---|---|
| contact_id | INT | PK | |
| customer_id | INT | FK | customers.customer_id |
| first_name | VARCHAR | | |
| last_name | VARCHAR | | |
| email | VARCHAR | | |
| role | VARCHAR | | |

#### `leads`
| Column | Type | Key | References |
|---|---|---|---|
| lead_id | INT | PK | |
| assigned_employee_id | INT | FK | employees.employee_id *(cross-module: HR)* |
| lead_name | VARCHAR | | |
| source | VARCHAR | | |
| status | VARCHAR | | |

#### `opportunity_stages`
| Column | Type | Key | References |
|---|---|---|---|
| stage_id | INT | PK | |
| stage_name | VARCHAR | | |
| sequence | INT | | |

#### `opportunities`
| Column | Type | Key | References |
|---|---|---|---|
| opportunity_id | INT | PK | |
| customer_id | INT | FK | customers.customer_id |
| lead_id | INT | FK | leads.lead_id |
| assigned_employee_id | INT | FK | employees.employee_id *(cross-module: HR)* |
| stage_id | INT | FK | opportunity_stages.stage_id |
| estimated_value | DECIMAL | | |
| close_date | DATE | | |

#### `interactions`
Log of calls, emails, meetings.

| Column | Type | Key | References |
|---|---|---|---|
| interaction_id | INT | PK | |
| customer_id | INT | FK | customers.customer_id |
| contact_id | INT | FK | contacts.contact_id |
| employee_id | INT | FK | employees.employee_id *(cross-module: HR)* |
| interaction_type | VARCHAR | | |
| interaction_date | DATETIME | | |
| notes | TEXT | | |

#### `campaigns`
| Column | Type | Key | References |
|---|---|---|---|
| campaign_id | INT | PK | |
| campaign_name | VARCHAR | | |
| start_date | DATE | | |
| end_date | DATE | | |
| budget | DECIMAL | | |

#### `campaign_members`
| Column | Type | Key | References |
|---|---|---|---|
| campaign_member_id | INT | PK | |
| campaign_id | INT | FK | campaigns.campaign_id |
| lead_id | INT | FK | leads.lead_id |
| customer_id | INT | FK | customers.customer_id |

#### `support_tickets`
| Column | Type | Key | References |
|---|---|---|---|
| ticket_id | INT | PK | |
| customer_id | INT | FK | customers.customer_id |
| product_id | INT | FK | products.product_id *(cross-module: Logistics/Inventory)* |
| assigned_employee_id | INT | FK | employees.employee_id *(cross-module: HR)* |
| subject | VARCHAR | | |
| status | VARCHAR | | |
| priority | VARCHAR | | |
| created_date | DATETIME | | |

---

## 5. Sales Module

#### `price_lists`
| Column | Type | Key | References |
|---|---|---|---|
| price_list_id | INT | PK | |
| currency_code | VARCHAR | FK | currencies.currency_code |
| price_list_name | VARCHAR | | |
| valid_from | DATE | | |
| valid_to | DATE | | |

#### `price_list_items`
| Column | Type | Key | References |
|---|---|---|---|
| price_list_item_id | INT | PK | |
| price_list_id | INT | FK | price_lists.price_list_id |
| product_id | INT | FK | products.product_id *(cross-module: Logistics/Inventory)* |
| unit_price | DECIMAL | | |

#### `sales_quotes`
| Column | Type | Key | References |
|---|---|---|---|
| quote_id | INT | PK | |
| customer_id | INT | FK | customers.customer_id *(cross-module: CRM)* |
| opportunity_id | INT | FK | opportunities.opportunity_id *(cross-module: CRM)* |
| employee_id | INT | FK | employees.employee_id *(cross-module: HR)* |
| quote_date | DATE | | |
| expiry_date | DATE | | |
| status | VARCHAR | | |

#### `sales_quote_lines`
| Column | Type | Key | References |
|---|---|---|---|
| quote_line_id | INT | PK | |
| quote_id | INT | FK | sales_quotes.quote_id |
| product_id | INT | FK | products.product_id *(cross-module: Logistics/Inventory)* |
| quantity | DECIMAL | | |
| unit_price | DECIMAL | | |

#### `sales_orders`
Central document referenced by Finance (AR), Logistics (shipments), and Operations (make-to-order production).

| Column | Type | Key | References |
|---|---|---|---|
| sales_order_id | INT | PK | |
| customer_id | INT | FK | customers.customer_id *(cross-module: CRM)* |
| employee_id | INT | FK | employees.employee_id *(cross-module: HR)* |
| opportunity_id | INT | FK | opportunities.opportunity_id *(cross-module: CRM)* |
| quote_id | INT | FK | sales_quotes.quote_id |
| order_date | DATE | | |
| status | VARCHAR | | |
| total_amount | DECIMAL | | |

#### `sales_order_lines`
| Column | Type | Key | References |
|---|---|---|---|
| sales_order_line_id | INT | PK | |
| sales_order_id | INT | FK | sales_orders.sales_order_id |
| product_id | INT | FK | products.product_id *(cross-module: Logistics/Inventory)* |
| quantity | DECIMAL | | |
| unit_price | DECIMAL | | |

#### `returns_rma`
| Column | Type | Key | References |
|---|---|---|---|
| rma_id | INT | PK | |
| sales_order_id | INT | FK | sales_orders.sales_order_id |
| customer_id | INT | FK | customers.customer_id *(cross-module: CRM)* |
| rma_date | DATE | | |
| reason | VARCHAR | | |
| status | VARCHAR | | |

#### `rma_lines`
| Column | Type | Key | References |
|---|---|---|---|
| rma_line_id | INT | PK | |
| rma_id | INT | FK | returns_rma.rma_id |
| product_id | INT | FK | products.product_id *(cross-module: Logistics/Inventory)* |
| quantity | DECIMAL | | |

---

## 6. Procurement / Purchasing Module

#### `vendors`
| Column | Type | Key | References |
|---|---|---|---|
| vendor_id | INT | PK | |
| address_id | INT | FK | addresses.address_id |
| vendor_name | VARCHAR | | |
| email | VARCHAR | | |
| phone | VARCHAR | | |
| payment_terms | VARCHAR | | |

#### `vendor_products`
Which vendors supply which items, at what cost/lead time.

| Column | Type | Key | References |
|---|---|---|---|
| vendor_product_id | INT | PK | |
| vendor_id | INT | FK | vendors.vendor_id |
| product_id | INT | FK | products.product_id *(cross-module: Logistics/Inventory)* |
| vendor_sku | VARCHAR | | |
| lead_time_days | INT | | |
| unit_cost | DECIMAL | | |

#### `purchase_requisitions`
Internal request to buy, prior to vendor selection.

| Column | Type | Key | References |
|---|---|---|---|
| requisition_id | INT | PK | |
| department_id | INT | FK | departments.department_id *(cross-module: HR)* |
| employee_id | INT | FK | employees.employee_id *(cross-module: HR)* |
| requisition_date | DATE | | |
| status | VARCHAR | | |

#### `purchase_requisition_lines`
| Column | Type | Key | References |
|---|---|---|---|
| requisition_line_id | INT | PK | |
| requisition_id | INT | FK | purchase_requisitions.requisition_id |
| product_id | INT | FK | products.product_id *(cross-module: Logistics/Inventory)* |
| quantity | DECIMAL | | |

#### `rfqs`
Request for quotation sent to vendors.

| Column | Type | Key | References |
|---|---|---|---|
| rfq_id | INT | PK | |
| requisition_id | INT | FK | purchase_requisitions.requisition_id |
| rfq_date | DATE | | |
| status | VARCHAR | | |

#### `rfq_lines`
| Column | Type | Key | References |
|---|---|---|---|
| rfq_line_id | INT | PK | |
| rfq_id | INT | FK | rfqs.rfq_id |
| product_id | INT | FK | products.product_id *(cross-module: Logistics/Inventory)* |
| quantity | DECIMAL | | |

#### `rfq_vendor_quotes`
Vendor responses to an RFQ.

| Column | Type | Key | References |
|---|---|---|---|
| rfq_quote_id | INT | PK | |
| rfq_id | INT | FK | rfqs.rfq_id |
| vendor_id | INT | FK | vendors.vendor_id |
| quoted_price | DECIMAL | | |
| quoted_lead_time | INT | | |

#### `purchase_orders`
Central procurement document referenced by Finance (AP) and Logistics (goods receipt).

| Column | Type | Key | References |
|---|---|---|---|
| purchase_order_id | INT | PK | |
| vendor_id | INT | FK | vendors.vendor_id |
| requisition_id | INT | FK | purchase_requisitions.requisition_id |
| employee_id | INT | FK | employees.employee_id *(cross-module: HR — buyer)* |
| order_date | DATE | | |
| status | VARCHAR | | |
| total_amount | DECIMAL | | |

#### `purchase_order_lines`
| Column | Type | Key | References |
|---|---|---|---|
| purchase_order_line_id | INT | PK | |
| purchase_order_id | INT | FK | purchase_orders.purchase_order_id |
| product_id | INT | FK | products.product_id *(cross-module: Logistics/Inventory)* |
| quantity | DECIMAL | | |
| unit_price | DECIMAL | | |

---

## 7. Operations / Manufacturing Module

#### `bill_of_materials`
| Column | Type | Key | References |
|---|---|---|---|
| bom_id | INT | PK | |
| product_id | INT | FK | products.product_id *(cross-module: Logistics/Inventory — finished good)* |
| version | VARCHAR | | |
| is_active | BOOLEAN | | |

#### `bom_components`
| Column | Type | Key | References |
|---|---|---|---|
| bom_component_id | INT | PK | |
| bom_id | INT | FK | bill_of_materials.bom_id |
| component_product_id | INT | FK | products.product_id *(cross-module: Logistics/Inventory)* |
| quantity_required | DECIMAL | | |

#### `work_centers`
| Column | Type | Key | References |
|---|---|---|---|
| work_center_id | INT | PK | |
| warehouse_id | INT | FK | warehouses.warehouse_id *(cross-module: Logistics/Inventory)* |
| work_center_name | VARCHAR | | |
| capacity_per_hour | DECIMAL | | |

#### `routings`
Sequence of operations required to manufacture a product.

| Column | Type | Key | References |
|---|---|---|---|
| routing_id | INT | PK | |
| product_id | INT | FK | products.product_id *(cross-module: Logistics/Inventory)* |
| version | VARCHAR | | |

#### `routing_operations`
| Column | Type | Key | References |
|---|---|---|---|
| routing_operation_id | INT | PK | |
| routing_id | INT | FK | routings.routing_id |
| work_center_id | INT | FK | work_centers.work_center_id |
| sequence_number | INT | | |
| operation_name | VARCHAR | | |
| standard_time_minutes | DECIMAL | | |

#### `production_orders`
| Column | Type | Key | References |
|---|---|---|---|
| production_order_id | INT | PK | |
| product_id | INT | FK | products.product_id *(cross-module: Logistics/Inventory)* |
| bom_id | INT | FK | bill_of_materials.bom_id |
| routing_id | INT | FK | routings.routing_id |
| sales_order_id | INT | FK (nullable) | sales_orders.sales_order_id *(cross-module: Sales — make-to-order)* |
| warehouse_id | INT | FK | warehouses.warehouse_id *(cross-module: Logistics/Inventory)* |
| quantity_planned | DECIMAL | | |
| start_date | DATE | | |
| end_date | DATE | | |
| status | VARCHAR | | |

#### `production_order_operations`
| Column | Type | Key | References |
|---|---|---|---|
| po_operation_id | INT | PK | |
| production_order_id | INT | FK | production_orders.production_order_id |
| work_center_id | INT | FK | work_centers.work_center_id |
| sequence_number | INT | | |
| status | VARCHAR | | |
| actual_time_minutes | DECIMAL | | |

#### `material_consumption`
Components consumed by a production order (actuals, vs. `bom_components` which is planned).

| Column | Type | Key | References |
|---|---|---|---|
| consumption_id | INT | PK | |
| production_order_id | INT | FK | production_orders.production_order_id |
| product_id | INT | FK | products.product_id *(cross-module: Logistics/Inventory)* |
| quantity_consumed | DECIMAL | | |
| consumption_date | DATE | | |

#### `production_output`
Finished goods produced by a production order.

| Column | Type | Key | References |
|---|---|---|---|
| output_id | INT | PK | |
| production_order_id | INT | FK | production_orders.production_order_id |
| product_id | INT | FK | products.product_id *(cross-module: Logistics/Inventory)* |
| quantity_produced | DECIMAL | | |
| output_date | DATE | | |

---

## 8. Quality Control Module

#### `quality_inspection_plans`
Defines what to check for a given product.

| Column | Type | Key | References |
|---|---|---|---|
| inspection_plan_id | INT | PK | |
| product_id | INT | FK | products.product_id *(cross-module: Logistics/Inventory)* |
| plan_name | VARCHAR | | |
| applicable_stage | VARCHAR | | (incoming / in_process / final) |

#### `quality_inspection_criteria`
| Column | Type | Key | References |
|---|---|---|---|
| criteria_id | INT | PK | |
| inspection_plan_id | INT | FK | quality_inspection_plans.inspection_plan_id |
| criteria_name | VARCHAR | | |
| expected_value | VARCHAR | | |
| tolerance | VARCHAR | | |

#### `quality_inspections`
An actual inspection event. Can be triggered from a goods receipt (incoming), a production order (in-process/final), or a shipment (outgoing) — hence the polymorphic reference.

| Column | Type | Key | References |
|---|---|---|---|
| inspection_id | INT | PK | |
| inspection_plan_id | INT | FK | quality_inspection_plans.inspection_plan_id |
| inspector_id | INT | FK | employees.employee_id *(cross-module: HR)* |
| reference_module | VARCHAR | *(polymorphic)* | e.g. `goods_receipt`, `production_order`, `shipment` |
| reference_id | INT | *(polymorphic)* | id of the originating document |
| inspection_date | DATE | | |
| overall_result | VARCHAR | | |

#### `quality_inspection_results`
| Column | Type | Key | References |
|---|---|---|---|
| result_id | INT | PK | |
| inspection_id | INT | FK | quality_inspections.inspection_id |
| criteria_id | INT | FK | quality_inspection_criteria.criteria_id |
| measured_value | VARCHAR | | |
| pass_fail | BOOLEAN | | |

#### `non_conformances`
| Column | Type | Key | References |
|---|---|---|---|
| non_conformance_id | INT | PK | |
| inspection_id | INT | FK | quality_inspections.inspection_id |
| product_id | INT | FK | products.product_id *(cross-module: Logistics/Inventory)* |
| description | TEXT | | |
| severity | VARCHAR | | |
| status | VARCHAR | | |

#### `corrective_actions`
| Column | Type | Key | References |
|---|---|---|---|
| corrective_action_id | INT | PK | |
| non_conformance_id | INT | FK | non_conformances.non_conformance_id |
| responsible_employee_id | INT | FK | employees.employee_id *(cross-module: HR)* |
| action_description | TEXT | | |
| due_date | DATE | | |
| status | VARCHAR | | |

---

## 9. Cross-Module Relationship Map

This summarizes only the foreign keys that cross a module boundary (full intra-module relationships are listed with each table above).

| # | Source (Module.Table.Column) | Target (Module.Table.Column) | Meaning |
|---|---|---|---|
| 1 | HR.employees.department_id | HR.departments.department_id | intra-HR, shown for context |
| 2 | Finance.cost_centers.department_id | HR.departments.department_id | cost centers roll up to org units |
| 3 | Finance.journal_entries.created_by | HR.employees.employee_id | GL postings attributed to staff |
| 4 | Finance.fixed_assets.department_id | HR.departments.department_id | asset ownership by department |
| 5 | Finance.fixed_assets.purchase_order_id | Procurement.purchase_orders.purchase_order_id | asset acquired via PO |
| 6 | Finance.ar_invoices.customer_id | CRM.customers.customer_id | who owes the money |
| 7 | Finance.ar_invoices.sales_order_id | Sales.sales_orders.sales_order_id | invoice bills a sales order |
| 8 | Finance.ar_invoice_lines.product_id | Logistics.products.product_id | item being invoiced |
| 9 | Finance.ar_receipts.customer_id | CRM.customers.customer_id | who paid |
| 10 | Finance.ap_invoices.vendor_id | Procurement.vendors.vendor_id | who is owed money |
| 11 | Finance.ap_invoices.purchase_order_id | Procurement.purchase_orders.purchase_order_id | invoice bills a PO |
| 12 | Finance.ap_invoice_lines.product_id | Logistics.products.product_id | item being billed |
| 13 | Finance.ap_payments.vendor_id | Procurement.vendors.vendor_id | who was paid |
| 14 | Logistics.shipments.sales_order_id | Sales.sales_orders.sales_order_id | fulfillment of an order |
| 15 | Logistics.goods_receipts.purchase_order_id | Procurement.purchase_orders.purchase_order_id | receiving against a PO |
| 16 | Logistics.support_tickets... | — (see CRM below) | — |
| 17 | CRM.customers.assigned_employee_id | HR.employees.employee_id | account owner |
| 18 | CRM.leads.assigned_employee_id | HR.employees.employee_id | lead owner |
| 19 | CRM.opportunities.assigned_employee_id | HR.employees.employee_id | opportunity owner |
| 20 | CRM.interactions.employee_id | HR.employees.employee_id | who logged the interaction |
| 21 | CRM.support_tickets.customer_id | CRM.customers.customer_id | intra-CRM, shown for context |
| 22 | CRM.support_tickets.product_id | Logistics.products.product_id | product the ticket concerns |
| 23 | CRM.support_tickets.assigned_employee_id | HR.employees.employee_id | ticket owner |
| 24 | Sales.sales_quotes.customer_id | CRM.customers.customer_id | who is being quoted |
| 25 | Sales.sales_quotes.opportunity_id | CRM.opportunities.opportunity_id | quote tied to a deal |
| 26 | Sales.sales_quotes.employee_id | HR.employees.employee_id | sales rep |
| 27 | Sales.sales_quote_lines.product_id | Logistics.products.product_id | quoted item |
| 28 | Sales.sales_orders.customer_id | CRM.customers.customer_id | buyer |
| 29 | Sales.sales_orders.opportunity_id | CRM.opportunities.opportunity_id | order tied to a deal |
| 30 | Sales.sales_orders.employee_id | HR.employees.employee_id | sales rep |
| 31 | Sales.sales_order_lines.product_id | Logistics.products.product_id | ordered item |
| 32 | Sales.price_list_items.product_id | Logistics.products.product_id | priced item |
| 33 | Sales.returns_rma.customer_id | CRM.customers.customer_id | who is returning goods |
| 34 | Sales.rma_lines.product_id | Logistics.products.product_id | returned item |
| 35 | Procurement.vendor_products.product_id | Logistics.products.product_id | what a vendor supplies |
| 36 | Procurement.purchase_requisitions.department_id | HR.departments.department_id | requesting department |
| 37 | Procurement.purchase_requisitions.employee_id | HR.employees.employee_id | requester |
| 38 | Procurement.purchase_requisition_lines.product_id | Logistics.products.product_id | requested item |
| 39 | Procurement.rfq_lines.product_id | Logistics.products.product_id | RFQ item |
| 40 | Procurement.purchase_orders.employee_id | HR.employees.employee_id | buyer |
| 41 | Procurement.purchase_order_lines.product_id | Logistics.products.product_id | ordered item |
| 42 | Operations.bill_of_materials.product_id | Logistics.products.product_id | finished good |
| 43 | Operations.bom_components.component_product_id | Logistics.products.product_id | raw material/component |
| 44 | Operations.work_centers.warehouse_id | Logistics.warehouses.warehouse_id | shop floor location |
| 45 | Operations.routings.product_id | Logistics.products.product_id | product being routed |
| 46 | Operations.production_orders.product_id | Logistics.products.product_id | product being made |
| 47 | Operations.production_orders.sales_order_id | Sales.sales_orders.sales_order_id | make-to-order link |
| 48 | Operations.production_orders.warehouse_id | Logistics.warehouses.warehouse_id | production warehouse |
| 49 | Operations.material_consumption.product_id | Logistics.products.product_id | consumed component |
| 50 | Operations.production_output.product_id | Logistics.products.product_id | produced good |
| 51 | Quality.quality_inspection_plans.product_id | Logistics.products.product_id | product under QC |
| 52 | Quality.quality_inspections.inspector_id | HR.employees.employee_id | who inspected |
| 53 | Quality.quality_inspections.reference_id | *(polymorphic)* Logistics.goods_receipts / Operations.production_orders / Logistics.shipments | what was inspected |
| 54 | Quality.non_conformances.product_id | Logistics.products.product_id | defective item |
| 55 | Quality.corrective_actions.responsible_employee_id | HR.employees.employee_id | who must fix it |

---

## 10. Design Notes

- **Item master unification.** `products` lives conceptually in Logistics/Inventory but is the backbone that Sales, Procurement, Operations, and Quality all key off of — this is standard ERP practice (one item master, many module-specific extensions).
- **Document chain traceability.** Sales Quote → Sales Order → Shipment → AR Invoice → AR Receipt, and symmetrically Requisition → RFQ → Purchase Order → Goods Receipt → AP Invoice → AP Payment, so the full order-to-cash and procure-to-pay cycles are traceable end to end.
- **Polymorphic references** (`journal_entries`, `inventory_transactions`, `quality_inspections`) are a deliberate simplification used by most real ERPs to avoid one FK column per possible source document; they should be enforced at the application layer, or replaced with per-source junction tables if strict referential integrity is required.
- **Circular reference**: `departments.manager_employee_id` ↔ `employees.department_id` is intentional and common; handle via nullable column + deferred/late population.
- Not modeled here (out of scope for "regular operations" but commonly added later): system users/roles/permissions, multi-currency revaluation, tax jurisdictions detail, serial/lot tracking, and localization/tax filing tables.

See `erp_erd.mermaid` for the visual entity-relationship diagram matching this document.
