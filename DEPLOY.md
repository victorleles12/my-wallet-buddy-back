# Docker e deploy na AWS

## Rodar localmente (API + Postgres)

1. Copie variáveis de ambiente:

   ```bash
   cp .env.docker.example .env
   ```

   Ajuste `JWT_SECRET` e, se quiser, `ALLOWED_ORIGINS`.

2. Suba os serviços:

   ```bash
   docker compose up --build
   ```

   A API sobe em `http://localhost:3000`, health em `GET /health`. Na primeira subida o entrypoint executa `migration:run` automaticamente (defina `SKIP_MIGRATIONS=true` se quiser desligar e rodar migrações à mão).

3. Migrações manuais (sem passar pelo entrypoint):

   ```bash
   docker compose run --rm --entrypoint node api ./node_modules/typeorm/cli.js migration:run -d ./dist/infrastructure/database/config/postgres.provider.js
   ```

   Com a API já no ar: `docker compose exec api npm run migration:run:prod`.

## Imagem para a AWS

- **Build:** `docker build -t finan-control-api:latest .`
- **Registro:** envie para [Amazon ECR](https://docs.aws.amazon.com/ecr/) e use a URI da imagem no ECS/App Runner.

### Variáveis importantes em produção

| Variável | Notas |
|----------|--------|
| `NODE_ENV` | `production` |
| `PORT` / `HOST` | Mantenha `HOST=0.0.0.0`; o PaaS costuma definir `PORT` |
| `DATABASE_URL` | RDS PostgreSQL, ex.: `postgresql://user:pass@host:5432/dbname` |
| `DB_SSL` | `true` para RDS se não usar `sslmode` na URL |
| `JWT_SECRET` | Obrigatório, valor forte |
| `ALLOWED_ORIGINS` | Origens do app (CORS); em produção não deixe vazio |
| `TRUST_PROXY` | `true` atrás de ALB/API Gateway para IP e rate limit corretos |
| `GOOGLE_OAUTH_CLIENT_IDS` | Se usar login Google |
| `MAILGUN_*` ou `SMTP_*` | Para envio de códigos de login por e-mail |
| `SKIP_MIGRATIONS` | Em ECS, pode ser `true` e rodar migrações como task one-off ou job |

### Caminhos na AWS (resumo)

1. **RDS PostgreSQL** — mesma VPC/security group que o serviço que roda o container; credenciais em Secrets Manager ou variáveis do task definition.
2. **ECS Fargate** — task definition com a imagem do ECR, target group no ALB na porta do `PORT`, health check HTTP em `/health`.
3. **Migrações** — task ECS one-off com o mesmo image/command que executa `npm run migration:run:prod` (ou o `node typeorm ...` equivalente), com as mesmas env vars de banco.

Para um único servidor EC2, você pode usar o mesmo `docker compose` apontando `DATABASE_URL` para o RDS e sem o serviço `db` (ou só `api` com env externas).
