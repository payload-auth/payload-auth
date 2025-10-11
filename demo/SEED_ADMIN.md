# Admin User Seed Script

This script creates the first admin user for the Payload Auth demo project.

## Usage

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Configure Admin Credentials (Optional)

Set environment variables in your `.env` file:

```env
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123456
ADMIN_NAME=Admin User
```

If not set, the script will use the default values shown above.

### 3. Run Migrations

Ensure the database is initialized:

```bash
pnpm payload migrate
```

### 4. Run the Seed Script

```bash
pnpm seed
```

## What It Does

The script will:
1. Check if an admin user already exists
2. If not, create a new user with:
   - Email: from `ADMIN_EMAIL`
   - Password: from `ADMIN_PASSWORD`
   - Name: from `ADMIN_NAME`
   - Role: `admin`
   - Email Verified: `true`

## Important Notes

- The script will skip creation if an admin user already exists
- Change the admin password immediately after first login for security
- The database must be migrated before running this script

## Troubleshooting

**"Admin user already exists"**
- An admin user is already in the database
- Use the existing admin user or remove it from the database if you need to recreate it

**"relation does not exist" errors**
- Run `pnpm payload migrate` to initialize the database schema
