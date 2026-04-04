-- =============================================================================
-- V3__seed_data.sql
--
-- ownership rules enforced here:
--   - ALL records are created and owned by the ADMIN (priya)
--   - analysts and viewers have zero records — they only read
--   - this matches the API contract: POST /records is ADMIN only
--   - soft deleted rows exist for audit trail testing
--   - deleted_by is always u_admin — only admin can delete
-- =============================================================================

insert into users (full_name, email, password_hash, role, status, created_at, updated_at)
values
    ('Priya Sharma', 'priya@zorvyn.in', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'ADMIN',   'ACTIVE',   now(), now()),
    ('Arjun Mehta',  'arjun@zorvyn.in', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'ANALYST', 'ACTIVE',   now(), now()),
    ('Divya Nair',   'divya@zorvyn.in', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'ANALYST', 'ACTIVE',   now(), now()),
    ('Karan Iyer',   'karan@zorvyn.in', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'VIEWER',  'ACTIVE',   now(), now()),
    ('Sneha Pillai', 'sneha@zorvyn.in', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'VIEWER',  'INACTIVE', now(), now());

do $$
declare
    u_admin   bigint := (select id from users where email = 'priya@zorvyn.in');

    c_client_rev  bigint := (select id from categories where name = 'Client Revenue');
    c_invest      bigint := (select id from categories where name = 'Investment Returns');
    c_grant       bigint := (select id from categories where name = 'Grant / Funding');
    c_payroll     bigint := (select id from categories where name = 'Payroll');
    c_infra       bigint := (select id from categories where name = 'Infrastructure');
    c_ops         bigint := (select id from categories where name = 'Operations');
    c_marketing   bigint := (select id from categories where name = 'Marketing');
    c_travel      bigint := (select id from categories where name = 'Travel');
    c_software    bigint := (select id from categories where name = 'Software & Licenses');
    c_legal       bigint := (select id from categories where name = 'Legal & Compliance');
    c_equipment   bigint := (select id from categories where name = 'Equipment');
    c_subs        bigint := (select id from categories where name = 'Subscriptions');
    c_misc        bigint := (select id from categories where name = 'Miscellaneous');

begin

-- column order for every insert:
-- (user_id, category_id, amount_paise, currency, type,
--  transaction_date, description, notes,
--  is_deleted, deleted_at, deleted_by,
--  created_at, updated_at, created_by, updated_by)
--
-- user_id = u_admin and created_by = u_admin on every single row

-- =============================================================================
-- august 2024
-- =============================================================================

insert into financial_records
    (user_id, category_id, amount_paise, currency, type, transaction_date, description, notes, is_deleted, deleted_at, deleted_by, created_at, updated_at, created_by, updated_by)
values
(u_admin, c_client_rev, 25000000, 'INR', 'INCOME',  '2024-08-05', 'Q3 retainer — TechNova Ltd',          'Quarterly contract, auto-renewed',          false, null, null, '2024-08-05 09:15:00', '2024-08-05 09:15:00', u_admin, null),
(u_admin, c_client_rev, 18500000, 'INR', 'INCOME',  '2024-08-12', 'Project delivery — Horizon Analytics', 'Final milestone, data pipeline phase 2',    false, null, null, '2024-08-12 11:00:00', '2024-08-12 11:00:00', u_admin, null),
(u_admin, c_subs,        8500000, 'INR', 'INCOME',  '2024-08-15', 'SaaS renewals — Aug batch',            '47 annual plan renewals processed',         false, null, null, '2024-08-15 10:30:00', '2024-08-15 10:30:00', u_admin, null),
(u_admin, c_invest,      3200000, 'INR', 'INCOME',  '2024-08-20', 'FD interest — HDFC Bank',              'Fixed deposit maturity interest',           false, null, null, '2024-08-20 14:00:00', '2024-08-20 14:00:00', u_admin, null),
(u_admin, c_payroll,    42000000, 'INR', 'EXPENSE', '2024-08-01', 'Payroll — Aug 2024',                   '14 full-time + 3 contractors',              false, null, null, '2024-08-01 08:00:00', '2024-08-01 08:00:00', u_admin, null),
(u_admin, c_infra,       4200000, 'INR', 'EXPENSE', '2024-08-03', 'AWS invoice — Aug 2024',               'EC2, RDS, S3, CloudFront',                  false, null, null, '2024-08-03 09:00:00', '2024-08-03 09:00:00', u_admin, null),
(u_admin, c_ops,         5500000, 'INR', 'EXPENSE', '2024-08-01', 'Office rent — MG Road, Aug',           '3rd floor, 4200 sqft',                      false, null, null, '2024-08-01 08:30:00', '2024-08-01 08:30:00', u_admin, null),
(u_admin, c_software,    1850000, 'INR', 'EXPENSE', '2024-08-07', 'Atlassian suite — annual renewal',     'Jira + Confluence + Bitbucket, 20 seats',   false, null, null, '2024-08-07 10:00:00', '2024-08-07 10:00:00', u_admin, null),
(u_admin, c_marketing,   3500000, 'INR', 'EXPENSE', '2024-08-10', 'Google Ads — product launch',          'Aug spend for dashboard product launch',    false, null, null, '2024-08-10 11:00:00', '2024-08-10 11:00:00', u_admin, null),
(u_admin, c_travel,       980000, 'INR', 'EXPENSE', '2024-08-18', 'Mumbai client visit — 2 days',         'Flight + hotel, FinServ Co meeting',        false, null, null, '2024-08-18 12:00:00', '2024-08-18 12:00:00', u_admin, null),
(u_admin, c_legal,       2200000, 'INR', 'EXPENSE', '2024-08-22', 'Legal retainer — Aug 2024',            'Monthly retainer, Sharma & Associates',     false, null, null, '2024-08-22 14:00:00', '2024-08-22 14:00:00', u_admin, null),
(u_admin, c_misc,         350000, 'INR', 'EXPENSE', '2024-08-25', 'Team lunch — v1.0 milestone',          'Celebration for product release',           false, null, null, '2024-08-25 13:00:00', '2024-08-25 13:00:00', u_admin, null),

-- =============================================================================
-- september 2024
-- =============================================================================

(u_admin, c_client_rev, 25000000, 'INR', 'INCOME',  '2024-09-05', 'Q3 retainer — TechNova Ltd',          'Sep instalment',                            false, null, null, '2024-09-05 09:15:00', '2024-09-05 09:15:00', u_admin, null),
(u_admin, c_client_rev, 22000000, 'INR', 'INCOME',  '2024-09-14', 'New client — DataBridge Inc',          'First invoice, post contract sign',         false, null, null, '2024-09-14 10:00:00', '2024-09-14 10:00:00', u_admin, null),
(u_admin, c_subs,        9200000, 'INR', 'INCOME',  '2024-09-15', 'SaaS renewals — Sep batch',            '53 renewals processed',                     false, null, null, '2024-09-15 10:30:00', '2024-09-15 10:30:00', u_admin, null),
(u_admin, c_grant,      10000000, 'INR', 'INCOME',  '2024-09-20', 'Startup India grant — Tranche 1',     'First of three tranches received',          false, null, null, '2024-09-20 15:00:00', '2024-09-20 15:00:00', u_admin, null),
(u_admin, c_invest,      2100000, 'INR', 'INCOME',  '2024-09-25', 'Quarterly dividend — equity fund',    'Q2 dividends credited',                     false, null, null, '2024-09-25 14:00:00', '2024-09-25 14:00:00', u_admin, null),
(u_admin, c_payroll,    43500000, 'INR', 'EXPENSE', '2024-09-01', 'Payroll — Sep 2024',                   '15 employees after new hire',               false, null, null, '2024-09-01 08:00:00', '2024-09-01 08:00:00', u_admin, null),
(u_admin, c_infra,       4400000, 'INR', 'EXPENSE', '2024-09-03', 'AWS invoice — Sep 2024',               'Higher usage, new client onboarding',       false, null, null, '2024-09-03 09:00:00', '2024-09-03 09:00:00', u_admin, null),
(u_admin, c_ops,         5500000, 'INR', 'EXPENSE', '2024-09-01', 'Office rent — MG Road, Sep',           null,                                        false, null, null, '2024-09-01 08:30:00', '2024-09-01 08:30:00', u_admin, null),
(u_admin, c_equipment,   8500000, 'INR', 'EXPENSE', '2024-09-10', '5x MacBook Pro M3 — new hire batch',  'Asset tags ZRV-2024-011 to 015',            false, null, null, '2024-09-10 11:00:00', '2024-09-10 11:00:00', u_admin, null),
(u_admin, c_marketing,   4200000, 'INR', 'EXPENSE', '2024-09-15', 'LinkedIn Ads — Q4 hiring campaign',   'Senior engineer + product roles',           false, null, null, '2024-09-15 11:00:00', '2024-09-15 11:00:00', u_admin, null),
(u_admin, c_software,    2100000, 'INR', 'EXPENSE', '2024-09-18', 'Figma + Notion enterprise — annual',  '25 seat Figma + 30 seat Notion',            false, null, null, '2024-09-18 14:00:00', '2024-09-18 14:00:00', u_admin, null),
(u_admin, c_travel,      1450000, 'INR', 'EXPENSE', '2024-09-24', 'Bangalore to Delhi — investor meet',  '3 team members, 2-night stay',              false, null, null, '2024-09-24 09:00:00', '2024-09-24 09:00:00', u_admin, null),
(u_admin, c_legal,       2200000, 'INR', 'EXPENSE', '2024-09-28', 'Legal retainer — Sep 2024',            null,                                        false, null, null, '2024-09-28 10:00:00', '2024-09-28 10:00:00', u_admin, null),

-- =============================================================================
-- october 2024
-- =============================================================================

(u_admin, c_client_rev, 25000000, 'INR', 'INCOME',  '2024-10-05', 'Q4 retainer — TechNova Ltd',          'Q4 contract commenced',                     false, null, null, '2024-10-05 09:15:00', '2024-10-05 09:15:00', u_admin, null),
(u_admin, c_client_rev, 28000000, 'INR', 'INCOME',  '2024-10-12', 'Enterprise deal — NovaBanking Corp',  'First payment, 18-month engagement',        false, null, null, '2024-10-12 11:00:00', '2024-10-12 11:00:00', u_admin, null),
(u_admin, c_subs,       10500000, 'INR', 'INCOME',  '2024-10-15', 'SaaS renewals — Oct batch',           '61 renewals, growing MRR',                  false, null, null, '2024-10-15 10:30:00', '2024-10-15 10:30:00', u_admin, null),
(u_admin, c_invest,      4100000, 'INR', 'INCOME',  '2024-10-22', 'Mutual fund redemption — partial',    'Partial redemption for working capital',    false, null, null, '2024-10-22 14:00:00', '2024-10-22 14:00:00', u_admin, null),
(u_admin, c_payroll,    43500000, 'INR', 'EXPENSE', '2024-10-01', 'Payroll — Oct 2024',                   null,                                        false, null, null, '2024-10-01 08:00:00', '2024-10-01 08:00:00', u_admin, null),
(u_admin, c_infra,       5100000, 'INR', 'EXPENSE', '2024-10-03', 'AWS invoice — Oct 2024',               'NovaBanking onboarding spike',              false, null, null, '2024-10-03 09:00:00', '2024-10-03 09:00:00', u_admin, null),
(u_admin, c_ops,         5500000, 'INR', 'EXPENSE', '2024-10-01', 'Office rent — MG Road, Oct',           null,                                        false, null, null, '2024-10-01 08:30:00', '2024-10-01 08:30:00', u_admin, null),
(u_admin, c_marketing,   6000000, 'INR', 'EXPENSE', '2024-10-08', 'Diwali marketing campaign',           'Email + social + paid, festive push',       false, null, null, '2024-10-08 11:00:00', '2024-10-08 11:00:00', u_admin, null),
(u_admin, c_legal,       2200000, 'INR', 'EXPENSE', '2024-10-15', 'Legal retainer — Oct 2024',            null,                                        false, null, null, '2024-10-15 10:00:00', '2024-10-15 10:00:00', u_admin, null),
(u_admin, c_travel,       750000, 'INR', 'EXPENSE', '2024-10-18', 'Bangalore to Chennai — client demo',  'NovaBanking pre-sales demo, 1 day',         false, null, null, '2024-10-18 07:00:00', '2024-10-18 07:00:00', u_admin, null),
(u_admin, c_software,     980000, 'INR', 'EXPENSE', '2024-10-20', 'Datadog monitoring — monthly',        'APM + logs + infrastructure',               false, null, null, '2024-10-20 09:00:00', '2024-10-20 09:00:00', u_admin, null),
(u_admin, c_misc,         650000, 'INR', 'EXPENSE', '2024-10-24', 'Diwali office celebration',           'Sweets, decorations, team event',           false, null, null, '2024-10-24 15:00:00', '2024-10-24 15:00:00', u_admin, null),

-- =============================================================================
-- november 2024
-- =============================================================================

(u_admin, c_client_rev, 25000000, 'INR', 'INCOME',  '2024-11-05', 'Q4 retainer — TechNova Ltd',          'Nov instalment',                            false, null, null, '2024-11-05 09:15:00', '2024-11-05 09:15:00', u_admin, null),
(u_admin, c_client_rev, 14000000, 'INR', 'INCOME',  '2024-11-15', 'DataBridge Inc — milestone 2',        'Phase 2 delivery accepted',                 false, null, null, '2024-11-15 11:00:00', '2024-11-15 11:00:00', u_admin, null),
(u_admin, c_subs,       10800000, 'INR', 'INCOME',  '2024-11-15', 'SaaS renewals — Nov batch',           '63 renewals processed',                     false, null, null, '2024-11-15 10:30:00', '2024-11-15 10:30:00', u_admin, null),
(u_admin, c_client_rev, 15000000, 'INR', 'INCOME',  '2024-11-20', 'Consulting — FinServ Co, Nov',        null,                                        false, null, null, '2024-11-20 16:00:00', '2024-11-20 16:00:00', u_admin, null),
(u_admin, c_invest,      1800000, 'INR', 'INCOME',  '2024-11-30', 'Quarterly dividend — equity fund',   'Q3 dividends credited',                     false, null, null, '2024-11-30 14:00:00', '2024-11-30 14:00:00', u_admin, null),
(u_admin, c_payroll,    45000000, 'INR', 'EXPENSE', '2024-11-01', 'Payroll — Nov 2024',                   'Includes Diwali bonus component',           false, null, null, '2024-11-01 08:00:00', '2024-11-01 08:00:00', u_admin, null),
(u_admin, c_infra,       4600000, 'INR', 'EXPENSE', '2024-11-03', 'AWS invoice — Nov 2024',               null,                                        false, null, null, '2024-11-03 09:00:00', '2024-11-03 09:00:00', u_admin, null),
(u_admin, c_ops,         5500000, 'INR', 'EXPENSE', '2024-11-01', 'Office rent — MG Road, Nov',           null,                                        false, null, null, '2024-11-01 08:30:00', '2024-11-01 08:30:00', u_admin, null),
(u_admin, c_marketing,   2800000, 'INR', 'EXPENSE', '2024-11-10', 'Content marketing — blog + SEO',      'Agency retainer, Q4 content calendar',     false, null, null, '2024-11-10 11:00:00', '2024-11-10 11:00:00', u_admin, null),
(u_admin, c_legal,       2200000, 'INR', 'EXPENSE', '2024-11-15', 'Legal retainer — Nov 2024',            null,                                        false, null, null, '2024-11-15 10:00:00', '2024-11-15 10:00:00', u_admin, null),
(u_admin, c_equipment,   3200000, 'INR', 'EXPENSE', '2024-11-18', '2x standing desks + chairs',          'Wellness initiative, engineering team',    false, null, null, '2024-11-18 11:00:00', '2024-11-18 11:00:00', u_admin, null),
(u_admin, c_software,     980000, 'INR', 'EXPENSE', '2024-11-20', 'Datadog monitoring — monthly',        null,                                        false, null, null, '2024-11-20 09:00:00', '2024-11-20 09:00:00', u_admin, null),
(u_admin, c_travel,       520000, 'INR', 'EXPENSE', '2024-11-22', 'Hyderabad client visit — 1 day',      'Pre-sales for potential engagement',        false, null, null, '2024-11-22 06:30:00', '2024-11-22 06:30:00', u_admin, null),

-- =============================================================================
-- december 2024
-- =============================================================================

(u_admin, c_client_rev, 25000000, 'INR', 'INCOME',  '2024-12-05', 'Q4 retainer — TechNova Ltd',          'Dec instalment',                            false, null, null, '2024-12-05 09:15:00', '2024-12-05 09:15:00', u_admin, null),
(u_admin, c_client_rev, 35000000, 'INR', 'INCOME',  '2024-12-10', 'Year-end deal — GlobalPay Solutions', '12-month SLA, advance received',            false, null, null, '2024-12-10 11:00:00', '2024-12-10 11:00:00', u_admin, null),
(u_admin, c_subs,       12000000, 'INR', 'INCOME',  '2024-12-15', 'SaaS renewals — Dec batch',           '70 renewals, year-end push',                false, null, null, '2024-12-15 10:30:00', '2024-12-15 10:30:00', u_admin, null),
(u_admin, c_grant,      10000000, 'INR', 'INCOME',  '2024-12-18', 'Startup India grant — Tranche 2',    'Second of three tranches',                  false, null, null, '2024-12-18 15:00:00', '2024-12-18 15:00:00', u_admin, null),
(u_admin, c_client_rev, 18000000, 'INR', 'INCOME',  '2024-12-27', 'Consulting — FinServ Co, Dec+bonus', 'Dec invoice + performance bonus',           false, null, null, '2024-12-27 16:00:00', '2024-12-27 16:00:00', u_admin, null),
(u_admin, c_invest,      5500000, 'INR', 'INCOME',  '2024-12-30', 'FD maturity — Axis Bank',             '12-month FD matured',                       false, null, null, '2024-12-30 14:00:00', '2024-12-30 14:00:00', u_admin, null),
(u_admin, c_payroll,    48000000, 'INR', 'EXPENSE', '2024-12-01', 'Payroll — Dec 2024',                   'Includes year-end performance bonus',       false, null, null, '2024-12-01 08:00:00', '2024-12-01 08:00:00', u_admin, null),
(u_admin, c_infra,       4800000, 'INR', 'EXPENSE', '2024-12-03', 'AWS invoice — Dec 2024',               'GlobalPay onboarding + year-end traffic',   false, null, null, '2024-12-03 09:00:00', '2024-12-03 09:00:00', u_admin, null),
(u_admin, c_ops,         5500000, 'INR', 'EXPENSE', '2024-12-01', 'Office rent — MG Road, Dec',           null,                                        false, null, null, '2024-12-01 08:30:00', '2024-12-01 08:30:00', u_admin, null),
(u_admin, c_marketing,   5500000, 'INR', 'EXPENSE', '2024-12-05', 'Year-end brand campaign',             'Recap video + social + email blast',        false, null, null, '2024-12-05 11:00:00', '2024-12-05 11:00:00', u_admin, null),
(u_admin, c_legal,       4500000, 'INR', 'EXPENSE', '2024-12-10', 'GlobalPay contract — legal review',   'New client contract + compliance check',    false, null, null, '2024-12-10 10:00:00', '2024-12-10 10:00:00', u_admin, null),
(u_admin, c_software,    3600000, 'INR', 'EXPENSE', '2024-12-12', 'GitHub Enterprise — annual renewal',  '25 seats, annual billing',                  false, null, null, '2024-12-12 09:00:00', '2024-12-12 09:00:00', u_admin, null),
(u_admin, c_travel,      2100000, 'INR', 'EXPENSE', '2024-12-15', 'Team offsite — Coorg, 2 nights',      '12 members, Q1 planning offsite',           false, null, null, '2024-12-15 07:00:00', '2024-12-15 07:00:00', u_admin, null),
(u_admin, c_misc,        1200000, 'INR', 'EXPENSE', '2024-12-20', 'Year-end party',                      'Venue + catering + gifts, 18 people',       false, null, null, '2024-12-20 18:00:00', '2024-12-20 18:00:00', u_admin, null),

-- =============================================================================
-- january 2025
-- =============================================================================

(u_admin, c_client_rev, 25000000, 'INR', 'INCOME',  '2025-01-06', 'Q1 retainer — TechNova Ltd',          'Q1 2025 contract commenced',                false, null, null, '2025-01-06 09:15:00', '2025-01-06 09:15:00', u_admin, null),
(u_admin, c_client_rev, 28000000, 'INR', 'INCOME',  '2025-01-14', 'NovaBanking Corp — Jan instalment',   'Month 4 of 18-month engagement',           false, null, null, '2025-01-14 11:00:00', '2025-01-14 11:00:00', u_admin, null),
(u_admin, c_subs,       11200000, 'INR', 'INCOME',  '2025-01-15', 'SaaS renewals — Jan batch',           '65 renewals',                               false, null, null, '2025-01-15 10:30:00', '2025-01-15 10:30:00', u_admin, null),
(u_admin, c_client_rev, 15000000, 'INR', 'INCOME',  '2025-01-28', 'Consulting — FinServ Co, Jan',        null,                                        false, null, null, '2025-01-28 16:00:00', '2025-01-28 16:00:00', u_admin, null),
(u_admin, c_payroll,    43500000, 'INR', 'EXPENSE', '2025-01-01', 'Payroll — Jan 2025',                   null,                                        false, null, null, '2025-01-01 08:00:00', '2025-01-01 08:00:00', u_admin, null),
(u_admin, c_infra,       4500000, 'INR', 'EXPENSE', '2025-01-03', 'AWS invoice — Jan 2025',               null,                                        false, null, null, '2025-01-03 09:00:00', '2025-01-03 09:00:00', u_admin, null),
(u_admin, c_ops,         5500000, 'INR', 'EXPENSE', '2025-01-01', 'Office rent — MG Road, Jan',           null,                                        false, null, null, '2025-01-01 08:30:00', '2025-01-01 08:30:00', u_admin, null),
(u_admin, c_legal,       2200000, 'INR', 'EXPENSE', '2025-01-10', 'Legal retainer — Jan 2025',            null,                                        false, null, null, '2025-01-10 10:00:00', '2025-01-10 10:00:00', u_admin, null),
(u_admin, c_software,     980000, 'INR', 'EXPENSE', '2025-01-15', 'Datadog monitoring — monthly',        null,                                        false, null, null, '2025-01-15 09:00:00', '2025-01-15 09:00:00', u_admin, null),
(u_admin, c_marketing,   2200000, 'INR', 'EXPENSE', '2025-01-18', 'New year campaign — social media',    'Jan brand refresh across channels',         false, null, null, '2025-01-18 11:00:00', '2025-01-18 11:00:00', u_admin, null),
(u_admin, c_equipment,   1800000, 'INR', 'EXPENSE', '2025-01-22', 'iPhone 15 — 2 units, field team',     'Replacement for damaged devices',           false, null, null, '2025-01-22 14:00:00', '2025-01-22 14:00:00', u_admin, null),
(u_admin, c_misc,         180000, 'INR', 'EXPENSE', '2025-01-26', 'Republic Day team breakfast',         null,                                        false, null, null, '2025-01-26 09:00:00', '2025-01-26 09:00:00', u_admin, null),

-- =============================================================================
-- february 2025
-- =============================================================================

(u_admin, c_client_rev, 25000000, 'INR', 'INCOME',  '2025-02-05', 'Q1 retainer — TechNova Ltd',          'Feb instalment',                            false, null, null, '2025-02-05 09:15:00', '2025-02-05 09:15:00', u_admin, null),
(u_admin, c_client_rev, 28000000, 'INR', 'INCOME',  '2025-02-12', 'NovaBanking Corp — Feb instalment',   'Month 5 of 18',                             false, null, null, '2025-02-12 11:00:00', '2025-02-12 11:00:00', u_admin, null),
(u_admin, c_subs,       11800000, 'INR', 'INCOME',  '2025-02-15', 'SaaS renewals — Feb batch',           '69 renewals',                               false, null, null, '2025-02-15 10:30:00', '2025-02-15 10:30:00', u_admin, null),
(u_admin, c_client_rev, 16500000, 'INR', 'INCOME',  '2025-02-20', 'New client — Pinnacle Wealth Mgmt',   'Kickoff payment received',                  false, null, null, '2025-02-20 14:00:00', '2025-02-20 14:00:00', u_admin, null),
(u_admin, c_client_rev, 15000000, 'INR', 'INCOME',  '2025-02-27', 'Consulting — FinServ Co, Feb',        null,                                        false, null, null, '2025-02-27 16:00:00', '2025-02-27 16:00:00', u_admin, null),
(u_admin, c_invest,      2400000, 'INR', 'INCOME',  '2025-02-28', 'Quarterly dividend — equity fund',   'Q4 2024 dividends credited',                false, null, null, '2025-02-28 14:00:00', '2025-02-28 14:00:00', u_admin, null),
(u_admin, c_payroll,    43500000, 'INR', 'EXPENSE', '2025-02-01', 'Payroll — Feb 2025',                   null,                                        false, null, null, '2025-02-01 08:00:00', '2025-02-01 08:00:00', u_admin, null),
(u_admin, c_infra,       4700000, 'INR', 'EXPENSE', '2025-02-03', 'AWS invoice — Feb 2025',               'Pinnacle Wealth onboarding traffic',        false, null, null, '2025-02-03 09:00:00', '2025-02-03 09:00:00', u_admin, null),
(u_admin, c_ops,         5500000, 'INR', 'EXPENSE', '2025-02-01', 'Office rent — MG Road, Feb',           null,                                        false, null, null, '2025-02-01 08:30:00', '2025-02-01 08:30:00', u_admin, null),
(u_admin, c_legal,       2200000, 'INR', 'EXPENSE', '2025-02-10', 'Legal retainer — Feb 2025',            null,                                        false, null, null, '2025-02-10 10:00:00', '2025-02-10 10:00:00', u_admin, null),
(u_admin, c_software,     980000, 'INR', 'EXPENSE', '2025-02-15', 'Datadog monitoring — monthly',        null,                                        false, null, null, '2025-02-15 09:00:00', '2025-02-15 09:00:00', u_admin, null),
(u_admin, c_marketing,   3800000, 'INR', 'EXPENSE', '2025-02-10', 'Valentine campaign — B2B gifting',    'Client gifting + social campaign',          false, null, null, '2025-02-10 11:00:00', '2025-02-10 11:00:00', u_admin, null),
(u_admin, c_travel,      1650000, 'INR', 'EXPENSE', '2025-02-18', 'Mumbai — Pinnacle Wealth kickoff',    '2 team members, 2-night stay',              false, null, null, '2025-02-18 07:00:00', '2025-02-18 07:00:00', u_admin, null),
(u_admin, c_misc,         280000, 'INR', 'EXPENSE', '2025-02-21', 'Team birthday celebrations — Feb',   null,                                        false, null, null, '2025-02-21 13:00:00', '2025-02-21 13:00:00', u_admin, null),

-- =============================================================================
-- march 2025
-- =============================================================================

(u_admin, c_client_rev, 25000000, 'INR', 'INCOME',  '2025-03-05', 'Q1 retainer — TechNova Ltd',          'Mar instalment, Q1 close',                  false, null, null, '2025-03-05 09:15:00', '2025-03-05 09:15:00', u_admin, null),
(u_admin, c_client_rev, 28000000, 'INR', 'INCOME',  '2025-03-10', 'NovaBanking Corp — Mar instalment',   'Month 6 of 18',                             false, null, null, '2025-03-10 11:00:00', '2025-03-10 11:00:00', u_admin, null),
(u_admin, c_client_rev, 40000000, 'INR', 'INCOME',  '2025-03-15', 'New contract — Apex Insurance Ltd',   'Annual contract, advance + first monthly',  false, null, null, '2025-03-15 14:00:00', '2025-03-15 14:00:00', u_admin, null),
(u_admin, c_subs,       13500000, 'INR', 'INCOME',  '2025-03-15', 'SaaS renewals — Mar batch',           '79 renewals, Q1 push',                      false, null, null, '2025-03-15 10:30:00', '2025-03-15 10:30:00', u_admin, null),
(u_admin, c_grant,      10000000, 'INR', 'INCOME',  '2025-03-18', 'Startup India grant — Tranche 3',    'Final tranche received',                    false, null, null, '2025-03-18 15:00:00', '2025-03-18 15:00:00', u_admin, null),
(u_admin, c_client_rev, 15000000, 'INR', 'INCOME',  '2025-03-27', 'Consulting — FinServ Co, Mar',        null,                                        false, null, null, '2025-03-27 16:00:00', '2025-03-27 16:00:00', u_admin, null),
(u_admin, c_client_rev, 18000000, 'INR', 'INCOME',  '2025-03-28', 'Consulting — Pinnacle Wealth, Mar',   'Month 2 invoice cleared',                   false, null, null, '2025-03-28 16:00:00', '2025-03-28 16:00:00', u_admin, null),
(u_admin, c_invest,      3800000, 'INR', 'INCOME',  '2025-03-31', 'FY end FD interest — multiple banks', 'FY 2024-25 interest aggregated',            false, null, null, '2025-03-31 14:00:00', '2025-03-31 14:00:00', u_admin, null),
(u_admin, c_payroll,    45000000, 'INR', 'EXPENSE', '2025-03-01', 'Payroll — Mar 2025',                   'Includes Q1 variable pay',                  false, null, null, '2025-03-01 08:00:00', '2025-03-01 08:00:00', u_admin, null),
(u_admin, c_infra,       5200000, 'INR', 'EXPENSE', '2025-03-03', 'AWS invoice — Mar 2025',               'Apex Insurance onboarding + Q1 traffic',    false, null, null, '2025-03-03 09:00:00', '2025-03-03 09:00:00', u_admin, null),
(u_admin, c_ops,         5500000, 'INR', 'EXPENSE', '2025-03-01', 'Office rent — MG Road, Mar',           null,                                        false, null, null, '2025-03-01 08:30:00', '2025-03-01 08:30:00', u_admin, null),
(u_admin, c_legal,       4800000, 'INR', 'EXPENSE', '2025-03-08', 'Apex Insurance — legal review',       'New client contract + compliance check',    false, null, null, '2025-03-08 10:00:00', '2025-03-08 10:00:00', u_admin, null),
(u_admin, c_software,     980000, 'INR', 'EXPENSE', '2025-03-15', 'Datadog monitoring — monthly',        null,                                        false, null, null, '2025-03-15 09:00:00', '2025-03-15 09:00:00', u_admin, null),
(u_admin, c_software,    4200000, 'INR', 'EXPENSE', '2025-03-20', 'Slack Business+ — annual renewal',    '25 seats, switching from monthly',          false, null, null, '2025-03-20 09:00:00', '2025-03-20 09:00:00', u_admin, null),
(u_admin, c_marketing,   4500000, 'INR', 'EXPENSE', '2025-03-10', 'Q1 content + case studies',           'Two client case study productions',         false, null, null, '2025-03-10 11:00:00', '2025-03-10 11:00:00', u_admin, null),
(u_admin, c_travel,      2800000, 'INR', 'EXPENSE', '2025-03-20', 'Bangalore to Mumbai — Apex onboard',  '3 team members, 3-night stay',              false, null, null, '2025-03-20 06:00:00', '2025-03-20 06:00:00', u_admin, null),
(u_admin, c_misc,         420000, 'INR', 'EXPENSE', '2025-03-31', 'FY end team dinner',                  'Closing FY 2024-25 with full team',         false, null, null, '2025-03-31 19:00:00', '2025-03-31 19:00:00', u_admin, null),

-- =============================================================================
-- two soft-deleted rows — audit trail testing
-- admin deleted duplicate entries she spotted during a review
-- =============================================================================

(u_admin, c_infra,      4200000, 'INR', 'EXPENSE', '2024-09-03', 'AWS Sep — DUPLICATE',                 'Entered twice by mistake',                  true, '2024-09-04 10:00:00', u_admin, '2024-09-03 11:00:00', '2024-09-04 10:00:00', u_admin, u_admin),
(u_admin, c_client_rev,25000000, 'INR', 'INCOME',  '2024-10-05', 'TechNova Oct retainer — DUPLICATE',   'Duplicate of Q4 retainer row',              true, '2024-10-06 09:00:00', u_admin, '2024-10-05 10:00:00', '2024-10-06 09:00:00', u_admin, u_admin);

end $$;