# Where to Find Environment Variables in Render

## Step-by-Step Guide

1. **Go to Render Dashboard**
   - Visit: https://dashboard.render.com

2. **Find Your Backend Service**
   - Look for `revnet3-backend` in your services list
   - Click on it

3. **Click on "Environment" Tab**
   - On the left sidebar, you'll see tabs:
     - Overview
     - **Environment** ← CLICK HERE
     - Events
     - Logs
     - Metrics
     - Settings
   - Click "Environment"

4. **Add Environment Variable**
   - You'll see a list of existing environment variables
   - Click "Add Environment Variable" button
   - Key: `DATABASE_URL`
   - Value: (paste your database connection string)
   - Click "Save Changes"

## Alternative Location

If you don't see "Environment" tab, try:
1. Click "Settings" tab
2. Scroll down to "Environment Variables" section
3. Add your variables there

## Quick Access

Direct URL pattern:
`https://dashboard.render.com/web/[service-name]-revnet3-backend/environment`

## What to Add

From your database page:
1. Click on your `revnet3-db` database
2. Find "Internal Database URL" section
3. Copy the entire connection string
4. Paste it as the value for `DATABASE_URL`

It should look like:
```
postgresql://revnet3_user:password@dpg-xxxxx-a.oregon-postgres.render.com/revnet3
```

## Save and Deploy

After adding:
1. Click "Save Changes"
2. Scroll up and click "Manual Deploy"
3. Select "Deploy latest commit"
4. Wait for deployment
5. Check logs for connection success

