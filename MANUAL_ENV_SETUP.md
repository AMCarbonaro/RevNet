# Manual Environment Setup

## Add These Variables One by One

### Variable 1: NODE_ENV
- Key: `NODE_ENV`
- Value: `production`
- Click the "+" icon below the list

### Variable 2: PORT
- Key: `PORT`
- Value: `3001`
- Add

### Variable 3: DATABASE_URL (IMPORTANT!)
- Key: `DATABASE_URL`
- Value: `postgresql://revnet3_user:nAEt3DIGAMXf4XTPrOe8DQUxjcZwQS61@dpg-d41f6gje5dus73d9b1dg-a/revnet3_4vqo`
- Add

### Variable 4: FRONTEND_URL
- Key: `FRONTEND_URL`
- Value: `https://revnet3-frontend.onrender.com`
- Add

## After Adding All

1. Click "Save Changes" button
2. Trigger a new deployment
3. Check logs to verify connection

## Priority

**DATABASE_URL is the most important** - add this one first to get the app working!

The Stripe variables (STRIPE_SECRET_KEY, etc.) are optional for now.

