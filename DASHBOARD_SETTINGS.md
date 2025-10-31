# Render Dashboard Settings

## Where the Error is Coming From

The error path `/opt/render/project/src/backend/dist/src/main.js` means Render is running from the WRONG directory.

## Fix in Dashboard

Go to your backend service settings and change:

### Current Settings (WRONG):
- Build Command: `npm run build` (running from root, not backend folder)
- Start Command: `npm start` (running from root, not backend folder)

### Correct Settings:
- Build Command: `cd backend && npm ci && npm run build`
- Start Command: `cd backend && npm start`

## Steps to Fix

1. Go to your backend service in Render
2. Click **Settings** tab
3. Find **Build Command** section
4. Change to: `cd backend && npm ci && npm run build`
5. Find **Start Command** section  
6. Change to: `cd backend && npm start`
7. Click **Save Changes**
8. Manually deploy

## Alternative: Use rootDir

Or in Settings, look for **Root Directory**:
- Set Root Directory to: `backend`

This makes all commands run from the backend folder automatically.

