# RevNet3 Deployment Guide for Render

This guide will help you deploy your RevNet3 application to Render using their free tier.

## 🚀 **Quick Start (5 Minutes)**

### **Step 1: Go to Render**
1. Visit [render.com](https://render.com)
2. Sign up with your GitHub account
3. Click **"New +"** → **"Web Service"**

### **Step 2: Connect GitHub Repository**
1. Select **"Build and deploy from a Git repository"**
2. Choose **"Connect GitHub"**
3. Select your **"RevNet"** repository
4. Click **"Connect"**

### **Step 3: Configure Frontend Service**
1. **Name**: `revnet3-frontend`
2. **Environment**: `Node`
3. **Region**: `Oregon (US West)`
4. **Branch**: `main`
5. **Root Directory**: Leave empty (root)
6. **Build Command**: `npm run build:prod`
7. **Start Command**: `npm run serve:prod`
8. **Instance Type**: `Free`

### **Step 4: Configure Backend Service**
1. **Name**: `revnet3-backend`
2. **Environment**: `Node`
3. **Region**: `Oregon (US West)`
4. **Branch**: `main`
5. **Root Directory**: `backend`
6. **Build Command**: `npm run build`
7. **Start Command**: `npm start`
8. **Instance Type**: `Free`

### **Step 5: Add Database**
1. Click **"New +"** → **"PostgreSQL"**
2. **Name**: `revnet3-db`
3. **Database**: `revnet3`
4. **User**: `revnet3_user`
5. **Plan**: `Free`

### **Step 6: Set Environment Variables**

#### **For Backend Service:**
```
NODE_ENV=production
PORT=3001
MONGODB_URI=your_mongodb_connection_string
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
FRONTEND_URL=https://revnet3-frontend.onrender.com
```

#### **For Frontend Service:**
```
NODE_ENV=production
PORT=3000
```

### **Step 7: Deploy**
1. Click **"Create Web Service"** for both services
2. Wait for deployment (5-10 minutes)
3. Your app will be live!

## 📋 **Detailed Configuration**

### **Frontend Service Settings**
- **Build Command**: `npm run build:prod`
- **Start Command**: `npm run serve:prod`
- **Environment**: Node.js
- **Node Version**: 18.x
- **Port**: 3000

### **Backend Service Settings**
- **Build Command**: `npm run build`
- **Start Command**: `npm start`
- **Environment**: Node.js
- **Node Version**: 18.x
- **Port**: 3001

### **Database Settings**
- **Type**: PostgreSQL
- **Plan**: Free (1GB storage)
- **Connection**: Automatic via environment variables

## 🔧 **Environment Variables Setup**

### **Required Variables for Backend:**
| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment | `production` |
| `PORT` | Backend port | `3001` |
| `MONGODB_URI` | Database connection | `mongodb://...` |
| `STRIPE_SECRET_KEY` | Stripe secret key | `sk_live_...` |
| `STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | `pk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret | `whsec_...` |
| `FRONTEND_URL` | Frontend URL | `https://revnet3-frontend.onrender.com` |

### **Required Variables for Frontend:**
| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment | `production` |
| `PORT` | Frontend port | `3000` |

## 🗄️ **Database Setup Options**

### **Option 1: Render PostgreSQL (Recommended)**
- ✅ **Free tier**: 1GB storage
- ✅ **Automatic connection**: Via environment variables
- ✅ **Managed**: No maintenance required

### **Option 2: MongoDB Atlas (Alternative)**
- ✅ **Free tier**: 512MB storage
- ✅ **MongoDB**: Your current database
- ✅ **Global**: Multiple regions

## 💰 **Cost Breakdown**
- **Frontend Service**: $0/month (Free tier)
- **Backend Service**: $0/month (Free tier)
- **PostgreSQL Database**: $0/month (Free tier)
- **Total**: **$0/month** 🎉

## 🚀 **Deployment URLs**
After deployment, your services will be available at:
- **Frontend**: `https://revnet3-frontend.onrender.com`
- **Backend**: `https://revnet3-backend.onrender.com`
- **Database**: Internal connection only

## 🔍 **Monitoring & Logs**
- **Logs**: Available in Render dashboard
- **Metrics**: CPU, memory, and request metrics
- **Health Checks**: Automatic health monitoring
- **Uptime**: 99.9% SLA on paid plans

## 🛠️ **Troubleshooting**

### **Common Issues:**

1. **Build Failures**
   - Check build logs in Render dashboard
   - Ensure all dependencies are in package.json
   - Verify Node.js version compatibility

2. **Environment Variables**
   - Double-check all environment variables are set
   - Ensure no typos in variable names
   - Verify values are correct

3. **Database Connection**
   - Check MongoDB connection string
   - Ensure database is accessible
   - Verify network settings

4. **Service Communication**
   - Check FRONTEND_URL environment variable
   - Verify CORS settings
   - Ensure ports are correct

### **Getting Help:**
- **Render Support**: [render.com/docs](https://render.com/docs)
- **Community**: [Render Community](https://community.render.com)
- **Status**: [status.render.com](https://status.render.com)

## 🎯 **Next Steps After Deployment**

1. **Set up custom domain** (optional)
2. **Configure SSL certificates** (automatic)
3. **Set up monitoring and alerts**
4. **Configure backup strategies**
5. **Set up CI/CD pipeline**

## 📊 **Performance Optimization**

- **Enable CDN**: For static assets
- **Database indexing**: For better query performance
- **Caching**: For frequently accessed data
- **Monitoring**: Track performance metrics

---

**🎉 Congratulations!** Your RevNet3 application is now live on Render with a professional setup that costs $0/month!
