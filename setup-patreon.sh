#!/bin/bash

echo "🚀 Patreon Integration Setup Script"
echo "===================================="
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    echo "📝 Creating .env from .env.example..."
    cp .env.example .env
    echo "✅ .env file created"
    echo ""
    echo "⚠️  IMPORTANT: Edit .env and add your Patreon credentials:"
    echo "   - PATREON_CLIENT_ID"
    echo "   - PATREON_CLIENT_SECRET"
    echo "   - PATREON_REDIRECT_URI"
    echo ""
    echo "Get credentials from: https://www.patreon.com/portal/registration/register-clients"
    echo ""
    read -p "Press Enter after updating .env file..."
fi

# Check if Patreon credentials are set
source .env
if [ -z "$PATREON_CLIENT_ID" ] || [ "$PATREON_CLIENT_ID" = "your_patreon_client_id_here" ]; then
    echo "⚠️  WARNING: PATREON_CLIENT_ID not set in .env"
    echo "Please update .env with your Patreon credentials"
    exit 1
fi

echo "✅ Environment variables configured"
echo ""

# Run Prisma migration
echo "📦 Running database migration..."
npx prisma migrate dev --name add_patreon_users

if [ $? -eq 0 ]; then
    echo "✅ Database migration completed"
else
    echo "❌ Database migration failed"
    exit 1
fi

echo ""

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

if [ $? -eq 0 ]; then
    echo "✅ Prisma client generated"
else
    echo "❌ Prisma client generation failed"
    exit 1
fi

echo ""
echo "🎉 Setup Complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Start the server: npm run dev"
echo "2. Test auth endpoint: curl http://localhost:5000/api/patreon/auth"
echo "3. Read PATREON_SETUP.md for detailed documentation"
echo "4. Read FRONTEND_INTEGRATION.md for frontend examples"
echo ""
echo "🔗 API Endpoints:"
echo "   - GET  /api/patreon/auth"
echo "   - GET  /api/patreon/callback"
echo "   - GET  /api/patreon/verify (protected)"
echo "   - GET  /api/patreon/me (protected)"
echo "   - GET  /api/protected/premium-content (protected)"
echo ""
