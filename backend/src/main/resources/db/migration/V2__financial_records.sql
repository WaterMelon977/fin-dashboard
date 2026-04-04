-- =============================================================================
-- categories
-- =============================================================================
-- using a table instead of an enum so admins can create custom categories
-- at runtime without a schema migration. is_system = true rows are seeded
-- and protected from deletion at the service layer.
-- =============================================================================

create table categories (
    id          bigserial       primary key,
    name        varchar(80)     not null,
    type        varchar(10)     not null,
    description varchar(300),
    is_system   boolean         not null default false,
    is_active   boolean         not null default true,
    created_at  timestamp       not null default now(),
    created_by  bigint          references users(id) on delete set null
);

alter table categories
    add constraint uq_categories_name
        unique (name);

alter table categories
    add constraint chk_categories_type
        check (type in ('INCOME', 'EXPENSE', 'BOTH'));

-- partial index — most queries filter on active categories only
create index idx_categories_type
    on categories (type)
    where is_active = true;

create index idx_categories_is_system
    on categories (is_system)
    where is_active = true;

-- =============================================================================
-- financial_records
-- =============================================================================
-- amount stored as bigint paise (smallest currency unit) to avoid floating
-- point representation errors. rupees 42000.50 → paise 4200050.
--
-- soft delete: is_deleted + deleted_at pair, enforced by a check constraint
-- so the database itself rejects inconsistent state (deleted without timestamp
-- or timestamped without the flag). @Where and @SQLDelete on the JPA entity
-- provide a second layer of enforcement at the application level.
-- =============================================================================

create table financial_records (
    id               bigserial       primary key,

    -- ownership
    user_id          bigint          not null
                                         references users(id)
                                         on delete restrict,

    category_id      bigint          not null
                                         references categories(id)
                                         on delete restrict,

    -- money
    amount_paise     bigint          not null,
    currency         char(3)         not null default 'INR',

    -- classification
    type             varchar(10)     not null,

    -- when the real-world transaction occurred, not when the row was inserted
    transaction_date date            not null,

    -- optional human context
    description      varchar(500),
    notes            text,

    -- soft delete pair — both columns move together or not at all
    is_deleted       boolean         not null default false,
    deleted_at       timestamp,
    deleted_by       bigint          references users(id) on delete set null,

    -- audit columns — populated by spring data jpa auditing
    created_at       timestamp       not null default now(),
    updated_at       timestamp       not null default now(),
    created_by       bigint          not null references users(id) on delete restrict,
    updated_by       bigint          references users(id) on delete set null
);

-- =============================================================================
-- constraints
-- =============================================================================

-- amount must be a positive number of paise
alter table financial_records
    add constraint chk_records_amount_positive
        check (amount_paise > 0);

-- only known currencies accepted (extend this list as needed)
alter table financial_records
    add constraint chk_records_currency
        check (currency in ('INR', 'USD', 'EUR', 'GBP'));

-- type must match the domain enum values
alter table financial_records
    add constraint chk_records_type
        check (type in ('INCOME', 'EXPENSE'));

-- transaction date must not be in the future
-- note: this is also validated at the application layer in FinancialRecord.create()
-- having it at both layers means neither can be bypassed independently
alter table financial_records
    add constraint chk_records_date_not_future
        check (transaction_date <= current_date);

-- soft delete integrity: the flag and the timestamp must agree
-- case 1: not deleted → deleted_at must be null
-- case 2: deleted → deleted_at must be set
-- any other combination is rejected by the database
alter table financial_records
    add constraint chk_records_soft_delete_integrity
        check (
            (is_deleted = false and deleted_at is null  and deleted_by is null)
         or (is_deleted = true  and deleted_at is not null and deleted_by is not null)
        );

-- a record cannot be created by a different user than the owning user
-- in this single-tenant design, created_by always equals user_id at insert time
-- keeping both columns allows future multi-user org support without schema change
-- no constraint here — enforced at the service layer in RecordService.createRecord()

-- =============================================================================
-- indexes
-- =============================================================================
-- all indexes are partial on is_deleted = false because:
--   1. the vast majority of queries target active records only
--   2. the partial index is physically smaller — faster scans, less memory
--   3. deleted rows are only accessed by admin audit endpoints which can
--      afford a sequential scan over the small deleted subset

-- primary access pattern: all records for a user, ordered by date
create index idx_records_user_date
    on financial_records (user_id, transaction_date desc)
    where is_deleted = false;

-- filtering by type within a user's records
create index idx_records_user_type
    on financial_records (user_id, type)
    where is_deleted = false;

-- category filtering — also used by dashboard category breakdown query
create index idx_records_category
    on financial_records (category_id)
    where is_deleted = false;

-- dashboard summary: needs to aggregate by date and type quickly
-- this composite index covers the WHERE clause and the GROUP BY in one scan
create index idx_records_date_type
    on financial_records (transaction_date, type)
    where is_deleted = false;

-- dashboard monthly trend: date truncation benefits from a sorted date index
create index idx_records_transaction_date
    on financial_records (transaction_date desc)
    where is_deleted = false;

-- amount range filter — used in the list records API when amountMin/amountMax provided
create index idx_records_amount
    on financial_records (amount_paise)
    where is_deleted = false;

-- full text search on description using pg_trgm for ILIKE '%search%' queries
-- requires the pg_trgm extension. if your postgres instance does not have it,
-- comment this block out — the search will still work via a sequential scan,
-- just slower on large datasets.
create extension if not exists pg_trgm;

create index idx_records_description_trgm
    on financial_records using gin (description gin_trgm_ops)
    where is_deleted = false;

-- audit: find all records created by a specific user (admin use)
create index idx_records_created_by
    on financial_records (created_by);

-- soft deleted records — admin audit endpoint scans these
-- note: this is NOT a partial index on is_deleted = false
-- it is explicitly for the deleted subset
create index idx_records_deleted
    on financial_records (deleted_at desc)
    where is_deleted = true;

-- =============================================================================
-- seed: system categories
-- =============================================================================
-- is_system = true means the service layer will reject deletion attempts.
-- created_by is null for seeded rows — no user created them.
-- type = 'BOTH' means this category can appear on either INCOME or EXPENSE records.
-- =============================================================================

insert into categories (name, type, description, is_system, created_by)
values
    -- income categories
    ('Client Revenue',      'INCOME',  'Payments received from clients for services or products',   true, null),
    ('Salary Income',       'INCOME',  'Salary credited to the organization or individual account',  true, null),
    ('Investment Returns',  'INCOME',  'Returns from investments, dividends, or interest earned',    true, null),
    ('Grant / Funding',     'INCOME',  'External grants, seed funding, or investor capital',         true, null),

    -- expense categories
    ('Payroll',             'EXPENSE', 'Employee salaries, contractor payments, and benefits',       true, null),
    ('Infrastructure',      'EXPENSE', 'Cloud services, hosting, servers, and DevOps tooling',       true, null),
    ('Operations',          'EXPENSE', 'Office rent, utilities, and day-to-day running costs',       true, null),
    ('Marketing',           'EXPENSE', 'Advertising, campaigns, and promotional expenses',           true, null),
    ('Travel',              'EXPENSE', 'Business travel, accommodation, and client visit expenses',  true, null),
    ('Software & Licenses', 'EXPENSE', 'SaaS subscriptions, software licenses, and tools',          true, null),
    ('Legal & Compliance',  'EXPENSE', 'Legal fees, audits, regulatory filings, and insurance',     true, null),
    ('Equipment',           'EXPENSE', 'Hardware, peripherals, and physical asset purchases',        true, null),

    -- both directions
    ('Subscriptions',       'BOTH',    'Recurring subscription income or subscription service costs', true, null),
    ('Miscellaneous',       'BOTH',    'Entries that do not fit a specific category',                true, null);