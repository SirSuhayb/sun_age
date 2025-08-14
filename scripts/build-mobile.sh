#!/bin/bash

set -e

echo "🚀 Building Solara for iOS..."

# Check if required tools are installed
if ! command -v npx &> /dev/null; then
    echo "❌ npm/npx is required but not installed."
    exit 1
fi

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf .next out ios/App/App/public

# Create a temporary env file for mobile build
echo "⚙️ Setting up mobile environment..."
cp .env.local .env.mobile.backup 2>/dev/null || true
echo "NEXT_OUTPUT_MODE=export" >> .env.local
echo "NEXT_PUBLIC_IS_MOBILE=true" >> .env.local

# Backup API routes and problematic dynamic routes
echo "📦 Preparing for static build..."
if [ -d "src/app/api" ]; then
    cp -r src/app/api /tmp/api-backup
    rm -rf src/app/api
fi

# Temporarily move problematic dynamic routes
rm -rf /tmp/dynamic-routes-backup
mkdir -p /tmp/dynamic-routes-backup
if [ -d "src/app/share" ]; then
    mv src/app/share /tmp/dynamic-routes-backup/
fi
if [ -d "src/app/journal/shared" ]; then
    mkdir -p /tmp/dynamic-routes-backup/journal
    mv src/app/journal/shared /tmp/dynamic-routes-backup/journal/
fi
if [ -d "src/app/surprise-me/guidance" ]; then
    mkdir -p /tmp/dynamic-routes-backup/surprise-me
    mv src/app/surprise-me/guidance /tmp/dynamic-routes-backup/surprise-me/
fi
if [ -d "src/app/solage/shared" ]; then
    mkdir -p /tmp/dynamic-routes-backup/solage
    mv src/app/solage/shared /tmp/dynamic-routes-backup/solage/
fi
if [ -d "src/app/.well-known" ]; then
    mv src/app/.well-known /tmp/dynamic-routes-backup/
fi

# Temporarily move the main page that uses server-side features
if [ -f "src/app/page.tsx" ]; then
    mv src/app/page.tsx /tmp/dynamic-routes-backup/page.tsx.backup
fi

# Build for static export with mobile config
echo "🔨 Building Next.js static export..."
cp next.config.mobile.js next.config.js.mobile-temp
mv next.config.js next.config.js.backup
mv next.config.js.mobile-temp next.config.js
npm run build

# Restore original config and routes
mv next.config.js.backup next.config.js

# Restore API routes
if [ -d "/tmp/api-backup" ]; then
    mv /tmp/api-backup src/app/api
fi

# Restore dynamic routes
if [ -d "/tmp/dynamic-routes-backup/share" ]; then
    mv /tmp/dynamic-routes-backup/share src/app/
fi
if [ -d "/tmp/dynamic-routes-backup/journal/shared" ]; then
    mkdir -p src/app/journal
    mv /tmp/dynamic-routes-backup/journal/shared src/app/journal/
fi
if [ -d "/tmp/dynamic-routes-backup/surprise-me/guidance" ]; then
    mkdir -p src/app/surprise-me
    mv /tmp/dynamic-routes-backup/surprise-me/guidance src/app/surprise-me/
fi
if [ -d "/tmp/dynamic-routes-backup/solage/shared" ]; then
    mkdir -p src/app/solage
    mv /tmp/dynamic-routes-backup/solage/shared src/app/solage/
fi
if [ -d "/tmp/dynamic-routes-backup/.well-known" ]; then
    mv /tmp/dynamic-routes-backup/.well-known src/app/
fi

# Restore the main page
if [ -f "/tmp/dynamic-routes-backup/page.tsx.backup" ]; then
    mv /tmp/dynamic-routes-backup/page.tsx.backup src/app/page.tsx
fi

rm -rf /tmp/dynamic-routes-backup

# Sync with Capacitor
echo "📱 Syncing with Capacitor..."
npx cap sync ios

echo "✅ Mobile build completed successfully!"
echo ""
echo "Next steps:"
echo "1. Open Xcode: pnpm cap:open:ios"
echo "2. Configure signing & capabilities"
echo "3. Set app icons and launch screens"
echo "4. Archive and upload to TestFlight"

# Restore original env file
if [ -f ".env.mobile.backup" ]; then
    mv .env.mobile.backup .env.local
fi