# Database & DDD Synchronization Rule

Whenever any modification, addition, deletion, or refactoring is performed on the database layer:
1. **Mandatory DDD.md Update:**
   - Immediately update `DDD.md` (Data Design Documentation) to reflect all database changes.
   - Update the **Data Dictionary (Veri Sözlüğü)** with new/modified fields, types, constraints, nullability, and validation rules.
   - Update the **Physical Data Model (PostgreSQL DDL script)** and any affected indexes.
   - Update the **Conceptual (CDM)** and **Logical (LDM)** Mermaid diagrams if entity relationships or cardinalities change.
2. **Synchronization with Application Models:**
   - Keep `server/models/` (JavaScript domain models/repositories) in lockstep with the definitions in `DDD.md`.
   - Update OpenAPI/Swagger documentation (`server/swagger.js`) schemas to match the updated database fields.
3. **README.md Consistency:**
   - If high-level schemas or database technologies change, verify and update the summary diagrams and tables in `README.md`.
