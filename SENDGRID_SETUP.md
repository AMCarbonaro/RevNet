# SendGrid Email Setup Guide

## Overview

RevNet uses SendGrid to send verification emails and password reset emails. This guide will help you set up SendGrid for production use.

## Step 1: Create SendGrid Account

1. Go to [SendGrid](https://sendgrid.com/)
2. Sign up for a free account (100 emails/day free)
3. Verify your email address

## Step 2: Create API Key

1. Log in to SendGrid dashboard
2. Navigate to **Settings** → **API Keys**
3. Click **Create API Key**
4. Name it (e.g., "RevNet Production")
5. Select **Full Access** permissions
6. Click **Create & View**
7. **Copy the API key immediately** - you won't be able to see it again!

## Step 3: Verify Sender Email

1. Navigate to **Settings** → **Sender Authentication**
2. Click **Verify a Single Sender**
3. Fill in your information:
   - **From Email Address**: The email you want to send from (e.g., `noreply@yourdomain.com`)
   - **From Name**: Your company/name (e.g., "RevNet")
   - **Reply To**: Your support email
   - **Company Address**: Your business address
   - **Website URL**: Your website URL
4. Click **Create**
5. Check your email and click the verification link

## Step 4: Configure Environment Variables

Add these to your Render (or hosting platform) environment variables:

```
SENDGRID_API_KEY=SG.your_api_key_here
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
FRONTEND_URL=https://your-frontend-url.com
```

### For Render:

1. Go to your Render dashboard
2. Select your backend service
3. Click **Environment**
4. Add the variables:
   - `SENDGRID_API_KEY` = Your SendGrid API key
   - `SENDGRID_FROM_EMAIL` = Your verified sender email
   - `FRONTEND_URL` = Your frontend URL (e.g., `https://revnet.app`)
5. Click **Save Changes**
6. Your service will automatically redeploy

## Step 5: Test Email Sending

1. Register a new account with a real email address
2. Check your inbox for the verification email
3. Click the verification link
4. You should be redirected to the login page

## Development Mode

If SendGrid is **not configured**, the system will:
- Log verification links to the backend console
- Display the verification link on the verification page
- Allow users to copy and use the link directly

This allows testing without SendGrid setup, but for production with real users, you should configure SendGrid.

## Troubleshooting

### Emails not sending?

1. Check that `SENDGRID_API_KEY` is set correctly
2. Verify the sender email is verified in SendGrid
3. Check backend logs for error messages
4. Ensure `FRONTEND_URL` matches your actual frontend domain

### Verification link not working?

1. Make sure `FRONTEND_URL` is set correctly
2. Check that the link includes the full URL with protocol (https://)
3. Verify the token hasn't expired (24 hours)

### Getting rate limited?

SendGrid free tier allows 100 emails/day. Upgrade to a paid plan for more capacity.

## Security Notes

- Never commit `SENDGRID_API_KEY` to git
- Rotate API keys regularly
- Use environment variables, not hardcoded values
- Monitor SendGrid dashboard for unusual activity

