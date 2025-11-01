# Patreon Payment Integration Guide

## Backend Implementation Summary

### ✅ What I Fixed in Your Backend

1. **OAuth Token Exchange** - Fixed the token request format to use proper `x-www-form-urlencoded` format
2. **Identity API Call** - Updated to include campaign relationships for proper membership verification
3. **Campaign Verification** - Added logic to verify users are patrons of YOUR specific campaign
4. **Refresh Token** - Fixed refresh token request format
5. **Frontend Redirect** - Added automatic redirect to frontend after successful OAuth
6. **Download Authorization** - Added endpoint to check if user can download

### 📁 Files Modified

- `src/modules/patreon/patreon.service.mjs` - Core OAuth and verification logic
- `src/modules/patreon/patreon.controller.mjs` - Added callback redirect and download check
- `src/routes/api/patreon.route.mjs` - Added download eligibility route
- `src/config/config.mjs` - Added `PATREON_CAMPAIGN_ID` and `FRONTEND_URL`

---

## 🔧 Backend Configuration

### 1. Update Your `.env` File

Add these environment variables:

```env
# Existing Patreon credentials
PATREON_CLIENT_ID=your_client_id_here
PATREON_CLIENT_SECRET=your_client_secret_here
PATREON_REDIRECT_URI=http://localhost:5000/api/patreon/callback

# NEW: Add these
PATREON_CAMPAIGN_ID=your_campaign_id_here
FRONTEND_URL=http://localhost:3000

# JWT Secret (if not already set)
JWT_SECRET=your_super_secret_jwt_key_here
```

### 2. Get Your Patreon Campaign ID

1. Go to https://www.patreon.com/portal/registration/register-clients
2. Click on your registered OAuth client
3. Your Campaign ID is shown on that page
4. Copy it to your `.env` file

---

## 🔄 Backend API Endpoints

### Public Endpoints

#### 1. Get OAuth URL
```
GET /api/patreon/auth?intent=login
```

**Response:**
```json
{
  "status": "success",
  "code": 200,
  "message": "Authorization URL generated",
  "data": {
    "authUrl": "https://www.patreon.com/oauth2/authorize?..."
  }
}
```

#### 2. OAuth Callback (Automatic)
```
GET /api/patreon/callback?code=xxx
```

**Behavior:**
- If `FRONTEND_URL` is set: Redirects to `{FRONTEND_URL}/auth/patreon/callback?token={JWT}&success=true`
- Otherwise: Returns JSON with user data and token

---

### Protected Endpoints (Require JWT Token)

#### 3. Verify Patron Status
```
GET /api/patreon/verify
Headers: Authorization: Bearer {JWT_TOKEN}
```

**Response:**
```json
{
  "status": "success",
  "code": 200,
  "message": "Patron status verified",
  "data": {
    "isActivePatron": true
  }
}
```

#### 4. Get Current User
```
GET /api/patreon/me
Headers: Authorization: Bearer {JWT_TOKEN}
```

**Response:**
```json
{
  "status": "success",
  "code": 200,
  "data": {
    "id": 1,
    "email": "user@example.com",
    "full_name": "John Doe",
    "membership_tier": "premium",
    "is_active_patron": true,
    "pledge_amount": 10.00
  }
}
```

#### 5. Check Download Eligibility
```
GET /api/patreon/check-download/:assetId
Headers: Authorization: Bearer {JWT_TOKEN}
```

**Response:**
```json
{
  "status": "success",
  "code": 200,
  "message": "Download authorized",
  "data": {
    "canDownload": true,
    "assetId": "123",
    "membershipTier": "premium"
  }
}
```

---

## 🎨 Frontend Implementation (Next.js)

### Step 1: Create Patreon Auth Context

Create `contexts/PatreonAuthContext.js`:

```javascript
'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const PatreonAuthContext = createContext();

export function PatreonAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is already logged in
    const storedToken = localStorage.getItem('patreon_token');
    if (storedToken) {
      setToken(storedToken);
      fetchUserData(storedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserData = async (authToken) => {
    try {
      const response = await fetch('http://localhost:5000/api/patreon/me', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUser(data.data);
      } else {
        // Token invalid, clear it
        logout();
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = () => {
    // Redirect to backend OAuth URL
    window.location.href = 'http://localhost:5000/api/patreon/auth?intent=login';
  };

  const handleCallback = (jwtToken) => {
    localStorage.setItem('patreon_token', jwtToken);
    setToken(jwtToken);
    fetchUserData(jwtToken);
  };

  const logout = () => {
    localStorage.removeItem('patreon_token');
    setToken(null);
    setUser(null);
  };

  const checkDownloadEligibility = async (assetId) => {
    if (!token) return false;
    
    try {
      const response = await fetch(
        `http://localhost:5000/api/patreon/check-download/${assetId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      const data = await response.json();
      return data.data?.canDownload || false;
    } catch (error) {
      console.error('Error checking download eligibility:', error);
      return false;
    }
  };

  return (
    <PatreonAuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        login,
        logout,
        handleCallback,
        checkDownloadEligibility
      }}
    >
      {children}
    </PatreonAuthContext.Provider>
  );
}

export const usePatreonAuth = () => {
  const context = useContext(PatreonAuthContext);
  if (!context) {
    throw new Error('usePatreonAuth must be used within PatreonAuthProvider');
  }
  return context;
};
```

### Step 2: Wrap Your App with Provider

In `app/layout.js`:

```javascript
import { PatreonAuthProvider } from '@/contexts/PatreonAuthContext';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <PatreonAuthProvider>
          {children}
        </PatreonAuthProvider>
      </body>
    </html>
  );
}
```

### Step 3: Create Callback Page

Create `app/auth/patreon/callback/page.js`:

```javascript
'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { usePatreonAuth } from '@/contexts/PatreonAuthContext';

export default function PatreonCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { handleCallback } = usePatreonAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    const success = searchParams.get('success');

    if (token && success === 'true') {
      handleCallback(token);
      // Redirect to download page or home
      router.push('/downloads');
    } else {
      // Handle error
      router.push('/?error=patreon_auth_failed');
    }
  }, [searchParams, handleCallback, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Authenticating with Patreon...</h2>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
      </div>
    </div>
  );
}
```

### Step 4: Create Download Page with Patreon Gate

Create `app/downloads/page.js`:

```javascript
'use client';

import { useState } from 'react';
import { usePatreonAuth } from '@/contexts/PatreonAuthContext';

export default function DownloadsPage() {
  const { user, isAuthenticated, login, checkDownloadEligibility } = usePatreonAuth();
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async (assetId, downloadUrl) => {
    if (!isAuthenticated) {
      // Redirect to Patreon login
      login();
      return;
    }

    setDownloading(true);
    
    try {
      // Check if user can download
      const canDownload = await checkDownloadEligibility(assetId);
      
      if (canDownload) {
        // Proceed with download
        window.open(downloadUrl, '_blank');
      } else {
        alert('Your Patreon subscription is not active. Please renew to download.');
      }
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to verify download eligibility');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Premium Downloads</h1>
      
      {!isAuthenticated ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-2">Patreon Members Only</h2>
          <p className="mb-4">
            These downloads are exclusive to our Patreon supporters. 
            Please login with Patreon to access premium content.
          </p>
          <button
            onClick={login}
            className="bg-[#FF424D] hover:bg-[#E03A44] text-white font-bold py-2 px-6 rounded"
          >
            Login with Patreon
          </button>
        </div>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <p className="text-green-800">
            ✓ Logged in as <strong>{user?.email}</strong> 
            {user?.membership_tier && ` (${user.membership_tier} tier)`}
          </p>
        </div>
      )}

      {/* Example Download Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <DownloadCard
          title="Premium Asset Pack 1"
          description="High-quality 3D models"
          assetId="123"
          downloadUrl="https://example.com/download/asset-123"
          onDownload={handleDownload}
          downloading={downloading}
        />
        
        <DownloadCard
          title="Premium Asset Pack 2"
          description="Exclusive textures"
          assetId="124"
          downloadUrl="https://example.com/download/asset-124"
          onDownload={handleDownload}
          downloading={downloading}
        />
      </div>
    </div>
  );
}

function DownloadCard({ title, description, assetId, downloadUrl, onDownload, downloading }) {
  return (
    <div className="border rounded-lg p-6 shadow-sm hover:shadow-md transition">
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
      <button
        onClick={() => onDownload(assetId, downloadUrl)}
        disabled={downloading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
      >
        {downloading ? 'Checking...' : 'Download'}
      </button>
    </div>
  );
}
```

### Step 5: Add User Profile Component (Optional)

Create `components/PatreonUserProfile.js`:

```javascript
'use client';

import { usePatreonAuth } from '@/contexts/PatreonAuthContext';

export default function PatreonUserProfile() {
  const { user, isAuthenticated, login, logout } = usePatreonAuth();

  if (!isAuthenticated) {
    return (
      <button
        onClick={login}
        className="bg-[#FF424D] hover:bg-[#E03A44] text-white font-bold py-2 px-4 rounded"
      >
        Login with Patreon
      </button>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <div className="text-right">
        <p className="font-semibold">{user.full_name || user.email}</p>
        {user.membership_tier && (
          <p className="text-sm text-gray-600 capitalize">{user.membership_tier} Member</p>
        )}
      </div>
      <button
        onClick={logout}
        className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded"
      >
        Logout
      </button>
    </div>
  );
}
```

---

## 🔐 Security Notes

1. **JWT Token Storage**: Currently using `localStorage`. For production, consider using `httpOnly` cookies
2. **CORS**: Make sure your backend allows requests from your frontend domain
3. **HTTPS**: Use HTTPS in production for both frontend and backend
4. **Token Expiry**: JWT tokens expire after 7 days. Implement refresh logic if needed

---

## 🧪 Testing the Flow

### 1. Start Your Backend
```bash
cd nighthawk-server
npm start
```

### 2. Start Your Frontend
```bash
cd nighthawk-frontend
npm run dev
```

### 3. Test the Flow

1. Go to your downloads page
2. Click "Login with Patreon"
3. Authorize on Patreon
4. You'll be redirected back with a token
5. Try downloading - it will verify your patron status
6. If you're an active patron, download proceeds

---

## 📊 Membership Tiers

The backend automatically assigns tiers based on pledge amount:

- **Basic**: $1 - $4.99/month
- **Standard**: $5 - $9.99/month  
- **Premium**: $10+/month

You can customize these thresholds in `patreon.service.mjs` lines 109-115.

---

## 🐛 Troubleshooting

### "Authorization code is required"
- Check your `PATREON_REDIRECT_URI` matches exactly in Patreon dashboard and `.env`

### "Failed to exchange authorization code"
- Verify `PATREON_CLIENT_ID` and `PATREON_CLIENT_SECRET` are correct
- Check that you're using the correct OAuth scopes

### "You must be an active patron"
- Verify `PATREON_CAMPAIGN_ID` is set correctly
- Make sure you're actually a patron of that campaign
- Check if your pledge is active on Patreon

### Token expired errors
- JWT tokens expire after 7 days
- User needs to login again
- Consider implementing refresh token logic

---

## 🚀 Next Steps

1. ✅ Configure your `.env` file with all Patreon credentials
2. ✅ Test the OAuth flow manually via Postman or browser
3. ✅ Implement the frontend using the code above
4. ✅ Style your download page to match your design
5. ✅ Add error handling and loading states
6. ✅ Test with real Patreon account
7. ✅ Deploy to production with HTTPS

---

## 📞 Need Help?

If you encounter issues:
1. Check backend logs for detailed error messages
2. Verify all environment variables are set
3. Test OAuth flow step by step
4. Check Patreon API documentation: https://docs.patreon.com/

Good luck with your implementation! 🎉
