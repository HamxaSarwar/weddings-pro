# WeddingsPro - Product Requirements Document (PRD)

## Project Overview

WeddingsPro is a comprehensive wedding planning platform built with React, Vite, and Supabase that enables couples to create beautiful RSVP pages, collect guest responses, and capture wedding memories through a secure photo sharing system.

## Technical Stack

- **Frontend**: React 18 + Vite
- **Backend**: Supabase (Database, Authentication, Storage)
- **Styling**: Tailwind CSS
- **Routing**: React Router
- **Icons**: Lucide React
- **Deployment**: Vercel/Netlify (recommended)

## Core Features

### 1. Authentication System
- Passwordless OTP-based authentication via email
- Secure user registration and login
- Session management with Supabase Auth

### 2. Wedding Management
- Create and manage multiple weddings
- Edit wedding details (names, date, location, password)
- Dashboard with wedding overview and management

### 3. Public RSVP System
- Shareable public RSVP pages
- Guest response collection (attending/not attending)
- Additional guest management (plus-ones)
- Dietary restrictions and song request collection
- Date-based mode switching (RSVP → Photo Upload after wedding date)

### 4. Photo Collection System
- Password-protected photo upload post-wedding
- Webcam capture functionality
- File upload support (multiple formats)
- Secure storage in Supabase buckets

### 5. Admin Photo Gallery
- Wedding owner access to all uploaded photos
- Bulk download functionality
- Individual photo management
- Secure photo viewing with signed URLs

## Database Schema

### Tables

#### `weddings`
- `id` (uuid, primary key)
- `name` (text) - Wedding title
- `bride_name` (text)
- `groom_name` (text)
- `wedding_date` (date)
- `location` (text)
- `photo_password` (text)
- `owner_id` (uuid, foreign key to auth.users)
- `created_at` (timestamp)
- `updated_at` (timestamp)

#### `rsvps`
- `id` (uuid, primary key)
- `wedding_id` (uuid, foreign key to weddings)
- `guest_name` (text)
- `email` (text)
- `phone` (text, optional)
- `attending` (boolean)
- `dietary_restrictions` (text, optional)
- `song_request` (text, optional)
- `created_at` (timestamp)

#### `additional_guests`
- `id` (uuid, primary key)
- `rsvp_id` (uuid, foreign key to rsvps)
- `name` (text)
- `dietary_restrictions` (text, optional)
- `created_at` (timestamp)

#### `wedding_photos`
- `id` (uuid, primary key)
- `wedding_id` (uuid, foreign key to weddings)
- `file_name` (text)
- `file_path` (text)
- `uploaded_by` (text, optional)
- `created_at` (timestamp)

### Row Level Security (RLS) Policies
- Users can only access their own weddings
- Public access to RSVP pages via wedding ID
- Photo access restricted by password authentication

## Development Setup

### Prerequisites
- Node.js 18+ and npm
- Supabase account and project
- Git for version control

### Local Development

1. **Clone Repository**
```bash
git clone <repository-url>
cd weddings-pro
```

2. **Install Dependencies**
```bash
npm install
```

3. **Environment Configuration**
Create `.env.local`:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **Database Setup**
- Run the SQL schema in your Supabase project
- Configure RLS policies
- Set up storage bucket for photos

5. **Email Template Configuration**
- Configure Magic Link template in Supabase Dashboard
- Replace with OTP template using `{{ .Token }}` variable

6. **Start Development Server**
```bash
npm run dev
```

## Version Control Strategy

### Git Workflow

1. **Initialize Repository**
```bash
git init
git add .
git commit -m "Initial project setup"
```

2. **Branch Strategy**
- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/*` - Individual feature branches
- `hotfix/*` - Emergency fixes for production

3. **Feature Development Workflow**
```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes and commit
git add .
git commit -m "Add new feature: description"

# Push to remote
git push origin feature/new-feature

# Create pull request to develop branch
```

4. **Release Process**
```bash
# Merge develop to main for release
git checkout main
git merge develop
git tag v1.0.0
git push origin main --tags
```

### Commit Message Convention
```
type(scope): description

Types:
- feat: new feature
- fix: bug fix
- docs: documentation
- style: formatting changes
- refactor: code refactoring
- test: adding tests
- chore: maintenance tasks

Examples:
feat(auth): implement OTP authentication
fix(rsvp): resolve guest addition bug
docs(readme): update setup instructions
```

## Deployment Guide

### Production Environment Setup

#### 1. Supabase Production Configuration

**Database Migration**
```bash
# Export local schema
supabase db dump --local > schema.sql

# Import to production
# Apply via Supabase Dashboard SQL Editor
```

**Environment Variables**
- Update production Supabase URL and keys
- Configure proper redirect URLs for auth
- Set up email template for OTP authentication

**Storage Configuration**
```sql
-- Create storage bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('wedding-photos', 'wedding-photos', false);

-- Set up storage policies
CREATE POLICY "Users can upload wedding photos" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'wedding-photos');

CREATE POLICY "Users can view wedding photos with password" ON storage.objects
FOR SELECT USING (bucket_id = 'wedding-photos');
```

#### 2. Frontend Deployment (Vercel)

**Automatic Deployment**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
VITE_SUPABASE_URL=your_production_supabase_url
VITE_SUPABASE_ANON_KEY=your_production_anon_key
```

**vercel.json Configuration**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

#### 3. Alternative Deployment (Netlify)

**Build Configuration**
```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

## Testing Strategy

### Unit Testing
```bash
# Install testing dependencies
npm install --save-dev @testing-library/react @testing-library/jest-dom vitest

# Run tests
npm run test
```

### E2E Testing
```bash
# Install Cypress
npm install --save-dev cypress

# Run E2E tests
npm run cypress:open
```

### Test Coverage Areas
- Authentication flows (OTP, login, logout)
- RSVP form submission and validation
- Photo upload functionality
- Wedding management operations
- Responsive design testing

## Monitoring & Analytics

### Error Tracking
- Integrate Sentry for error monitoring
- Set up alerts for critical failures
- Monitor authentication issues

### Performance Monitoring
- Use Vercel Analytics for performance insights
- Monitor Core Web Vitals
- Track user engagement metrics

### Database Monitoring
- Monitor Supabase usage and performance
- Set up alerts for database queries
- Track storage usage for photos

## Security Considerations

### Authentication Security
- OTP-based authentication reduces password vulnerabilities
- Session management via Supabase Auth
- Secure token handling

### Data Protection
- Row Level Security (RLS) policies
- Password-protected photo access
- Input validation and sanitization

### Storage Security
- Private storage buckets
- Signed URLs for photo access
- File type validation for uploads

## Maintenance & Updates

### Regular Maintenance Tasks
- Update dependencies monthly
- Monitor security vulnerabilities
- Review and optimize database queries
- Clean up old photos and data

### Feature Enhancement Pipeline
- User feedback collection
- A/B testing for new features
- Performance optimization
- Mobile responsiveness improvements

## Support & Documentation

### User Guide
- Wedding setup instructions
- RSVP sharing guidelines
- Photo upload instructions
- Troubleshooting common issues

### API Documentation
- Supabase schema documentation
- Custom function documentation
- Integration guidelines

### Troubleshooting
- Common deployment issues
- Authentication problems
- Photo upload failures
- Database connection issues

## Future Enhancements

### Phase 2 Features
- Email notifications for RSVPs
- Wedding website templates
- Guest list import/export
- Analytics dashboard

### Phase 3 Features
- Mobile app development
- Social media integration
- Payment processing for gifts
- Advanced photo management

---

## Quick Commands Reference

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run preview         # Preview production build

# Deployment
vercel                  # Deploy to Vercel
netlify deploy          # Deploy to Netlify

# Version Control
git checkout -b feature/name  # Create feature branch
git push origin main --tags   # Push with tags

# Database
supabase start          # Start local Supabase
supabase db reset       # Reset local database
```

This PRD serves as the comprehensive guide for developing, deploying, and maintaining the WeddingsPro application.