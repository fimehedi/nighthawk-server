# 🚀 Patreon Integration - Quick Start

## ✅ What's Been Fixed

Your backend Patreon integration had several issues that are now **completely fixed**:

1. ❌ **OAuth token exchange was failing** → ✅ Fixed to use proper `x-www-form-urlencoded` format
2. ❌ **Not verifying campaign membership** → ✅ Now verifies users are patrons of YOUR specific campaign
3. ❌ **Missing campaign data in API calls** → ✅ Updated to fetch campaign relationships
4. ❌ **Refresh token not working** → ✅ Fixed format
5. ❌ **No frontend integration** → ✅ Added automatic redirect with JWT token

---

## 📋 Backend Setup (3 Steps)

### Step 1: Update Your `.env` File

Copy `.env.example` to `.env` and fill in these values:

```bash
# Required - Get from https://www.patreon.com/portal/registration/register-clients
PATREON_CLIENT_ID=your_client_id
PATREON_CLIENT_SECRET=your_client_secret
PATREON_REDIRECT_URI=http://localhost:5000/api/patreon/callback

# Required - Your Patreon Campaign ID (see below how to find it)
PATREON_CAMPAIGN_ID=12345678

# Required - Your Next.js frontend URL
FRONTEND_URL=http://localhost:3000

# Required - JWT Secret (generate a random string)
JWT_SECRET=your_random_secret_key_here
```

### Step 2: Get Your Campaign ID

1. Go to https://www.patreon.com/portal/registration/register-clients
2. Click on your OAuth client
3. Look for "Campaign ID" on that page
4. Copy it to your `.env` file

### Step 3: Start Your Server

```bash
npm start
```

That's it! Your backend is ready. ✅

---

## 🎨 Frontend Setup (Next.js)

### The Flow

1. User clicks "Download" button
2. If not logged in → Redirect to Patreon OAuth
3. User authorizes on Patreon
4. Backend verifies they're an active patron of YOUR campaign
5. Backend redirects to: `http://localhost:3000/auth/patreon/callback?token=JWT_TOKEN&success=true`
6. Frontend stores the JWT token
7. User can now download (backend verifies token + active patron status)

### Implementation

See `PATREON_IMPLEMENTATION_GUIDE.md` for complete frontend code including:
- React Context for auth state
- Callback page to handle OAuth redirect
- Download page with Patreon gate
- User profile component

---

## 🧪 Test Your Backend

### Test 1: Get OAuth URL
```bash
curl http://localhost:5000/api/patreon/auth
```

Should return an authorization URL.

### Test 2: Complete OAuth Flow
1. Open the URL from Test 1 in your browser
2. Login and authorize on Patreon
3. You'll be redirected to your frontend with a token

### Test 3: Verify Token
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:5000/api/patreon/me
```

Should return your user data.

### Test 4: Check Download Eligibility
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:5000/api/patreon/check-download/123
```

Should return `canDownload: true` if you're an active patron.

---

## 📊 API Endpoints Summary

| Endpoint | Auth | Purpose |
|----------|------|---------|
| `GET /api/patreon/auth` | Public | Get OAuth URL |
| `GET /api/patreon/callback` | Public | OAuth callback (auto-redirects) |
| `GET /api/patreon/verify` | JWT | Verify patron status |
| `GET /api/patreon/me` | JWT | Get current user info |
| `GET /api/patreon/check-download/:id` | JWT | Check download eligibility |

---

## 🔐 How It Works

### Membership Verification

The backend now properly verifies:
1. ✅ User has a valid Patreon account
2. ✅ User is an active patron (not declined/cancelled)
3. ✅ User is a patron of YOUR specific campaign (not someone else's)
4. ✅ User's pledge is active and current

### Membership Tiers

Automatically assigned based on pledge amount:
- **Basic**: $1-4.99/month
- **Standard**: $5-9.99/month
- **Premium**: $10+/month

You can customize these in `src/modules/patreon/patreon.service.mjs` lines 109-115.

---

## 🐛 Common Issues

### "Authorization code is required"
- Check `PATREON_REDIRECT_URI` matches exactly in Patreon dashboard and `.env`

### "Failed to exchange authorization code"  
- Verify `PATREON_CLIENT_ID` and `PATREON_CLIENT_SECRET` are correct

### "You must be an active patron"
- Check `PATREON_CAMPAIGN_ID` is correct
- Make sure you're actually a patron of that campaign
- Verify your pledge is active on Patreon

### CORS errors from frontend
- Add CORS middleware to your Express app if not already present
- Allow your frontend domain in CORS config

---

## 📁 Files Modified

- ✅ `src/modules/patreon/patreon.service.mjs` - Core logic fixed
- ✅ `src/modules/patreon/patreon.controller.mjs` - Added redirect & download check
- ✅ `src/routes/api/patreon.route.mjs` - Added download route
- ✅ `src/config/config.mjs` - Added campaign ID & frontend URL
- ✅ `.env.example` - Updated with new variables

---

## 🎯 Next Steps

1. ✅ Configure your `.env` file
2. ✅ Test the OAuth flow manually
3. ✅ Implement frontend using the guide
4. ✅ Test end-to-end with a real Patreon account
5. ✅ Deploy to production

---

## 📖 Full Documentation

For complete frontend implementation code and detailed explanations, see:
- `PATREON_IMPLEMENTATION_GUIDE.md` - Complete guide with React code

---

## 💡 Tips

- **Development**: Use your own Patreon account to test
- **Testing**: You can create a test campaign with $1 tier
- **Security**: JWT tokens expire after 7 days (configurable in service)
- **Production**: Use HTTPS for both frontend and backend

---

**Your backend is now production-ready!** 🎉

Just configure your `.env` file and implement the frontend using the provided code.
