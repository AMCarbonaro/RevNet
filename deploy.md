# Revolution Network Deployment Guide

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **MongoDB Atlas**: Set up a free cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
3. **Stripe Account**: Create an account at [stripe.com](https://stripe.com)
4. **GitHub Repository**: Push your code to GitHub

## Deployment Steps

### 1. Vercel Deployment

1. **Connect GitHub Repository**:
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository
   - Select the repository containing Revolution Network

2. **Configure Build Settings**:
   - Framework Preset: Next.js
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `.next`

3. **Environment Variables**:
   Add the following environment variables in Vercel:

   ```
   # NextAuth.js
   NEXTAUTH_URL=https://your-app.vercel.app
   NEXTAUTH_SECRET=your-secret-key-here

   # MongoDB
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/revolution-network

   # Stripe
   STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...

   # Socket.IO
   SOCKET_IO_SECRET=your-socket-secret-here

   # Optional OAuth Providers
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   GITHUB_CLIENT_ID=your-github-client-id
   GITHUB_CLIENT_SECRET=your-github-client-secret
   DISCORD_CLIENT_ID=your-discord-client-id
   DISCORD_CLIENT_SECRET=your-discord-client-secret
   ```

4. **Deploy**:
   - Click "Deploy"
   - Wait for the deployment to complete
   - Your app will be available at `https://your-app.vercel.app`

### 2. MongoDB Atlas Setup

1. **Create Cluster**:
   - Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
   - Create a new cluster (free tier available)
   - Choose a region close to your users

2. **Database Access**:
   - Go to "Database Access"
   - Create a new database user
   - Set username and password
   - Grant "Read and write to any database" permissions

3. **Network Access**:
   - Go to "Network Access"
   - Add IP address: `0.0.0.0/0` (for Vercel deployment)
   - Or add Vercel's IP ranges

4. **Connection String**:
   - Go to "Clusters"
   - Click "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `<dbname>` with `revolution-network`

### 3. Stripe Setup

1. **Create Stripe Account**:
   - Go to [stripe.com](https://stripe.com)
   - Create an account
   - Complete the onboarding process

2. **Get API Keys**:
   - Go to "Developers" > "API keys"
   - Copy the "Publishable key" and "Secret key"
   - Add them to your Vercel environment variables

3. **Webhook Configuration**:
   - Go to "Developers" > "Webhooks"
   - Click "Add endpoint"
   - URL: `https://your-app.vercel.app/api/stripe/webhook`
   - Events to send:
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`
   - Copy the webhook secret and add it to Vercel

### 4. OAuth Providers (Optional)

#### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `https://your-app.vercel.app/api/auth/callback/google`
6. Copy client ID and secret to Vercel

#### GitHub OAuth
1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Create new OAuth App
3. Set Authorization callback URL:
   - `https://your-app.vercel.app/api/auth/callback/github`
4. Copy client ID and secret to Vercel

#### Discord OAuth
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create new application
3. Go to OAuth2 settings
4. Add redirect URI:
   - `https://your-app.vercel.app/api/auth/callback/discord`
5. Copy client ID and secret to Vercel

### 5. Post-Deployment

1. **Test the Application**:
   - Visit your deployed URL
   - Test the terminal interface
   - Test user registration/login
   - Test project creation
   - Test donation flow

2. **Monitor Logs**:
   - Check Vercel function logs
   - Monitor MongoDB Atlas metrics
   - Check Stripe webhook logs

3. **Set Up Monitoring**:
   - Add Vercel Analytics
   - Set up error monitoring (Sentry)
   - Monitor performance metrics

## Environment Variables Reference

### Required
- `NEXTAUTH_URL`: Your app's URL
- `NEXTAUTH_SECRET`: Random secret for JWT signing
- `MONGODB_URI`: MongoDB connection string
- `STRIPE_SECRET_KEY`: Stripe secret key
- `STRIPE_WEBHOOK_SECRET`: Stripe webhook secret

### Optional
- `GOOGLE_CLIENT_ID`: Google OAuth client ID
- `GOOGLE_CLIENT_SECRET`: Google OAuth client secret
- `GITHUB_CLIENT_ID`: GitHub OAuth client ID
- `GITHUB_CLIENT_SECRET`: GitHub OAuth client secret
- `DISCORD_CLIENT_ID`: Discord OAuth client ID
- `DISCORD_CLIENT_SECRET`: Discord OAuth client secret

## Security Considerations

1. **Environment Variables**: Never commit secrets to version control
2. **HTTPS**: Always use HTTPS in production
3. **CORS**: Configure CORS properly
4. **Rate Limiting**: Implement rate limiting for API endpoints
5. **Input Validation**: Validate all user inputs
6. **Error Handling**: Don't expose sensitive information in errors

## Troubleshooting

### Common Issues

1. **Build Failures**:
   - Check Node.js version compatibility
   - Verify all dependencies are installed
   - Check for TypeScript errors

2. **Database Connection Issues**:
   - Verify MongoDB URI format
   - Check network access settings
   - Verify database user permissions

3. **Authentication Issues**:
   - Check NEXTAUTH_SECRET is set
   - Verify OAuth provider configuration
   - Check redirect URIs

4. **Payment Issues**:
   - Verify Stripe keys are correct
   - Check webhook configuration
   - Monitor Stripe dashboard for errors

### Support

- Check Vercel documentation: [vercel.com/docs](https://vercel.com/docs)
- MongoDB Atlas documentation: [docs.atlas.mongodb.com](https://docs.atlas.mongodb.com)
- Stripe documentation: [stripe.com/docs](https://stripe.com/docs)
- NextAuth.js documentation: [next-auth.js.org](https://next-auth.js.org)

## Production Checklist

- [ ] Environment variables configured
- [ ] Database connection working
- [ ] Authentication working
- [ ] Payment processing working
- [ ] Real-time features working
- [ ] Error monitoring set up
- [ ] Performance monitoring set up
- [ ] Security headers configured
- [ ] SSL certificate active
- [ ] Backup strategy implemented
