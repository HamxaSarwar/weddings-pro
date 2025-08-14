# Wedding Planning App - Deployment Guide

## Current Status

✅ **Local Development Setup Complete**
- React + Vite project structure implemented
- Supabase database schema deployed to production
- Full authentication system with OTP
- All core features implemented and tested
- Git repository initialized with proper branching structure

## Git Repository Structure

### Branches Created
- `main` - Production-ready code
- `development` - Development branch (current)

### Initial Commit
- Committed all project files to `main` branch
- Created `development` branch for ongoing development
- Proper `.gitignore` configured with environment variables

## Next Steps Required

### 1. GitHub Repository Setup
**Status: Requires Manual Setup**

The GitHub CLI (`gh`) is not available in the current environment. To complete the GitHub setup:

```bash
# Option 1: Install GitHub CLI
brew install gh  # or appropriate package manager

# Option 2: Create repository manually at https://github.com/new
# Repository name: weddings-pro
# Description: Professional wedding planning application with RSVP management and photo sharing
# Public repository

# Then add remote origin
git remote add origin https://github.com/YOUR_USERNAME/weddings-pro.git
git push -u origin main
git push -u origin development
```

### 2. Supabase Branch Management
**Status: Requires Cost Confirmation**

Supabase branch creation requires cost confirmation due to billing implications:

```bash
# Cost Structure:
# - Preview branches run on Micro Compute: $0.01344/hour
# - Usage counts toward subscription plan quota
# - No fixed fee, pay only for usage

# To create development branch:
# 1. Use Supabase Dashboard (recommended)
#    - Enable "Branching via dashboard" in user menu
#    - Click branch selector in top menu
#    - Create new branch named "development"
# 
# 2. Or use CLI with proper cost confirmation
#    supabase branches create development --experimental
```

### 3. Environment Configuration

Create environment files for different stages:

**Production (.env.production)**
```
VITE_SUPABASE_URL=your_production_supabase_url
VITE_SUPABASE_ANON_KEY=your_production_anon_key
```

**Development (.env.development)**
```
VITE_SUPABASE_URL=your_development_branch_url
VITE_SUPABASE_ANON_KEY=your_development_anon_key
```

### 4. CI/CD Pipeline Recommendations

Consider setting up GitHub Actions for:
- Automated testing on PR creation
- Deployment to development branch on merge
- Production deployment on main branch updates

## Current Architecture

### Database Schema (Production)
- ✅ `weddings` table with RLS policies
- ✅ `rsvps` table with guest management
- ✅ `additional_guests` table for plus-ones
- ✅ `wedding_photos` table with secure storage
- ✅ Storage bucket `wedding-photos` configured
- ✅ Row Level Security policies implemented

### Authentication
- ✅ Passwordless OTP authentication
- ✅ Email-based verification system
- ✅ Secure session management

### Core Features Implemented
- ✅ Landing page with modern UI
- ✅ User registration and login with OTP
- ✅ Wedding creation and management dashboard
- ✅ Public RSVP pages with guest management
- ✅ Date-based page switching (RSVP ↔ Photo upload)
- ✅ Webcam photo capture functionality
- ✅ File upload with validation
- ✅ Password-protected photo access
- ✅ Admin photo gallery with download
- ✅ Responsive design with Tailwind CSS

## Development Workflow

1. **Feature Development**
   - Create feature branches from `development`
   - Implement and test features locally
   - Create PR to merge into `development`

2. **Testing**
   - Test on development Supabase branch
   - Verify all functionality works with branch database

3. **Production Deployment**
   - Merge `development` into `main`
   - Deploy to production environment
   - Merge Supabase development branch to main

## Ready for Production

The application is fully functional and ready for deployment. The main requirements for going live are:

1. ✅ Complete codebase with all features
2. ⏳ GitHub repository setup (manual step required)
3. ⏳ Supabase branch management (cost confirmation required)
4. ⏳ Environment configuration for production/development
5. ⏳ Optional: CI/CD pipeline setup

**Estimated time to complete setup: 30-60 minutes** (mostly manual configuration)