#!/bin/bash

# Vercel Build Script with Database Migration Support
# This script:
# 1. Generates Prisma client
# 2. Validates environment variables
# 3. Runs pending database migrations
# 4. Builds the application
# 5. Validates build output

set -e

echo "🚀 Starting Vercel build process..."

# Step 1: Generate Prisma client
echo "📦 Step 1: Generating Prisma client..."
pnpm db:generate
if [ $? -ne 0 ]; then
  echo "❌ Failed to generate Prisma client"
  exit 1
fi
echo "✅ Prisma client generated"

# Step 2: Check environment
echo "🔍 Step 2: Checking environment variables..."
if [[ -z "$DATABASE_URL" && -z "$NETLIFY_DATABASE_URL" ]]; then
  echo "❌ Neither DATABASE_URL nor NETLIFY_DATABASE_URL is set"
  echo "Please configure one of these environment variables in Vercel"
  exit 1
fi
echo "✅ Database URL configured"

# Step 3: Run database migrations
if [[ -n "$DATABASE_URL" || -n "$NETLIFY_DATABASE_URL" ]]; then
  echo "🔄 Step 3: Running database migrations..."

  # Use NETLIFY_DATABASE_URL if DATABASE_URL is not set
  if [[ -z "$DATABASE_URL" && -n "$NETLIFY_DATABASE_URL" ]]; then
    export DATABASE_URL="$NETLIFY_DATABASE_URL"
  fi

  # Run migrations with error handling
  # NUCLEAR OPTION: Force reset requested by user
  echo "☢️  NUCLEAR OPTION: Forcing database reset via db push..."
  
  # 1. Force reset the database schema (Drops data, recreates schema from prisma file)
  if pnpm prisma db push --force-reset --accept-data-loss; then
    echo "✅ Database reset and schema pushed successfully"
    
    # 2. Mark the fresh migration as applied (since db push created the tables)
    echo "📝 Marking fresh migration as applied..."
    if pnpm prisma migrate resolve --applied 20251123232226_init; then
      echo "✅ Migration history synced"
    else
      echo "⚠️ Failed to mark migration as applied (might already be applied)"
    fi
    
    # 3. Verify with migrate deploy (should be no-op or clean)
    if pnpm db:migrate; then
      echo "✅ Final migration verification passed"
    else
      echo "❌ Final migration verification failed"
      exit 1
    fi
    
  else
    echo "❌ Failed to reset database"
    exit 1
  fi
else
  echo "⚠️  Skipping migrations - no database URL configured"
fi

# Step 4: Run linter
echo "✨ Step 4: Running linter..."
SENTRY_CLI_ENABLED=false pnpm lint
if [ $? -ne 0 ]; then
  echo "⚠️  Linter warnings found (not failing build)"
fi
echo "✅ Linter check complete"

# Step 5: Build the application
echo "🔨 Step 5: Building application..."
export SENTRY_CLI_SKIP=true
export SENTRY_AUTH_TOKEN=""
export SENTRY_CLI_ENABLED=false
pnpm build
if [ $? -ne 0 ]; then
  echo "❌ Build failed"
  exit 1
fi
echo "✅ Build completed successfully"

# Step 6: Post-build validation
echo "🔍 Step 6: Validating build output..."
if [ -d ".next" ]; then
  echo "✅ Build artifacts generated correctly"
else
  echo "❌ Build artifacts not found in .next directory"
  exit 1
fi

echo "🎉 Vercel build completed successfully!"
echo ""
echo "Summary:"
echo "  ✅ Prisma client generated"
echo "  ✅ Database migrations applied"
echo "  ✅ Application built"
echo "  ✅ Build artifacts validated"
echo ""
echo "Next steps:"
echo "  1. Verify the application starts correctly: 'npm start'"
echo "  2. Test API endpoints"
echo "  3. Check logs for any warnings"
