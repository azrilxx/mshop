
#!/bin/bash

echo "🚀 Initializing Git repository for Muvex Marketplace..."

# Initialize git if not already done
if [ ! -d ".git" ]; then
  git init
  echo "✅ Git repository initialized"
else
  echo "✅ Git repository already exists"
fi

# Create .gitignore if it doesn't exist
if [ ! -f ".gitignore" ]; then
  cat > .gitignore << EOF
# Dependencies
node_modules/
.npm/

# Next.js
.next/
out/

# Environment files
.env.local
.env.production
.env

# Logs
*.log
npm-debug.log*

# Runtime data
pids/
*.pid
*.seed

# IDE files
.vscode/
.idea/

# OS files
.DS_Store
Thumbs.db

# Replit specific
.replit_zip_error_log
EOF
  echo "✅ .gitignore created"
fi

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Multi-tenant B2B marketplace with tenant isolation"

echo "✅ Initial commit created"
echo "📋 Next steps:"
echo "1. Create a new repository on GitHub"
echo "2. Run: git remote add origin https://github.com/YOUR_USERNAME/muvex-marketplace.git"
echo "3. Run: git push -u origin main"
