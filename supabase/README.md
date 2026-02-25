# Supabase Configuration

This directory contains the configuration files for running Supabase locally with Docker Compose.

## Structure

```
supabase/
├── init/
│   └── 01-schema.sql    # Database initialization schema
└── kong.yml             # Kong API Gateway configuration
```

## Setup

1. **Copy environment variables:**
   ```bash
   cp .env.example .env
   ```

2. **IMPORTANT: Update the secrets in `.env`** before going to production:
   - `POSTGRES_PASSWORD`: Strong PostgreSQL password
   - `JWT_SECRET`: At least 32 characters long secret for JWT tokens
   - `ANON_KEY`: Anonymous key for public access
   - `SERVICE_ROLE_KEY`: Service role key for admin operations

3. **Start Supabase services:**
   ```bash
   docker compose up -d
   ```

## Services

Once running, you can access:

- **Supabase Studio**: http://localhost:3000 (Database management UI)
- **API Gateway**: http://localhost:8000
- **PostgreSQL**: localhost:5432
- **Auth API**: http://localhost:8000/auth/v1
- **REST API**: http://localhost:8000/rest/v1
- **Realtime**: http://localhost:8000/realtime/v1
- **Storage**: http://localhost:8000/storage/v1

## Database Schema

The `01-schema.sql` file initializes a `todos` table with:
- Row Level Security (RLS) enabled
- User-specific policies for CRUD operations
- Automatic `updated_at` timestamp handling
- Indexes for performance

## Authentication Keys

For development, you can use the default keys provided in `.env.example`:

- **Anon Key** (for client-side operations): `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **Service Role Key** (for server-side admin operations): `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## Using Supabase in Your Application

### JavaScript/TypeScript

```javascript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'http://localhost:8000'
const supabaseKey = 'your-anon-key'
const supabase = createClient(supabaseUrl, supabaseKey)

// Example: Fetch todos
const { data, error } = await supabase
  .from('todos')
  .select('*')
```

### Rust (for Tauri app)

Add to your `Cargo.toml`:
```toml
[dependencies]
postgrest = "1.0"
```

## Troubleshooting

- **Services not starting?** Check `docker compose logs [service-name]`
- **Database connection issues?** Ensure PostgreSQL is healthy: `docker compose ps`
- **Auth not working?** Verify JWT_SECRET matches in all services

## Stopping Services

```bash
docker compose down
```

To remove volumes (all data will be lost):
```bash
docker compose down -v
```
