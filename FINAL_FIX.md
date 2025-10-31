# Final Fix - Dashboard Override

## The Problem
The Render dashboard is using OLD settings and ignoring the updated render.yaml

## The Solution
Manually update the Build Command in the Render dashboard

## Steps

1. Go to your backend service in Render
2. Click **Settings** tab
3. Find **Build Command** section
4. Change it to:
   ```
   cd backend && npm ci --legacy-peer-deps && npm run build
   ```
5. Find **Start Command** section
6. Change it to:
   ```
   cd backend && npm start
   ```
7. Click **Save Changes**
8. Trigger a new deployment (or wait for auto-deploy)

## Why This Happens

When you created the service manually (not via Blueprint), it doesn't automatically use render.yaml settings. You have to update the dashboard manually OR delete and recreate via Blueprint.

## After This Works

Once deployed successfully:
1. Check the logs for database connection
2. Verify tables are created
3. Test the API

