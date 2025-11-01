# Patreon Integration Setup Guide

## Overview
This backend implements Patreon OAuth authentication for payment-gated content access. Users must be active Patreon subscribers to access protected routes.

---

## Backend Setup

### 1. Install Dependencies
```bash
npm install axios
```

### 2. Create Patreon OAuth Application

1. Go to [Patreon Developer Portal](https://www.patreon.com/portal/registration/register-clients)
2. Click **"Create Client"**
3. Fill in the details:
   - **App Name**: Your application name
   - **Description**: Brief description
   - **App Category**: Choose appropriate category
   - **Redirect URIs**: Add your callback URL
     - Development: `http://localhost:5000/api/patreon/callback`
     - Production: `https://yourdomain.com/api/patreon/callback`
4. Save and copy:
   - **Client ID**
   - **Client Secret**

### 3. Configure Environment Variables

Copy `.env.example` to `.env` and fill in:

```env
# Patreon OAuth Configuration
PATREON_CLIENT_ID=your_client_id_here
PATREON_CLIENT_SECRET=your_client_secret_here
PATREON_REDIRECT_URI=http://localhost:5000/api/patreon/callback
```

### 4. Run Database Migration

```bash
npx prisma migrate dev --name add_patreon_users
npx prisma generate
```

---

## API Endpoints

### Public Endpoints

#### 1. Get Authorization URL
```
GET /api/patreon/auth
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

#### 2. OAuth Callback (Patreon redirects here)
```
GET /api/patreon/callback?code=AUTHORIZATION_CODE
```

**Response:**
```json
{
  "status": "success",
  "code": 200,
  "message": "Successfully authenticated with Patreon",
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "fullName": "John Doe",
      "membershipTier": "premium",
      "isActivePatron": true,
      "pledgeAmount": 10.00
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Protected Endpoints (Require Patreon Token)

**Headers Required:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

#### 3. Verify Patron Status
```
GET /api/patreon/verify
```

#### 4. Get Current User
```
GET /api/patreon/me
```

### Admin Endpoints (Require Admin Token)

#### 5. Get All Patreon Users
```
GET /api/patreon/users
```

#### 6. Get Single User
```
GET /api/patreon/users/:id
```

#### 7. Revoke User Access
```
POST /api/patreon/users/:id/revoke
```

### Example Protected Routes

#### Basic Protection (Any active patron)
```
GET /api/protected/premium-content
Headers: Authorization: Bearer PATREON_TOKEN
```

#### Tier-Specific Protection (Premium only)
```
GET /api/protected/premium-only
Headers: Authorization: Bearer PATREON_TOKEN
```

#### Multiple Tiers (Standard or Premium)
```
GET /api/protected/standard-plus
Headers: Authorization: Bearer PATREON_TOKEN
```

---

## Membership Tiers

The system automatically categorizes patrons based on pledge amount:

- **Basic**: $1 - $4.99/month
- **Standard**: $5 - $9.99/month
- **Premium**: $10+/month

You can customize these tiers in `src/modules/patreon/patreon.service.mjs` (lines 90-98).

---

## How to Protect Your Routes

### Method 1: Protect Entire Route
```javascript
import { verifyPatreonAuth } from '../../middlewares/auth/verifyPatreonAuth.mjs';

// All routes require Patreon authentication
router.use(verifyPatreonAuth);

router.get('/content', (req, res) => {
  // req.user contains authenticated user data
  res.json({ message: 'Protected content', user: req.user });
});
```

### Method 2: Protect Specific Routes
```javascript
import { verifyPatreonAuth } from '../../middlewares/auth/verifyPatreonAuth.mjs';

router.get('/public', (req, res) => {
  res.json({ message: 'Public content' });
});

router.get('/premium', verifyPatreonAuth, (req, res) => {
  res.json({ message: 'Premium content', user: req.user });
});
```

### Method 3: Tier-Specific Protection
```javascript
import { 
  verifyPatreonAuth, 
  verifyMembershipTier 
} from '../../middlewares/auth/verifyPatreonAuth.mjs';

router.get(
  '/premium-only',
  verifyPatreonAuth,
  verifyMembershipTier(['premium']),
  (req, res) => {
    res.json({ message: 'Premium tier only' });
  }
);
```

---

## Authentication Flow

```
1. Frontend: User clicks "Login with Patreon"
   ↓
2. Frontend: Call GET /api/patreon/auth to get authorization URL
   ↓
3. Frontend: Redirect user to Patreon authorization URL
   ↓
4. Patreon: User authorizes your app
   ↓
5. Patreon: Redirects to /api/patreon/callback?code=XXX
   ↓
6. Backend: Exchanges code for access token
   ↓
7. Backend: Fetches user data and verifies patron status
   ↓
8. Backend: Creates/updates user in database
   ↓
9. Backend: Returns JWT token to frontend
   ↓
10. Frontend: Stores token (localStorage/cookies)
    ↓
11. Frontend: Uses token in Authorization header for protected routes
```

---

## Frontend Integration

### React Example

```javascript
// Login Component
const handlePatreonLogin = async () => {
  try {
    // Get auth URL
    const response = await fetch('http://localhost:5000/api/patreon/auth');
    const data = await response.json();
    
    // Redirect to Patreon
    window.location.href = data.data.authUrl;
  } catch (error) {
    console.error('Login failed:', error);
  }
};

// Callback Handler Component
const PatreonCallback = () => {
  useEffect(() => {
    const handleCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      
      if (code) {
        try {
          const response = await fetch(
            `http://localhost:5000/api/patreon/callback?code=${code}`
          );
          const data = await response.json();
          
          // Store token
          localStorage.setItem('patreonToken', data.data.token);
          
          // Redirect to protected page
          window.location.href = '/dashboard';
        } catch (error) {
          console.error('Callback failed:', error);
        }
      }
    };
    
    handleCallback();
  }, []);
  
  return <div>Processing login...</div>;
};

// Protected API Call
const fetchProtectedContent = async () => {
  const token = localStorage.getItem('patreonToken');
  
  const response = await fetch('http://localhost:5000/api/protected/premium-content', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return response.json();
};
```

---

## Admin Panel Requirements

### Recommended Features:

1. **User Management**
   - View all Patreon subscribers
   - See subscription tiers and amounts
   - View last verification date
   - Manually revoke access

2. **Analytics Dashboard**
   - Total active patrons
   - Revenue breakdown by tier
   - New subscribers this month
   - Churn rate

3. **Manual Override**
   - Grant temporary access
   - Extend subscription
   - Change tier manually

### Admin API Integration Example:

```javascript
// Get all Patreon users
const getPatreonUsers = async () => {
  const adminToken = localStorage.getItem('adminToken');
  
  const response = await fetch('http://localhost:5000/api/patreon/users', {
    headers: {
      'Authorization': `Bearer ${adminToken}`
    }
  });
  
  return response.json();
};

// Revoke user access
const revokeAccess = async (userId) => {
  const adminToken = localStorage.getItem('adminToken');
  
  await fetch(`http://localhost:5000/api/patreon/users/${userId}/revoke`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${adminToken}`
    }
  });
};
```

---

## Security Best Practices

1. **Never expose Client Secret** - Keep it in `.env` file only
2. **Use HTTPS in production** - Required for OAuth
3. **Validate tokens on every request** - Don't trust client-side data
4. **Refresh tokens periodically** - System auto-refreshes expired tokens
5. **Rate limit OAuth endpoints** - Prevent abuse
6. **Log authentication attempts** - Monitor for suspicious activity

---

## Testing

### Test OAuth Flow Locally:

1. Start server: `npm run dev`
2. Visit: `http://localhost:5000/api/patreon/auth`
3. Copy the `authUrl` from response
4. Paste in browser and authorize
5. You'll be redirected to callback with token

### Test Protected Routes:

```bash
# Get token from login response, then:
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/protected/premium-content
```

---

## Troubleshooting

### Error: "Invalid redirect URI"
- Ensure redirect URI in Patreon app matches `PATREON_REDIRECT_URI` in `.env`
- Check for trailing slashes

### Error: "You must be an active patron"
- User needs to subscribe on Patreon first
- Check patron status in Patreon dashboard

### Error: "Token expired"
- System auto-refreshes tokens
- User may need to re-authenticate if refresh token is invalid

### Error: "Invalid client credentials"
- Double-check `PATREON_CLIENT_ID` and `PATREON_CLIENT_SECRET`
- Ensure no extra spaces in `.env` file

---

## Production Deployment

1. Update `.env` with production values:
   ```env
   MODE=prod
   PATREON_REDIRECT_URI=https://yourdomain.com/api/patreon/callback
   ```

2. Update Patreon app redirect URIs to include production URL

3. Run migration on production database:
   ```bash
   npx prisma migrate deploy
   ```

4. Ensure HTTPS is enabled (required for OAuth)

---

## Support

For issues or questions:
- Patreon API Docs: https://docs.patreon.com/
- OAuth 2.0 Spec: https://oauth.net/2/
