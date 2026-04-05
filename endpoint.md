# API Endpoints Documentation

This document outlines the available endpoints for the Fintech Dashboard backend, categorized by module. All endpoints (except public auth) require a valid JWT bearer token.

## Roles
- **VIEWER**: Can see summaries.
- **ANALYST**: Can see summaries, detailed breakdowns, and list/filter records.
- **ADMIN**: Full CRUD abilities on records and system configuration.

---

## 1. Dashboard Module (`/dashboard`)
*Endpoints for visualizations and aggregated metrics.*

### GET `/dashboard/summary`
- **Access**: ALL roles (Authenticated)
- **Description**: Returns monthly income, expense, and balance totals.
- **Query Params**:
  - `year` (Integer, Optional): If provided, returns months for that year only. If omitted, returns all-time history.
- **Response**: `List<MonthlySummary>`

### GET `/dashboard/breakdown`
- **Access**: ANALYST, ADMIN
- **Description**: Returns detailed monthly summaries with category-level breakdowns split by income and expense.
- **Query Params**:
  - `year` (Integer, Optional): Defaults to current year.
- **Response**: `List<MonthlyBreakdown>`

### GET `/dashboard/category-trend`
- **Access**: ANALYST, ADMIN
- **Description**: Returns all-time monthly totals for a specific category. Ideal for rendering bar/line charts of category performance over time.
- **Query Params**:
  - `categoryId` (Long, Required): The ID of the category.
  - `type` (Enum: `INCOME`, `EXPENSE`, Required): The record type to aggregate.
- **Response**: `List<CategoryTrendPoint>`

### GET `/dashboard/recent`
- **Access**: ANALYST, ADMIN
- **Description**: Returns the last N transactions added to the system.
- **Query Params**:
  - `limit` (Integer, Optional): Defaults to 10. Maximum is 50.
- **Response**: `List<RecordResponse>`

---

## 2. Financial Records Module (`/records`)
*Endpoints for individual transaction management.*

### GET `/records`
- **Access**: ANALYST, ADMIN
- **Description**: Highly dynamic search for transactions with pagination and sorting.
- **Query Params (All Optional)**:
  - `type` (`INCOME`, `EXPENSE`)
  - `categoryId` (Long)
  - `dateFrom` / `dateTo` (ISO date: `YYYY-MM-DD`)
  - `amountMin` / `amountMax` (Long, in Paise)
  - `search` (String: searches description)
  - `page` (Integer, default 0)
  - `size` (Integer, default 20)
  - `sort` (String, default `transactionDate,desc`)
- **Response**: `Page<RecordResponse>`

### GET `/records/{id}`
- **Access**: ANALYST, ADMIN
- **Description**: Fetches a single record by ID.

### POST `/records`
- **Access**: ADMIN
- **Description**: Creates a new financial record.
- **Body**: `{ amountPaise, currency, type, transactionDate, categoryId, description, notes }`

### PUT `/records/{id}`
- **Access**: ADMIN
- **Description**: Updates an existing record. Only 4 fields are editable.
- **Body**: `{ amountPaise, categoryId, description, notes }`

### DELETE `/records/{id}`
- **Access**: ADMIN
- **Description**: Soft-deletes a record (sets `is_deleted = true`). The record remains in the DB for audit but is hidden from all queries.

---

## 3. Category Module (`/categories`)
*Endpoints for lookup data.*

### GET `/categories`
- **Access**: ALL roles (Authenticated)
- **Description**: Returns all active categories for use in dropdowns and filters.
- **Response**: `List<CategoryResponse>`

---

## 4. Auth Module (`/auth`)
*Public endpoints for identity management.*

### POST `/auth/register`
- **Access**: Public
- **Description**: Register a new user account.

### POST `/auth/login`
- **Access**: Public
- **Description**: Authenticate and receive a JWT token.
- **Response**: `{ token, type, expiresAt, user }`
