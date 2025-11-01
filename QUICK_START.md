# 🚀 Patreon Integration - Quick Start Guide

## TL;DR - Get Running in 5 Minutes

### Prerequisites
- Node.js installed
- MySQL database running
- Patreon account

---

## Step 1: Get Patreon Credentials (2 minutes)

1. Go to: https://www.patreon.com/portal/registration/register-clients
2. Click **"Create Client"**
3. Fill in:
   - **App Name**: Your app name
   - **Redirect URI**: `http://localhost:5000/api/patreon/callback`
4. Save and copy:
   - **Client ID**
   - **Client Secret**

---

## Step 2: Configure Backend (1 minute)

```bash
# Copy environment template
cp .env.example .env

# Edit .env and add your Patreon credentials:
nano .env  # or use any text editor
```

Update these lines in `.env`:
```env
PATREON_CLIENT_ID=paste_your_client_id_here
PATREON_CLIENT_SECRET=paste_your_client_secret_here
PATREON_REDIRECT_URI=http://localhost:5000/api/patreon/callback
```

---

## Step 3: Setup Database (1 minute)

```bash
# Run the setup script (does everything automatically)
./setup-patreon.sh

# OR manually:
npx prisma migrate dev --name add_patreon_users
npx prisma generate
```

---

## Step 4: Start Server (10 seconds)

```bash
npm run dev
```

Server starts at: `http://localhost:5000`

---

## Step 5: Test It Works (1 minute)

### Test 1: Get Auth URL
```bash
curl http://localhost:5000/api/patreon/auth
```

You should see:
```json
{
  "status": "success",
  "data": {
    "authUrl": "https://www.patreon.com/oauth2/authorize?..."
  }
}
```

### Test 2: Complete OAuth Flow

1. Copy the `authUrl` from the response above
2. Paste it in your browser
3. Login and authorize your app
4. You'll be redirected to: `http://localhost:5000/api/patreon/callback?code=XXX`
5. You should see a JSON response with your token:

```json
{
  "status": "success",
  "message": "Successfully authenticated with Patreon",
  "data": {
    "user": {
      "id": 1,
      "email": "your@email.com",
      "membershipTier": "premium",
      "isActivePatron": true
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Test 3: Access Protected Content

Copy the token from above and test:

```bash
curl -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  http://localhost:5000/api/protected/premium-content
```

You should see:
```json
{
  "status": "success",
  "message": "Welcome to premium content!",
  "data": {
    "user": { ... },
    "content": "This is exclusive content for Patreon supporters."
  }
}
```

---

## ✅ Backend is Ready!

Your backend is now fully functional. All API endpoints are working:

### Available Endpoints:

**Public:**
- `GET /api/patreon/auth` - Get authorization URL
- `GET /api/patreon/callback` - OAuth callback

**Protected (Patreon Token Required):**
- `GET /api/patreon/verify` - Verify patron status
- `GET /api/patreon/me` - Get current user
- `GET /api/protected/premium-content` - Example content
- `GET /api/protected/premium-only` - Premium tier only
- `GET /api/protected/standard-plus` - Standard+ tier

**Admin (Admin Token Required):**
- `GET /api/patreon/users` - List all users
- `GET /api/patreon/users/:id` - Get user details
- `POST /api/patreon/users/:id/revoke` - Revoke access

---

## 📱 Now Build Your Frontend

### Minimum Frontend Requirements:

1. **Login Page** - Button that redirects to Patreon
2. **Callback Page** - Handles OAuth redirect and stores token
3. **Protected Routes** - Check token before rendering
4. **API Calls** - Include token in Authorization header

### Quick Frontend Example (React):

```jsx
// 1. Login Button
const handleLogin = async () => {
  const res = await fetch('http://localhost:5000/api/patreon/auth');
  const data = await res.json();
  window.location.href = data.data.authUrl;
};

// 2. Callback Handler
useEffect(() => {
  const code = new URLSearchParams(window.location.search).get('code');
  if (code) {
    fetch(`http://localhost:5000/api/patreon/callback?code=${code}`)
      .then(res => res.json())
      .then(data => {
        localStorage.setItem('token', data.data.token);
        window.location.href = '/dashboard';
      });
  }
}, []);

// 3. Protected API Call
const fetchContent = async () => {
  const token = localStorage.getItem('token');
  const res = await fetch('http://localhost:5000/api/protected/premium-content', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return res.json();
};
```

---

## 📚 Full Documentation

For complete details, see:

| File | What's Inside |
|------|---------------|
| **IMPLEMENTATION_SUMMARY.md** | Complete overview of what was built |
| **PATREON_SETUP.md** | Detailed backend setup and API docs |
| **FRONTEND_INTEGRATION.md** | Complete frontend code examples |
| **PATREON_FLOW_DIAGRAM.md** | Visual flow diagrams |
| **PATREON_README.md** | Quick reference summary |

---

## 🎯 What's Next?

### For User Frontend:
1. Create login page with Patreon button
2. Create callback page at `/patreon/callback` route
3. Create protected route wrapper component
4. Add API integration with Authorization headers
5. Handle errors (expired token, inactive patron)

### For Admin Frontend (Optional):
1. Create admin dashboard
2. List all Patreon users
3. View subscription details
4. Add revoke access button

---

## 🆘 Troubleshooting

### "Invalid redirect URI"
→ Make sure redirect URI in Patreon app matches `.env` exactly

### "You must be an active patron"
→ User needs to subscribe on Patreon first before logging in

### "Token expired"
→ System auto-refreshes tokens, user may need to re-login

### "Connection refused"
→ Make sure server is running: `npm run dev`

### "Prisma error"
→ Run migration: `npx prisma migrate dev`

---

## 💡 Pro Tips

1. **Test with your own Patreon account** - Subscribe to your own page to test
2. **Use different tiers** - Test with different pledge amounts
3. **Check token in JWT.io** - Decode your token to see what's inside
4. **Monitor console logs** - Backend logs all OAuth steps
5. **Use Postman** - Test API endpoints easily

---

## 🎉 You're Done!

Backend is ready. Now build your frontend and start accepting Patreon subscribers!

**Need help?** Read the full documentation files listed above.

---

**Happy coding! 🚀**
