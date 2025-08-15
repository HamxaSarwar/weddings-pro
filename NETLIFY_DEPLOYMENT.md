# Netlify Deployment Guide

## Prerequisites
✅ Netlify configuration files created
✅ Local development working at http://localhost:5173/
✅ Git repository ready with all code committed

## Step-by-Step Deployment Process

### Step 1: Create GitHub Repository

**Option A: Manual Creation (Recommended)**
1. Go to [https://github.com/new](https://github.com/new)
2. Repository name: `weddings-pro`
3. Description: `Professional wedding planning application with RSVP management and photo sharing`
4. Set to **Public** 
5. **Do NOT** initialize with README (we have one)
6. Click **Create repository**

**Option B: GitHub CLI (if available)**
```bash
gh repo create weddings-pro --public --description "Professional wedding planning application with RSVP management and photo sharing"
```

### Step 2: Push Code to GitHub
```bash
# Add GitHub remote
git remote add origin https://github.com/YOUR_USERNAME/weddings-pro.git

# Push main branch
git push -u origin main

# Push development branch
git push -u origin development
```

### Step 3: Deploy to Netlify

#### Method 1: Netlify Dashboard (Easiest)
1. Go to [https://netlify.com](https://netlify.com) and sign up/log in
2. Click **"Add new site"** → **"Import an existing project"**
3. Choose **"Deploy with GitHub"**
4. Authorize Netlify to access your GitHub account
5. Select your `weddings-pro` repository
6. Configure build settings:
   - **Branch to deploy**: `main` (or `development` for testing)
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
7. Click **"Deploy site"**

#### Method 2: Netlify CLI
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Initialize and deploy
netlify init
netlify deploy --prod
```

### Step 4: Configure Environment Variables
1. In Netlify dashboard, go to your site
2. Click **Site settings** → **Environment variables**
3. Add the following variables:
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key

**Getting Supabase Credentials:**
1. Go to your Supabase project dashboard
2. Click **Settings** → **API**
3. Copy **Project URL** and **anon/public key**

### Step 5: Custom Domain (Optional)
1. In Netlify dashboard: **Domain settings**
2. Click **Add custom domain**
3. Follow DNS configuration instructions
4. SSL certificate will be automatically provisioned

## Build Configuration Details

### Netlify Settings
- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Node version**: 18.x
- **Package manager**: npm

### Automatic Deployments
- **Production**: Deploys from `main` branch
- **Preview**: Deploys from pull requests
- **Branch deploys**: Optional for `development` branch

## Environment Variables Required

```bash
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Post-Deployment Testing

### Test These Features:
1. **Authentication**: Sign up/login with OTP
2. **Wedding Creation**: Create a new wedding
3. **RSVP Form**: Test public RSVP page
4. **Photo Upload**: Test webcam and file upload
5. **Admin Gallery**: View uploaded photos
6. **RSVP Management**: Check RSVP dashboard

### Common Issues & Solutions

**Build Fails:**
- Check Node.js version compatibility
- Verify environment variables are set
- Check build logs in Netlify dashboard

**App Loads but Features Don't Work:**
- Verify Supabase environment variables
- Check browser console for errors
- Confirm Supabase CORS settings allow your domain

**404 Errors on Refresh:**
- Netlify.toml redirect rules should handle this
- Verify `_redirects` file if using alternative setup

## Continuous Deployment

Once configured:
- **Push to `main`** → Automatic production deployment
- **Create PR** → Automatic preview deployment
- **Push to `development`** → Branch deployment (if enabled)

## Performance Optimizations

✅ **Already Configured:**
- Static asset caching (1 year)
- Security headers
- SPA routing handled
- Build optimization via Vite

## Monitoring and Analytics

**Optional Additions:**
- **Netlify Analytics**: Built-in traffic analytics
- **Error Tracking**: Sentry integration
- **Performance**: Lighthouse CI
- **Uptime Monitoring**: External service

## Production URL

After deployment, your app will be available at:
- **Netlify subdomain**: `https://your-site-name.netlify.app`
- **Custom domain**: `https://yourdomain.com` (if configured)

## Security Considerations

✅ **Already Implemented:**
- Environment variables for secrets
- CORS properly configured
- HTTPS enforced
- Security headers set
- Input validation and sanitization

The wedding planning app is production-ready and will work seamlessly on Netlify!