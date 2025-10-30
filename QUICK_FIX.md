# Quick Fix: Database Connection

## If You Already Have a Database

1. **Find your database in Render dashboard**
2. **Copy the Internal Database URL** (looks like: `postgresql://...`)
3. **Go to your backend service** (`revnet3-backend`)
4. **Environment tab** → Add environment variable:
   - Key: `DATABASE_URL`
   - Value: (paste your database URL)
5. **Save Changes**
6. **Manually deploy** or wait for auto-deploy

## Verify

After deploying, check the logs for:
- ✅ `[DB] DATABASE_URL exists: true`
- ✅ `[DB] Connecting to host: ...`
- ✅ `🚀 Backend running on port 3001`

If you see errors, the DATABASE_URL is probably wrong or not set.

