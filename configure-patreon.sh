#!/bin/bash

echo "🔧 Configuring Patreon Credentials"
echo "=================================="
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "✅ .env file created"
else
    echo "✅ .env file already exists"
fi

echo ""
echo "🔐 Adding Patreon credentials to .env..."

# Add or update Patreon credentials
if grep -q "PATREON_CLIENT_ID=" .env; then
    # Update existing
    sed -i 's|PATREON_CLIENT_ID=.*|PATREON_CLIENT_ID=GhVd_dyhxHNkxgmYCAAjuP-9ohELe-aVI-BaxjeuQ3Shpo1NBEBrveQ9OHiKLDEe|' .env
    sed -i 's|PATREON_CLIENT_SECRET=.*|PATREON_CLIENT_SECRET=NiL8Ip6NzIeAcsIjZ-hk_61VRt9ONo0JVBvxZsJi2tQ-OUedCuRHKCJTgyoOFFJj|' .env
    sed -i 's|PATREON_REDIRECT_URI=.*|PATREON_REDIRECT_URI=http://localhost:5000/api/patreon/callback|' .env
    echo "✅ Updated existing Patreon credentials"
else
    # Append new
    echo "" >> .env
    echo "# Patreon OAuth Configuration" >> .env
    echo "PATREON_CLIENT_ID=GhVd_dyhxHNkxgmYCAAjuP-9ohELe-aVI-BaxjeuQ3Shpo1NBEBrveQ9OHiKLDEe" >> .env
    echo "PATREON_CLIENT_SECRET=NiL8Ip6NzIeAcsIjZ-hk_61VRt9ONo0JVBvxZsJi2tQ-OUedCuRHKCJTgyoOFFJj" >> .env
    echo "PATREON_REDIRECT_URI=http://localhost:5000/api/patreon/callback" >> .env
    echo "✅ Added Patreon credentials"
fi

echo ""
echo "📦 Running database migration..."
npx prisma migrate dev --name add_patreon_users

if [ $? -eq 0 ]; then
    echo "✅ Database migration completed"
else
    echo "❌ Database migration failed"
    echo "   Make sure your DATABASE_URL is configured correctly in .env"
    exit 1
fi

echo ""
echo "🔧 Generating Prisma client..."
npx prisma generate

if [ $? -eq 0 ]; then
    echo "✅ Prisma client generated"
else
    echo "❌ Prisma client generation failed"
    exit 1
fi

echo ""
echo "🎉 Configuration Complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Start the server: npm run dev"
echo "2. Test auth endpoint: curl http://localhost:5000/api/patreon/auth"
echo "3. Copy the authUrl and open in browser to test OAuth flow"
echo ""
echo "🔗 Your Patreon OAuth Callback URL:"
echo "   http://localhost:5000/api/patreon/callback"
echo ""
echo "⚠️  Make sure this URL is added to your Patreon app settings!"
echo "   https://www.patreon.com/portal/registration/register-clients"
echo ""
