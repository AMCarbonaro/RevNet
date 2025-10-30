# Render Deployment Setup Guide

## Quick Fix: Database Connection Issue

If you're seeing `ECONNREFUSED` errors, the backend can't connect to the database.

### Option 1: Using Render Dashboard (Recommended)

1. **Create Database First:**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click **"New +"** → **"PostgreSQL"**
   - **Name**: `revnet3-db`
   - **Plan**: Free
   - **Database Name**: `revnet3`
   - Click **"Create Database"**

2. **Get Database Connection String:**
   - Click on your newly created database
   - Find **"Internal Database URL"** (for services in same region)
   - Copy the connection string (looks like: `postgresql://revnet3_user:password@dpg-xxx:5432/revnet3`)

3. **Set DATABASE_URL Environment Variable:**
   - Go to your **revnet3-backend** service
   - Go to **"Environment"** tab
   - Find or add `DATABASE_URL`
   - Paste the connection string you copied
   - Click **"Save Changes"**

4. **Trigger Manual Deploy:**
   - Go to **"Manual Deploy"** tab
   - Click **"Deploy latest commit"**

### Option 2: Using render.yaml (Needs database already created)

If you already have the database created, the `render.yaml` should work. Just make sure:

1. The database exists in your Render dashboard
2. It's named exactly `revnet3-db`
3. The backend service is linked to it

## Complete Manual Setup (If render.yaml doesn't work)

### Step 1: Create PostgreSQL Database

1. Go to Render Dashboard
2. Click **"New +"** → **"PostgreSQL"**
3. Configure:
   - **Name**: `revnet3-db`
   - **Plan**: Free
   - **Database**: `revnet3`
   - **Region**: Choose closest to you

4. Click **"Create Database"**

### Step 2: Create Backend Service

1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Configure:
   - **Name**: `revnet3-backend`
   - **Root Directory**: `backend`
   - **Environment**: Node
   - **Branch**: `main`
   - **Build Command**: `npm ci && npx @nestjs/cli build`
   - **Start Command**: `npm start`
   - **Plan**: Free

4. Add Environment Variables:
   ```
   NODE_ENV=production
   PORT=3001
   DATABASE_URL=<paste from your database's Internal Database URL>
   FRONTEND_URL=https://revnet3-frontend.onrender.com
   STRIPE_SECRET_KEY=<your key>
   STRIPE_PUBLISHABLE_KEY=<your key>
   STRIPE_WEBHOOK_SECRET=<your secret>
   ```

5. Click **"Create Web Service"**

### Step 3: Create Frontend Service

1. Click **"New +"** → **"Web Service"**
2. Select your GitHub repository (same one)
3. Configure:
   - **Name**: `revnet3-frontend`
   - **Root Directory**: (leave empty)
   - **Environment**: Node
   - **Branch**: `main`
   - **Build Command**: `npm ci && npm run build:prod`
   - **Start Command**: `npx serve -s dist/revnet -l $PORT`
   - **Plan**: Free

4. Add Environment Variables:
   ```
   NODE_ENV=production
   PORT=3000
   ```

5. Click **"Create Web Service"**

## Troubleshooting

### Backend can't connect to database

**Error**: `ECONNREFUSED` or `Unable to connect to the database`

**Solution**: 
- Make sure DATABASE_URL is set in backend service environment variables
- Use the **"Internal Database URL"** from your PostgreSQL instance
- Don't use the public/external URL unless specifically needed

### Frontend can't find backend

**Error**: CORS errors or API calls failing

**Solution**:
- Make sure FRONTEND_URL is set correctly in backend
- Update frontend API base URL to point to backend service
- Check CORS settings in backend (see `backend/src/main.ts`)

### Build fails

**Error**: Build command fails

**Solution**:
- Check build logs in Render dashboard
- Make sure all dependencies are in package.json
- Try clearing build cache in Render

## Environment Variables Checklist

### Backend Service:
- ✅ `NODE_ENV` = `production`
- ✅ `PORT` = `3001`
- ✅ `DATABASE_URL` = (from your PostgreSQL internal URL)
- ✅ `FRONTEND_URL` = `https://revnet3-frontend.onrender.com`
- ⚠️ `STRIPE_SECRET_KEY` = (your Stripe secret key)
- ⚠️ `STRIPE_PUBLISHABLE_KEY` = (your Stripe publishable key)
- ⚠️ `STRIPE_WEBHOOK_SECRET` = (your Stripe webhook secret)

### Frontend Service:
- ✅ `NODE_ENV` = `production`
- ✅ `PORT` = `3000`

## After Successful Deployment

1. Visit your frontend URL: `https://revnet3-frontend.onrender.com`
2. Test functionality
3. Check logs if issues occur
4. Set up auto-deployment (should be automatic)

## Database Migration

After the database is connected, you may need to run migrations:

1. Connect to your Render shell
2. Run: `npm run typeorm:run` (from backend directory)

Or manually in backend code, temporarily enable `synchronize: true` in `app.module.ts` (NOT recommended for production).

## Need Help?

Check Render logs in dashboard for detailed error messages. The build logs will show compilation errors, and the runtime logs will show application errors.

