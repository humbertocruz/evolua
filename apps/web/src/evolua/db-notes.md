# Evolu[a] database notes

## Current direction
- Single Postgres database
- Multiple schemas:
  - `evolua` for model/editor/system data
  - `app` for business data of the app being built
- Runtime access via Prisma 7 + `@prisma/adapter-pg` + `pg` pool (important for the new Prisma client engine model)

## Why
This keeps one database for operational simplicity, but preserves a clear separation between:
- the Evolu[a] metamodel/editor world
- the user application's domain data

## Initial Prisma models
### evolua.projects
Stores the canonical model document (`model` as JSON).

### evolua.project_versions
Stores snapshots/versions of a project model.

### evolua.data_sources
Stores datasource definitions for a project.

### app.users
Example business table in the application schema.
