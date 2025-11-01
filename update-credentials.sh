#!/bin/bash

echo "🔄 Updating Patreon Credentials"
echo "================================"
echo ""
echo "App Name: Sketch Shaper"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    echo "📝 Creating .env from template..."
    cp .env.example .env
    echo "✅ .env file created"
fi

echo "🔐 Updating Patreon credentials in .env..."

# Update Patreon credentials
if grep -q "PATREON_CLIENT_ID=" .env; then
    # Update existing
    sed -i 's|PATREON_CLIENT_ID=.*|PATREON_CLIENT_ID=Oy_RGe4kzJB4Jm-vnctuGfHfkO7R5cxSqlG2oEpvLReK9HeNJjs_kDOuQwM769TB|' .env
    sed -i 's|PATREON_CLIENT_SECRET=.*|PATREON_CLIENT_SECRET=utSFewb_6YE-tFvny3Tr7fD0P2tpAzOo_l08P6VkCNjqv4g2suZk1U-rLYln6JyC|' .env
    sed -i 's|PATREON_REDIRECT_URI=.*|PATREON_REDIRECT_URI=http://localhost:5000/api/patreon/callback|' .env
    echo "✅ Updated existing Patreon credentials"
else
    # Append new
    echo "" >> .env
    echo "# Patreon OAuth Configuration" >> .env
    echo "PATREON_CLIENT_ID=Oy_RGe4kzJB4Jm-vnctuGfHfkO7R5cxSqlG2oEpvLReK9HeNJjs_kDOuQwM769TB" >> .env
    echo "PATREON_CLIENT_SECRET=utSFewb_6YE-tFvny3Tr7fD0P2tpAzOo_l08P6VkCNjqv4g2suZk1U-rLYln6JyC" >> .env
    echo "PATREON_REDIRECT_URI=http://localhost:5000/api/patreon/callback" >> .env
    echo "✅ Added Patreon credentials"
fi

echo ""
echo "🎉 Credentials Updated!"
echo ""
echo "📋 Your New Credentials:"
echo "   App Name: Sketch Shaper"
echo "   Client ID: Oy_RGe4kzJB4Jm-vnctuGfHfkO7R5cxSqlG2oEpvLReK9HeNJjs_kDOuQwM769TB"
echo "   Redirect URI: http://localhost:5000/api/patreon/callback"
echo ""
echo "⚠️  IMPORTANT: Make sure this redirect URI is added to your Patreon app:"
echo "   https://www.patreon.com/portal/registration/register-clients"
echo ""
echo "🔗 Next Steps:"
echo "1. Restart your server if it's running"
echo "2. Test: curl http://localhost:5000/api/patreon/auth"
echo ""
