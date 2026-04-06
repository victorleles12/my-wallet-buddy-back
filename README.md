# FinanControl Backend

Backend do projeto de controle de gastos familiar, iniciado com a mesma base de arquitetura usada no projeto GymCore:

- `src/domain`: entidades e contratos de dominio
- `src/infrastructure`: banco de dados e adaptadores externos
- `src/modules`: modulos por contexto de negocio
- `src/shared`: utilitarios e componentes compartilhados

## Requisitos

- Node.js 20+
- PostgreSQL

## Setup

1. Instale dependencias:
   - `npm install`
2. Copie variaveis:
   - `cp .env.example .env`
3. Ajuste as configuracoes de banco no `.env`
4. Rode em desenvolvimento:
   - `npm run start:dev`

## Endpoints iniciais

- `GET /health`
- Users: `POST /users`, `GET /users`, `GET /users/:id`, `PATCH /users/:id`, `DELETE /users/:id`
- `POST /expenses`
- `GET /expenses`
- Swagger: `GET /api/docs`

## Migrations

Apos ajustar o `.env`, compile e aplique:

- `npm run migration:run`
