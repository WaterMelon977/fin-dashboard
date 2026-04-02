# Finance Dashboard API

A backend REST API for a multi-role finance dashboard system. It supports user and role management, financial record keeping, and aggregated analytics. Built as a technical assessment for Zorvyn, a Bangalore-based fintech company.

The system allows organizations to track income and expenses across categories, enforce role-based access control over financial data, and serve summary analytics to a frontend dashboard. It is designed as a modular monolith — structured for clarity and maintainability without the operational overhead of microservices.

---

## User Roles and Permissions

| Action | VIEWER | ANALYST | ADMIN |
|---|---|---|---|
| View dashboard summary | own records only | all records | all records |
| View category breakdown | own records only | all records | all records |
| View monthly trends | — | yes | yes |
| List all financial records | own records only | all records | all records |
| View single record | own records only | all records | all records |
| Create financial record | — | yes | yes |
| Update financial record | — | own records only | all records |
| Delete financial record (soft) | — | — | yes |
| List all users | — | — | yes |
| Activate / deactivate users | — | — | yes |

> **Assumption:** Role assignment at registration is open for assessment purposes. In a production system, only an ADMIN should be able to assign the ANALYST or ADMIN role.

---

## Architecture

The project follows a **Modular Monolith** structure. Each feature domain (`user`, `record`, `dashboard`) is a self-contained package with its own controller, service, domain model, and repository layers. Cross-cutting concerns (security, auditing, exception handling) live in a shared `common` package.

```
com.yourname.financeapp
├── common/          # security, auditing, exception handling, response wrappers
├── user/            # user and role management
├── record/          # financial records CRUD and filtering
└── dashboard/       # read-only analytics and summary queries
```

Within each module, the layering is:

```
api/          →   application/   →   domain/
(controller)      (service)          (entity, value objects)
                      ↓
                infrastructure/
                (repository, queries)
```

Dependencies flow inward. The domain layer has no Spring dependencies — it is plain Java.

---

## Key Design Decisions

**1. Monetary amounts stored as `Long` paise, not `BigDecimal` rupees.**
Floating point arithmetic on `double` and even `BigDecimal` division can produce representation errors in financial calculations. Storing ₹1,234.56 as `123456` paise (Long) eliminates this class of bugs entirely. The value is converted to `BigDecimal` only at the response serialization boundary.

**2. Ownership-based access control separated from role-based access control.**
Role tells you what type of operations a user can perform. Ownership tells you which specific resources they can perform them on. These are different concerns and change independently. A dedicated `RecordAccessPolicy` class holds all access decisions as named, testable methods — rather than scattering logic across `@PreAuthorize` annotations. An unauthorized request for a record the caller does not own returns `404 Not Found`, not `403 Forbidden`, to avoid leaking the existence of the resource.

**3. `Category` as a database table, not a Java enum.**
An enum requires a schema migration (`ALTER TYPE`) to add a new category, which creates deployment friction. A database table row can be inserted by an admin at runtime. System-provided categories are protected by an `is_system` flag enforced at the service layer. This makes the system extensible without code changes.

**4. Soft delete enforced at two levels.**
The `@Where(clause = "is_deleted = false")` Hibernate annotation ensures all JPA queries automatically exclude deleted records. The `@SQLDelete` annotation rewrites `DELETE` SQL to an `UPDATE` before it reaches the database. This means soft delete protection does not rely solely on calling the right service method — the persistence layer also enforces it. Deleted records remain in the database as an audit trail and are accessible via admin-only endpoints.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Language | Java 17 |
| Framework | Spring Boot 3.x |
| Security | Spring Security + JWT (JJWT) |
| Persistence | Spring Data JPA + Hibernate |
| Database | PostgreSQL 15 |
| Migrations | Flyway |
| Validation | Jakarta Bean Validation |
| Mapping | MapStruct |
| Boilerplate reduction | Lombok |
| API Documentation | SpringDoc OpenAPI 3 (Swagger UI) |
| Testing | JUnit 5, Mockito, Testcontainers |
| Build | Maven |

---

## How to Run

### Prerequisites

- Java 17+
- Docker and Docker Compose (for PostgreSQL and Testcontainers)
- Maven 3.8+

### Steps

```bash
# 1. clone the repository
git clone https://github.com/yourname/finance-dashboard-api
cd finance-dashboard-api

# 2. start PostgreSQL via Docker Compose
docker-compose up -d

# 3. configure environment variables (or update application.properties)
export DB_URL=jdbc:postgresql://localhost:5432/financedb
export DB_USERNAME=postgres
export DB_PASSWORD=postgres
export JWT_SECRET=your-256-bit-secret-key-here
export JWT_EXPIRY_MS=86400000

# 4. run the application
./mvnw spring-boot:run
```

The application starts on `http://localhost:8080`.

Flyway runs automatically on startup and applies all migrations including the seed data for system categories.

### Running Tests

```bash
# unit tests only (no Docker required)
./mvnw test -Dgroups="unit"

# full test suite including integration tests (requires Docker)
./mvnw verify
```

---

## API Documentation

Once the application is running, Swagger UI is available at:

```
http://localhost:8080/swagger-ui.html
```

The OpenAPI JSON spec is at:

```
http://localhost:8080/v3/api-docs
```

All endpoints except `/api/v1/auth/**` require a Bearer token. Use the **Authorize** button in Swagger UI to set your JWT after logging in.

---

## Assumptions and Trade-offs

- **Single-tenant:** All users share the same record space. Admins and Analysts see all records. A multi-tenant extension would add an `organization_id` foreign key to both `users` and `financial_records` and scope all queries accordingly.
- **No refresh token rotation:** The refresh token implementation issues a new access token but does not rotate the refresh token on use. In production, refresh tokens should be single-use with rotation to prevent replay attacks.
- **In-process caching:** Dashboard summaries are cached using Spring's `@Cacheable` with Caffeine (in-memory). This works for a single instance but would require Redis for a horizontally scaled deployment.
- **Role hierarchy is flat:** There is no role inheritance. If a business rule requires Analysts to inherit all Viewer permissions, this is currently maintained manually in the `RecordAccessPolicy`. A Spring Security `RoleHierarchy` bean would be the correct extension point.
- **Currency is always INR:** The `currency` column exists on the `financial_records` table but multi-currency conversion is not implemented. The architecture supports adding it without schema changes.

---

## Future Scalability Considerations

The following extensions are architecturally straightforward given the current design but were deliberately left out of scope for this assessment:

- **Audit log table** — a separate `audit_log` table recording before/after state of every mutation, written to via a JPA `@EntityListener`. This would replace the current approach of relying solely on `created_by`/`updated_by` fields.
- **Read replica routing** — the `DashboardQueryRepository` is already separated from the write-model `RecordRepository`. Routing dashboard queries to a read replica requires adding a `@Transactional(readOnly = true)` routing datasource — no service layer changes needed.
- **Event-driven notifications** — publishing a `RecordCreatedEvent` via Spring's `ApplicationEventPublisher` after a successful record creation would allow downstream consumers (email alerts, audit log writer, cache eviction) to react without coupling to the service layer.