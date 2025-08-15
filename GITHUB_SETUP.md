# GitHub Repository Setup Guide

## Current Status
✅ **Local Git Repository Ready**
- Git repository initialized
- `main` branch with initial commit
- `development` branch with latest RSVP management features
- All code committed and ready for push

## Manual GitHub Setup (Recommended)

Since GitHub CLI requires installation, follow these manual steps:

### Step 1: Create GitHub Repository
1. Go to [https://github.com/new](https://github.com/new)
2. Repository name: `weddings-pro`
3. Description: `Professional wedding planning application with RSVP management and photo sharing`
4. Set to **Public** (or Private if preferred)
5. **Do NOT** initialize with README, .gitignore, or license (we already have these)
6. Click **Create repository**

### Step 2: Connect Local Repository to GitHub
After creating the repository, run these commands in your terminal:

```bash
# Add GitHub as remote origin
git remote add origin https://github.com/YOUR_USERNAME/weddings-pro.git

# Verify remote was added
git remote -v

# Push main branch to GitHub
git push -u origin main

# Push development branch to GitHub
git push -u origin development
```

### Step 3: Set Development as Default Branch (Optional)
If you want `development` to be the default branch for new PRs:

1. Go to your repository on GitHub
2. Click **Settings** tab
3. Click **Branches** in left sidebar
4. Under "Default branch", click the pencil icon
5. Select `development` from dropdown
6. Click **Update**

## Alternative: GitHub CLI Installation

If you want to install GitHub CLI for future use:

### macOS (with Homebrew)
```bash
# Install Homebrew if not installed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install GitHub CLI
brew install gh

# Authenticate with GitHub
gh auth login

# Create repository
gh repo create weddings-pro --public --description "Professional wedding planning application with RSVP management and photo sharing"

# Push code
git push -u origin main
git push -u origin development
```

### macOS (Direct Download)
```bash
# Download latest release
curl -L https://github.com/cli/cli/releases/latest/download/gh_$(uname -s)_$(uname -m).tar.gz -o gh.tar.gz

# Extract and install
tar -xzf gh.tar.gz
sudo cp gh_*/bin/gh /usr/local/bin/

# Verify installation
gh --version
```

## Repository Structure

```
weddings-pro/
├── main branch          # Production-ready code
│   ├── Initial commit   # Complete wedding app v1.0
│   └── Deployment docs  # Setup instructions
└── development branch   # Latest features
    └── RSVP management  # New RSVP tracking feature
```

## Branch Workflow

### Development Process
1. **Feature Development**: Create feature branches from `development`
2. **Testing**: Test features locally and on development environment
3. **Pull Requests**: Create PRs to merge features into `development`
4. **Release**: Merge `development` into `main` for production releases

### Commands for Daily Development
```bash
# Switch to development branch
git checkout development

# Create new feature branch
git checkout -b feature/new-feature-name

# After completing feature
git add .
git commit -m "Add new feature"
git push -u origin feature/new-feature-name

# Create PR via GitHub web interface
# After PR approval, merge and delete feature branch
```

## Next Steps After GitHub Setup

1. **Environment Variables**: Set up GitHub Secrets for deployment
2. **GitHub Actions**: Configure CI/CD pipeline (optional)
3. **Issues and Project Management**: Use GitHub Issues for bug tracking
4. **Collaboration**: Invite collaborators if working with a team

## Deployment Integration

Once GitHub is set up, you can deploy to:
- **Vercel**: Connect GitHub repo for automatic deployments
- **Netlify**: Connect GitHub repo for automatic deployments  
- **GitHub Pages**: Use for static hosting (if applicable)

## Repository Features

✅ **Current Features in Repository**
- Complete wedding planning application
- OTP-based authentication system
- RSVP management with guest tracking
- Photo upload and webcam capture
- Admin photo gallery
- Responsive design with Tailwind CSS
- Supabase backend integration
- RSVP statistics and guest management

The application is production-ready and can be deployed immediately after GitHub setup!