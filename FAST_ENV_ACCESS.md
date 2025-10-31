# Fast Access to Environment Tab

## Quick Path

1. Go to: https://dashboard.render.com
2. Click on your **backend service** (should be named `revnet3-backend`)
3. In the **left sidebar**, look for tabs:
   - Overview
   - **Environment** ← Click this
   - Events  
   - Logs
   - Metrics
   - Settings

That's it! Click "Environment" tab.

## What You'll See

You should see these environment variables:
- NODE_ENV = production
- PORT = 3001
- DATABASE_URL = postgresql://... (should be there now!)
- FRONTEND_URL = https://revnet3-frontend.onrender.com
- STRIPE_SECRET_KEY = <not set>
- etc.

## Already Done!

Since we added DATABASE_URL to render.yaml and pushed it, you should see it in the Environment tab without doing anything else.

Just click "Environment" to verify it's there!

