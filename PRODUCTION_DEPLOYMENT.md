# 🚀 Production Deployment Checklist

## ✅ Pre-Deployment Changes

### 1. Update Environment Variables

Create a production `.env` file with these values:

```env
# Server Configuration
MODE=prod
PROD_PORT=5000
PROD_HOST=0.0.0.0

# Database - UPDATE THESE!
DATABASE_URL="your_production_mysql_url"
SHADOW_DATABASE_URL="your_production_shadow_db_url"

# JWT Secret (keep the same or generate a new one)
JWT_SECRET=nighthawk_patreon_jwt_secret_2024_a8f5f167f44f4964e6c998dee827110c

# Patreon OAuth - UPDATE REDIRECT URI!
PATREON_CLIENT_ID=Oy_RGe4kzJB4Jm-vnctuGfHfkO7R5cxSqlG2oEpvLReK9HeNJjs_kDOuQxM7E9TB
PATREON_CLIENT_SECRET=utSFewb_6YE-tFvny3Tr7fD0P2tpAzOo_l08P6VkCNjqv4g2suZk1U-rLYln6JyC
PATREON_REDIRECT_URI=https://yourdomain.com/api/patreon/callback
PATREON_CAMPAIGN_ID=12290092

# Frontend URL - UPDATE THIS!
FRONTEND_URL=https://your-frontend-domain.com
```

### 2. Update Patreon OAuth Settings

1. Go to: https://www.patreon.com/portal/registration/register-clients
2. Click "Edit Client" on your OAuth app
3. **Add production redirect URI**: `https://yourdomain.com/api/patreon/callback`
4. Click "Update Client"

⚠️ **Important**: Keep both localhost and production URIs for testing!

---

## 🔒 Security Checklist

### ✅ Already Configured:
- ✅ CORS restricted to frontend domain in production
- ✅ JWT tokens with 7-day expiry
- ✅ Patron verification required in production mode
- ✅ Environment variables for sensitive data

### ⚠️ Additional Security (Recommended):

1. **Use HTTPS** - Required for production!
   - Get SSL certificate (Let's Encrypt, Cloudflare, etc.)
   - Patreon OAuth requires HTTPS in production

2. **Rate Limiting** (Optional but recommended):
   ```bash
   npm install express-rate-limit
   ```

3. **Helmet.js** for security headers:
   ```bash
   npm install helmet
   ```

4. **Environment Variables**:
   - Never commit `.env` to git (already in `.gitignore`)
   - Use your hosting platform's environment variable system

---

## 📦 Deployment Steps

### Option 1: Deploy to VPS (DigitalOcean, AWS, etc.)

```bash
# 1. SSH into your server
ssh user@your-server-ip

# 2. Clone your repository
git clone your-repo-url
cd nighthawk-server

# 3. Install dependencies
npm install

# 4. Set up environment variables
nano .env
# Paste your production .env content

# 5. Run database migrations (if using Prisma)
npx prisma migrate deploy
npx prisma generate

# 6. Start with PM2 (process manager)
npm install -g pm2
pm2 start src/server.mjs --name nighthawk-api
pm2 save
pm2 startup
```

### Option 2: Deploy to Heroku

```bash
# 1. Install Heroku CLI
# 2. Login
heroku login

# 3. Create app
heroku create your-app-name

# 4. Set environment variables
heroku config:set MODE=prod
heroku config:set PATREON_CLIENT_ID=your_id
heroku config:set PATREON_CLIENT_SECRET=your_secret
heroku config:set PATREON_REDIRECT_URI=https://your-app.herokuapp.com/api/patreon/callback
heroku config:set PATREON_CAMPAIGN_ID=12290092
heroku config:set FRONTEND_URL=https://your-frontend.com
heroku config:set JWT_SECRET=your_jwt_secret
heroku config:set DATABASE_URL=your_db_url

# 5. Deploy
git push heroku main
```

### Option 3: Deploy to Railway/Render

1. Connect your GitHub repository
2. Add environment variables in the dashboard
3. Deploy automatically on push

---

## 🧪 Testing Production Setup

### 1. Test OAuth Flow

```bash
# Get OAuth URL
curl https://yourdomain.com/api/patreon/auth

# Open the URL in browser
# Click "Allow" on Patreon
# Should redirect to your frontend with token
```

### 2. Test Protected Endpoint

```bash
# Use the JWT token from OAuth
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  https://yourdomain.com/api/patreon/me
```

### 3. Test Download Check

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  https://yourdomain.com/api/patreon/check-download/123
```

---

## ⚠️ Important Production Notes

### Patron Verification

In production (`MODE=prod`), the system will:
- ✅ **Require active patron status** for all protected endpoints
- ✅ **Verify campaign membership** (only YOUR patrons can access)
- ✅ **Check patron status on every download**

### Development vs Production Behavior

| Feature | Development (MODE=dev) | Production (MODE=prod) |
|---------|----------------------|----------------------|
| **Patron Check** | ❌ Disabled (allows non-patrons) | ✅ Enabled (requires active patron) |
| **CORS** | `*` (all origins) | Restricted to `FRONTEND_URL` |
| **Logging** | Verbose | Minimal |

---

## 🔄 Post-Deployment

### 1. Monitor Logs

```bash
# If using PM2
pm2 logs nighthawk-api

# If using Heroku
heroku logs --tail

# If using Railway/Render
# Check logs in dashboard
```

### 2. Test with Real Patron

1. Become a patron of your own campaign (or have someone test)
2. Go through OAuth flow
3. Verify they can download

### 3. Update Frontend

Make sure your frontend uses the production API URL:
```javascript
const API_URL = 'https://yourdomain.com/api';
```

---

## 🐛 Troubleshooting

### "Failed to exchange authorization code"
- ✅ Check `PATREON_REDIRECT_URI` matches exactly in Patreon dashboard
- ✅ Verify you're using HTTPS in production

### "CORS error"
- ✅ Check `FRONTEND_URL` in `.env` matches your frontend domain
- ✅ Make sure `MODE=prod` is set

### "You must be an active patron"
- ✅ This is correct behavior in production!
- ✅ User must be an active patron of YOUR campaign
- ✅ Check `PATREON_CAMPAIGN_ID` is correct

### "Token expired"
- ✅ JWT tokens expire after 7 days
- ✅ User needs to login again
- ✅ Implement refresh token logic if needed

---

## 📊 Monitoring (Optional)

Consider adding:
- **Error tracking**: Sentry, Rollbar
- **Analytics**: Google Analytics, Mixpanel
- **Uptime monitoring**: UptimeRobot, Pingdom
- **Performance**: New Relic, Datadog

---

## 🎉 You're Ready!

Your Patreon integration is production-ready. Just:

1. ✅ Update `.env` with production values
2. ✅ Add production redirect URI to Patreon
3. ✅ Deploy to your hosting platform
4. ✅ Test the OAuth flow
5. ✅ Launch! 🚀

**Need help?** Check the logs and refer to `PATREON_IMPLEMENTATION_GUIDE.md` for detailed API documentation.
