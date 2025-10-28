# RevNet3 Deployment Guide for DigitalOcean

This guide will help you deploy your RevNet3 application to DigitalOcean App Platform.

## Prerequisites

1. **DigitalOcean Account**: Sign up at [digitalocean.com](https://digitalocean.com)
2. **GitHub Repository**: Push your code to GitHub
3. **DigitalOcean CLI (doctl)**: Install from [here](https://docs.digitalocean.com/reference/doctl/how-to/install/)

## Quick Start

### Option 1: Using DigitalOcean Web Interface (Recommended)

1. **Go to DigitalOcean App Platform**
   - Visit [cloud.digitalocean.com/apps](https://cloud.digitalocean.com/apps)
   - Click "Create App"

2. **Connect GitHub Repository**
   - Select your RevNet3 repository
   - Choose the main branch

3. **Configure Services**
   - **Backend Service**:
     - Source Directory: `/backend`
     - Build Command: `npm run build`
     - Run Command: `npm start`
     - Environment: Node.js
     - Port: 3000
   
   - **Frontend Service**:
     - Source Directory: `/` (root)
     - Build Command: `npm run build`
     - Run Command: `npx serve -s dist/revnet -l 3001`
     - Environment: Node.js
     - Port: 3001

4. **Set Environment Variables**
   ```
   NODE_ENV=production
   PORT=3000 (for backend)
   MONGODB_URI=your_mongodb_connection_string
   STRIPE_SECRET_KEY=your_stripe_secret_key
   STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
   FRONTEND_URL=your_app_url
   ```

5. **Add Database**
   - Add MongoDB database
   - Choose appropriate size (Basic $15/month for development)

6. **Deploy**
   - Click "Create Resources"
   - Wait for deployment to complete

### Option 2: Using CLI (Advanced)

1. **Install doctl**
   ```bash
   # macOS
   brew install doctl
   
   # Linux
   snap install doctl
   
   # Windows
   choco install doctl
   ```

2. **Authenticate**
   ```bash
   doctl auth init
   ```

3. **Deploy**
   ```bash
   chmod +x deploy.sh
   ./deploy.sh
   ```

## Environment Variables

Set these in your DigitalOcean App Platform environment:

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment | `production` |
| `PORT` | Backend port | `3000` |
| `MONGODB_URI` | MongoDB connection | `mongodb://user:pass@host:port/db` |
| `STRIPE_SECRET_KEY` | Stripe secret key | `sk_live_...` |
| `STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | `pk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret | `whsec_...` |
| `FRONTEND_URL` | Your app URL | `https://your-app.ondigitalocean.app` |

## Database Setup

### Option 1: DigitalOcean Managed Database
1. Go to Databases in DigitalOcean
2. Create MongoDB cluster
3. Get connection string
4. Add to environment variables

### Option 2: MongoDB Atlas
1. Sign up at [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create free cluster
3. Get connection string
4. Add to environment variables

## Stripe Setup

1. **Create Stripe Account**
   - Sign up at [stripe.com](https://stripe.com)

2. **Get API Keys**
   - Go to Developers > API Keys
   - Copy Secret Key and Publishable Key

3. **Set up Webhooks**
   - Go to Developers > Webhooks
   - Add endpoint: `https://your-app.ondigitalocean.app/webhooks/stripe`
   - Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`
   - Copy webhook secret

## Monitoring

- **App Platform Dashboard**: Monitor your app at [cloud.digitalocean.com/apps](https://cloud.digitalocean.com/apps)
- **Logs**: View real-time logs in the DigitalOcean dashboard
- **Metrics**: Monitor CPU, memory, and request metrics

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check build logs in DigitalOcean dashboard
   - Ensure all dependencies are in package.json
   - Verify build commands are correct

2. **Environment Variables**
   - Double-check all environment variables are set
   - Ensure no typos in variable names
   - Verify values are correct

3. **Database Connection**
   - Check MongoDB connection string
   - Ensure database is accessible from DigitalOcean
   - Verify network settings

4. **Stripe Integration**
   - Verify API keys are correct
   - Check webhook endpoint is accessible
   - Ensure webhook secret is set

### Getting Help

- **DigitalOcean Support**: [help.digitalocean.com](https://help.digitalocean.com)
- **App Platform Docs**: [docs.digitalocean.com/products/app-platform](https://docs.digitalocean.com/products/app-platform)
- **Community**: [DigitalOcean Community](https://www.digitalocean.com/community)

## Cost Estimation

- **Basic App**: $5/month (1 service, 512MB RAM)
- **Standard App**: $12/month (1 service, 1GB RAM)
- **MongoDB Database**: $15/month (Basic plan)
- **Total**: ~$20-30/month for development

## Next Steps

1. Set up custom domain (optional)
2. Configure SSL certificates (automatic with App Platform)
3. Set up monitoring and alerts
4. Configure backup strategies
5. Set up CI/CD pipeline

---

**Need Help?** Check the troubleshooting section or reach out to the DigitalOcean community!
