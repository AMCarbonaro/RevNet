# Render Database Migration Guide

## Important: Your Existing Data

Yes! If you've been developing locally, you likely have data in your local PostgreSQL database. Here's how to handle it when deploying to Render.

## Option 1: Fresh Start (Recommended for Testing)

If you want to start fresh on Render:

1. **Create the PostgreSQL database on Render** (as described in RENDER_SETUP.md)
2. **Run migrations** to set up the schema
3. **Test your app** - it will start with empty data

This is the simplest approach and what I recommend for the first deployment.

## Option 2: Preserve Your Local Data

If you have important data you want to keep:

### Step 1: Export Data from Local Database

```bash
# Export your local database to a SQL dump file
pg_dump -h localhost -U your_username -d revnet -F p > revnet_backup.sql
```

Or if using a connection string:
```bash
pg_dump "postgresql://username:password@localhost:5432/revnet" > revnet_backup.sql
```

### Step 2: Get Your Render Database Connection String

From Render dashboard:
- Go to your `revnet3-db` PostgreSQL instance
- Copy the **External Database URL** or **Internal Database URL**

### Step 3: Import Data to Render

You'll need to use the External URL to import from your machine:

```bash
# Import the SQL dump to Render
psql "<external_database_url>" < revnet_backup.sql
```

## Running Migrations on Render

Your migrations are already set up in the codebase. Here's how to run them:

### Method 1: Using Render Shell (Recommended)

1. In Render dashboard, go to your backend service
2. Click on **"Shell"** tab
3. Connect to the shell
4. Run:
```bash
cd backend
npm run typeorm:run
```

### Method 2: Auto-sync (Development Mode Only)

The current code has `synchronize: true` when `NODE_ENV !== 'production'`. This means:
- **In development**: Tables are created/updated automatically
- **In production**: Tables are NOT modified (safe!)

If you want to temporarily enable auto-sync on Render:
1. Go to backend environment variables
2. Temporarily set `NODE_ENV=development`
3. Deploy
4. Tables will be created automatically
5. Change `NODE_ENV` back to `production`

⚠️ **Warning**: Auto-sync can cause data loss if schema changes conflict with existing data. Use migrations in production!

## Database Schema Overview

Your migrations create these tables:

### Core Tables:
1. **users** - User accounts, authentication
2. **servers** - Discord-like servers
3. **channels** - Text/Voice channels within servers
4. **messages** - Messages in channels
5. **dm_channels** - Direct message channels
6. **server_members** - Junction table (users <-> servers)
7. **server_owners** - Junction table (owners <-> servers)

### Migration Files:
- `1700000000000-CreateRevNetTables.ts` - Core tables (servers, channels, messages)
- `1734567890123-AddMessageSearchIndexes.ts` - Search indexes for messages
- `1761785961388-CreateDMChannelsTable.ts` - DM channels table

## Quick Start: New Database on Render

1. **Create PostgreSQL database** in Render dashboard
2. **Set DATABASE_URL** in backend environment variables
3. **Deploy backend** - it should connect
4. **Run migrations** via Shell:
   ```bash
   cd backend
   npm run typeorm:run
   ```
5. Your app should now have the schema ready!

## Troubleshooting

### "relation does not exist" error
- Run migrations: `npm run typeorm:run`
- Or temporarily enable synchronize (see Method 2 above)

### Connection refused
- Check DATABASE_URL is set correctly
- Use Internal URL for services in same region
- Verify database status in Render dashboard

### Migration fails
- Check logs for specific errors
- Verify database URL has proper permissions
- Ensure you're connected to the right database

## Remember

- **Local data stays local** unless you explicitly export/import it
- **Render database starts empty** unless you run migrations
- **Migrations are safe** - they only add new tables, don't delete data
- **Auto-sync is dangerous** in production - don't use it!

If you need help with a specific migration issue, check the Render logs for details.

