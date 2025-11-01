# Patreon Integration Flow Diagram

## Complete Authentication Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         PATREON OAUTH FLOW                               │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────┐
│   Frontend   │
│  (Your Site) │
└──────┬───────┘
       │
       │ 1. User clicks "Login with Patreon"
       │
       ▼
┌──────────────────────────────────────────────────────────────────────────┐
│ GET /api/patreon/auth                                                     │
│ Returns: { authUrl: "https://patreon.com/oauth2/authorize?..." }        │
└──────┬───────────────────────────────────────────────────────────────────┘
       │
       │ 2. Redirect user to Patreon
       │
       ▼
┌──────────────┐
│   Patreon    │
│  OAuth Page  │
└──────┬───────┘
       │
       │ 3. User authorizes your app
       │
       ▼
┌──────────────────────────────────────────────────────────────────────────┐
│ Patreon redirects to:                                                     │
│ http://yoursite.com/api/patreon/callback?code=AUTHORIZATION_CODE         │
└──────┬───────────────────────────────────────────────────────────────────┘
       │
       │ 4. Backend receives code
       │
       ▼
┌──────────────────────────────────────────────────────────────────────────┐
│ Backend: Exchange code for access token                                  │
│ POST https://patreon.com/api/oauth2/token                                │
│ Returns: { access_token, refresh_token, expires_in }                     │
└──────┬───────────────────────────────────────────────────────────────────┘
       │
       │ 5. Get user identity
       │
       ▼
┌──────────────────────────────────────────────────────────────────────────┐
│ Backend: Fetch user data from Patreon                                    │
│ GET https://patreon.com/api/oauth2/v2/identity                           │
│ Returns: { user data, membership info }                                  │
└──────┬───────────────────────────────────────────────────────────────────┘
       │
       │ 6. Verify patron status
       │
       ▼
┌──────────────────────────────────────────────────────────────────────────┐
│ Backend: Check if user is active patron                                  │
│ - Check patron_status === "active_patron"                                │
│ - Calculate membership tier based on pledge amount                       │
│ - Store/update user in database                                          │
└──────┬───────────────────────────────────────────────────────────────────┘
       │
       │ 7. Generate JWT token
       │
       ▼
┌──────────────────────────────────────────────────────────────────────────┐
│ Backend: Create JWT token for your app                                   │
│ jwt.sign({ id, email, membershipTier, ... }, JWT_SECRET)                │
└──────┬───────────────────────────────────────────────────────────────────┘
       │
       │ 8. Return token to frontend
       │
       ▼
┌──────────────┐
│   Frontend   │
│ Stores token │
│ in localStorage
└──────┬───────┘
       │
       │ 9. Redirect to dashboard
       │
       ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                         USER IS NOW LOGGED IN                             │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Protected API Call Flow

```
┌──────────────┐
│   Frontend   │
│  Dashboard   │
└──────┬───────┘
       │
       │ 1. Request protected content
       │    Headers: Authorization: Bearer JWT_TOKEN
       │
       ▼
┌──────────────────────────────────────────────────────────────────────────┐
│ GET /api/protected/premium-content                                        │
│ Middleware: verifyPatreonAuth                                             │
└──────┬───────────────────────────────────────────────────────────────────┘
       │
       │ 2. Verify JWT token
       │
       ▼
┌──────────────────────────────────────────────────────────────────────────┐
│ Middleware: jwt.verify(token, JWT_SECRET)                                │
│ - Decode token                                                            │
│ - Check expiration                                                        │
│ - Extract user ID                                                         │
└──────┬───────────────────────────────────────────────────────────────────┘
       │
       │ 3. Check user in database
       │
       ▼
┌──────────────────────────────────────────────────────────────────────────┐
│ Database: Find user by ID                                                │
│ - Check if user exists                                                    │
│ - Check if is_active_patron === true                                     │
└──────┬───────────────────────────────────────────────────────────────────┘
       │
       ├─── ❌ User not found or inactive
       │    └──> Return 401/403 error
       │
       └─── ✅ User is active patron
            │
            ▼
┌──────────────────────────────────────────────────────────────────────────┐
│ Attach user to request: req.user = { id, email, tier, ... }             │
└──────┬───────────────────────────────────────────────────────────────────┘
       │
       │ 4. Execute route handler
       │
       ▼
┌──────────────────────────────────────────────────────────────────────────┐
│ Route Handler: Return protected content                                  │
│ res.json({ content: "Premium content", user: req.user })                │
└──────┬───────────────────────────────────────────────────────────────────┘
       │
       │ 5. Send response
       │
       ▼
┌──────────────┐
│   Frontend   │
│ Display data │
└──────────────┘
```

---

## Tier-Based Access Control

```
┌──────────────────────────────────────────────────────────────────────────┐
│                      MEMBERSHIP TIER SYSTEM                               │
└──────────────────────────────────────────────────────────────────────────┘

Pledge Amount          Tier          Access Level
─────────────────────────────────────────────────────────────────────────
$1 - $4.99/month  →   BASIC     →   Basic features
$5 - $9.99/month  →   STANDARD  →   Standard features + Basic
$10+/month        →   PREMIUM   →   All features

┌──────────────────────────────────────────────────────────────────────────┐
│ Example Route Protection:                                                │
└──────────────────────────────────────────────────────────────────────────┘

Route: /api/protected/premium-only
Middleware: verifyPatreonAuth + verifyMembershipTier(['premium'])

Flow:
1. Check if user is authenticated ✓
2. Check if user is active patron ✓
3. Check if user.membershipTier === 'premium' ✓
4. Grant access or return 403 error
```

---

## Token Refresh Flow

```
┌──────────────────────────────────────────────────────────────────────────┐
│                      AUTOMATIC TOKEN REFRESH                              │
└──────────────────────────────────────────────────────────────────────────┘

┌──────────────┐
│   Frontend   │
│ Makes request│
└──────┬───────┘
       │
       ▼
┌──────────────────────────────────────────────────────────────────────────┐
│ Backend: Check Patreon token expiry                                      │
│ if (now >= token_expires_at) { ... }                                     │
└──────┬───────────────────────────────────────────────────────────────────┘
       │
       ├─── Token still valid
       │    └──> Continue with request
       │
       └─── Token expired
            │
            ▼
┌──────────────────────────────────────────────────────────────────────────┐
│ Backend: Refresh access token                                            │
│ POST https://patreon.com/api/oauth2/token                                │
│ Body: { grant_type: "refresh_token", refresh_token: "..." }             │
└──────┬───────────────────────────────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────────────────────────────┐
│ Backend: Update tokens in database                                       │
│ - Store new access_token                                                 │
│ - Store new refresh_token                                                │
│ - Update token_expires_at                                                │
└──────┬───────────────────────────────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────────────────────────────┐
│ Backend: Verify patron status with new token                             │
│ - Check if still active patron                                           │
│ - Update membership tier if changed                                      │
└──────┬───────────────────────────────────────────────────────────────────┘
       │
       ▼
┌──────────────┐
│   Continue   │
│   Request    │
└──────────────┘
```

---

## Admin Management Flow

```
┌──────────────────────────────────────────────────────────────────────────┐
│                      ADMIN PANEL OPERATIONS                               │
└──────────────────────────────────────────────────────────────────────────┘

┌──────────────┐
│ Admin Panel  │
└──────┬───────┘
       │
       │ Admin Token Required
       │
       ▼
┌──────────────────────────────────────────────────────────────────────────┐
│ GET /api/patreon/users                                                    │
│ Middleware: verifyAdminAuth                                               │
│ Returns: List of all Patreon users with subscription info                │
└──────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│ GET /api/patreon/users/:id                                                │
│ Middleware: verifyAdminAuth                                               │
│ Returns: Detailed info for specific user                                 │
└──────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│ POST /api/patreon/users/:id/revoke                                        │
│ Middleware: verifyAdminAuth                                               │
│ Action: Set is_active_patron = false                                     │
│ Result: User loses access to protected content                           │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Database Schema

```
┌──────────────────────────────────────────────────────────────────────────┐
│                         PatreonUser Table                                 │
└──────────────────────────────────────────────────────────────────────────┘

┌─────────────────────┬──────────────┬─────────────────────────────────────┐
│ Field               │ Type         │ Description                         │
├─────────────────────┼──────────────┼─────────────────────────────────────┤
│ id                  │ Int          │ Primary key (auto-increment)        │
│ patreon_id          │ String       │ Unique Patreon user ID              │
│ email               │ String       │ User email (unique)                 │
│ full_name           │ String?      │ User's full name                    │
│ access_token        │ Text         │ Patreon access token                │
│ refresh_token       │ Text         │ Patreon refresh token               │
│ token_expires_at    │ DateTime     │ Token expiration timestamp          │
│ membership_tier     │ String?      │ basic/standard/premium              │
│ is_active_patron    │ Boolean      │ Active subscription status          │
│ pledge_amount_cents │ Int?         │ Monthly pledge in cents             │
│ last_verified_at    │ DateTime     │ Last verification timestamp         │
│ created_at          │ DateTime     │ Account creation timestamp          │
│ updated_at          │ DateTime     │ Last update timestamp               │
└─────────────────────┴──────────────┴─────────────────────────────────────┘
```

---

## Error Handling Flow

```
┌──────────────────────────────────────────────────────────────────────────┐
│                         ERROR SCENARIOS                                   │
└──────────────────────────────────────────────────────────────────────────┘

401 Unauthorized
├─ No token provided
├─ Invalid token
└─ Token expired
   Action: Redirect to login

403 Forbidden
├─ User not active patron
├─ Insufficient membership tier
└─ Access revoked by admin
   Action: Show subscription page

500 Internal Server Error
├─ Patreon API error
├─ Database error
└─ Token refresh failed
   Action: Show error message, retry
```

---

## Security Layers

```
┌──────────────────────────────────────────────────────────────────────────┐
│                         SECURITY ARCHITECTURE                             │
└──────────────────────────────────────────────────────────────────────────┘

Layer 1: OAuth 2.0
└─ Patreon handles user authentication
   └─ No passwords stored in your system

Layer 2: JWT Tokens
└─ Signed tokens for your application
   └─ Prevents token tampering

Layer 3: Database Verification
└─ Check active patron status on every request
   └─ Ensures real-time subscription validation

Layer 4: Token Refresh
└─ Automatic token renewal
   └─ Maintains security without user intervention

Layer 5: Middleware Protection
└─ Route-level access control
   └─ Granular permission management
```

This visual guide helps understand the complete flow of the Patreon integration!
