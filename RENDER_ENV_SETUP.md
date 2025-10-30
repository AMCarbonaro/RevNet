# Render Environment Variables Setup Guide

## Critical Issue: Missing Environment Variables

Your Render deployment is missing essential environment variables that need to be configured in the Render dashboard.

## Required for Backend Service

### 1. Database Connection (REQUIRED)
**Variable:** `DATABASE_URL`

**How to set:**
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "PostgreSQL"
3. Name: `revnet3-db`
4. Plan: Free
5. Click "Create Database"
6. Wait for database to be created
7. Copy the **"Internal Database URL"** (looks like: `postgresql://revnet3_user:password@dpg-xxx.a.oregon-postgres.render.com/revnet3`)
8. Go to your backend service (`revnet3-backend`)
9. Go to "Environment" tab
10. Click "Add Environment Variable"
11. Key: `DATABASE_URL`
12. Value: Paste the connection string
13. Click "Save Changes"

### 2. Stripe Keys (OPTIONAL - Required for payments)
**Variables:**
- `STRIPE_SECRET_KEY`
- `STRIPE_PUBLISHABLE_KEY`  
- `STRIPE_WEBHOOK_SECRET`

**How to get:**
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Get your API keys from "Developers" → "API keys"
3. Add each to Render environment variables

**Notes:**
- Use test keys (`sk_test_...` and `pk_test_...`) for testing
- Use live keys only in production
- Don't commit keys to git!

### 3. Frontend URL (REQUIRED)
**Variable:** `FRONTEND_URL`

**Value:** `https://revnet3-frontend.onrender.com`

(Already set in render.yaml, but verify in dashboard)

## Required for Frontend Service

### 1. Node Environment
**Variable:** `NODE_ENV`
**Value:** `production`

(Already set in render.yaml)

## Quick Setup Checklist

### Step 1: Create Database
- [ ] Create PostgreSQL database in Render
- [ ] Name it `revnet3-db`
- [ ] Copy the Internal Database URL

### Step 2: Set Backend Environment Variables
- [ ] Add `DATABASE_URL` to backend service
- [ ] Add `STRIPE_SECRET_KEY` (if using payments)
- [ ] Add `STRIPE_PUBLISHABLE_KEY` (if using payments)
- [ ] Add `STRIPE_WEBHOOK_SECRET` (if using payments)
- [ ] Verify `FRONTEND_URL` is set

### Step 3: Deploy
- [ ] Trigger manual deploy of backend service
- [ ] Check logs for database connection
- [ ] Verify tables are created (if synchronize is enabled)

## After Database is Connected

Once DATABASE_URL is set, the backend will:
1. Connect to the database
2. Create tables automatically (synchronize is temporarily enabled)
3. Start successfully

## Troubleshooting

### "Cannot connect to database"
- Verify DATABASE_URL is set correctly
- Use Internal Database URL, not External
- Check database status in Render

### "No DATABASE_URL found"
- Environment variable not set
- Follow Step 2 above

### Build succeeds but app crashes
- Check if DATABASE_URL is missing
- View logs for connection errors
- Verify database is running

## Current Status

✅ Build configuration: Fixed
✅ Path issues: Fixed  
❌ Database: **NOT CREATED YET**
❌ Environment variables: **NOT SET YET**

## Next Steps

1. **Create the PostgreSQL database in Render**
2. **Set DATABASE_URL in backend environment variables**
3. **Trigger a new deployment**
4. **Monitor logs to verify connection**

## Testing Locally

For local development, create a `.env` file in the backend directory:
```
DATABASE_URL=postgresql://username:password@localhost:5432/revnet
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:4200
```

But don't commit this file to git!

