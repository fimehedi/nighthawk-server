# Frontend Integration Guide - Patreon Authentication

## Quick Start for Frontend Developers

This guide shows you how to integrate Patreon authentication in your frontend application.

---

## API Base URL

```javascript
const API_BASE_URL = 'http://localhost:5000/api'; // Development
// const API_BASE_URL = 'https://yourdomain.com/api'; // Production
```

---

## 1. Login Flow

### Step 1: Add "Login with Patreon" Button

```jsx
// React Example
import { useState } from 'react';

function LoginButton() {
  const [loading, setLoading] = useState(false);

  const handlePatreonLogin = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/patreon/auth`);
      const data = await response.json();
      
      // Redirect to Patreon
      window.location.href = data.data.authUrl;
    } catch (error) {
      console.error('Login failed:', error);
      setLoading(false);
    }
  };

  return (
    <button onClick={handlePatreonLogin} disabled={loading}>
      {loading ? 'Redirecting...' : 'Login with Patreon'}
    </button>
  );
}
```

### Step 2: Create Callback Handler Page

Create a page at `/patreon/callback` route:

```jsx
// React Example - PatreonCallback.jsx
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

function PatreonCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const errorParam = searchParams.get('error');

      if (errorParam) {
        setError('Authentication cancelled or failed');
        return;
      }

      if (!code) {
        setError('No authorization code received');
        return;
      }

      try {
        const response = await fetch(
          `${API_BASE_URL}/patreon/callback?code=${code}`
        );
        const data = await response.json();

        if (data.status === 'success') {
          // Store token
          localStorage.setItem('patreonToken', data.data.token);
          localStorage.setItem('patreonUser', JSON.stringify(data.data.user));

          // Redirect to dashboard
          navigate('/dashboard');
        } else {
          setError(data.message || 'Authentication failed');
        }
      } catch (error) {
        console.error('Callback error:', error);
        setError('Failed to complete authentication');
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  if (error) {
    return (
      <div>
        <h2>Authentication Failed</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/')}>Go Home</button>
      </div>
    );
  }

  return (
    <div>
      <h2>Completing authentication...</h2>
      <p>Please wait while we log you in.</p>
    </div>
  );
}

export default PatreonCallback;
```

---

## 2. Protected Routes

### Create Protected Route Component

```jsx
// React Example - ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children, requiredTier = null }) {
  const token = localStorage.getItem('patreonToken');
  const user = JSON.parse(localStorage.getItem('patreonUser') || '{}');

  // Check if user is logged in
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Check if user is active patron
  if (!user.isActivePatron) {
    return <Navigate to="/subscribe" replace />;
  }

  // Check tier requirement
  if (requiredTier && user.membershipTier !== requiredTier) {
    return <Navigate to="/upgrade" replace />;
  }

  return children;
}

export default ProtectedRoute;
```

### Use Protected Route

```jsx
// App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/patreon/callback" element={<PatreonCallback />} />
        
        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        
        {/* Tier-Specific Route */}
        <Route
          path="/premium"
          element={
            <ProtectedRoute requiredTier="premium">
              <PremiumContent />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
```

---

## 3. API Calls with Authentication

### Create API Helper

```javascript
// utils/api.js
const API_BASE_URL = 'http://localhost:5000/api';

export const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem('patreonToken');
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    // Handle token expiration
    if (response.status === 401) {
      localStorage.removeItem('patreonToken');
      localStorage.removeItem('patreonUser');
      window.location.href = '/login';
      throw new Error('Session expired. Please login again.');
    }

    // Handle inactive patron
    if (response.status === 403) {
      window.location.href = '/subscribe';
      throw new Error('Active Patreon subscription required.');
    }

    return data;
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

// Example usage functions
export const fetchProtectedContent = () => {
  return apiCall('/protected/premium-content');
};

export const verifyPatronStatus = () => {
  return apiCall('/patreon/verify');
};

export const getCurrentUser = () => {
  return apiCall('/patreon/me');
};
```

### Use in Components

```jsx
// React Example
import { useEffect, useState } from 'react';
import { fetchProtectedContent } from '../utils/api';

function Dashboard() {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadContent = async () => {
      try {
        const data = await fetchProtectedContent();
        setContent(data.data);
      } catch (error) {
        console.error('Failed to load content:', error);
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Welcome, {content?.user?.email}</h1>
      <p>Tier: {content?.user?.membershipTier}</p>
      <p>{content?.content}</p>
    </div>
  );
}
```

---

## 4. User Context (Optional but Recommended)

### Create Auth Context

```jsx
// context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser } from '../utils/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('patreonToken');
      
      if (token) {
        try {
          const data = await getCurrentUser();
          setUser(data.data);
        } catch (error) {
          console.error('Failed to load user:', error);
          logout();
        }
      }
      
      setLoading(false);
    };

    loadUser();
  }, []);

  const login = (token, userData) => {
    localStorage.setItem('patreonToken', token);
    localStorage.setItem('patreonUser', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('patreonToken');
    localStorage.removeItem('patreonUser');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
```

### Use Auth Context

```jsx
// App.jsx
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        {/* Your routes */}
      </BrowserRouter>
    </AuthProvider>
  );
}

// In any component
import { useAuth } from '../context/AuthContext';

function Header() {
  const { user, logout } = useAuth();

  return (
    <header>
      {user ? (
        <>
          <span>Welcome, {user.fullName}</span>
          <span>Tier: {user.membershipTier}</span>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <a href="/login">Login</a>
      )}
    </header>
  );
}
```

---

## 5. Handling Different Membership Tiers

```jsx
// components/TierBadge.jsx
function TierBadge({ tier }) {
  const tierColors = {
    basic: 'bg-gray-500',
    standard: 'bg-blue-500',
    premium: 'bg-purple-500',
  };

  return (
    <span className={`px-3 py-1 rounded ${tierColors[tier]}`}>
      {tier.toUpperCase()}
    </span>
  );
}

// components/TierGate.jsx
function TierGate({ requiredTier, children, fallback }) {
  const { user } = useAuth();
  
  const tierLevels = { basic: 1, standard: 2, premium: 3 };
  const userLevel = tierLevels[user?.membershipTier] || 0;
  const requiredLevel = tierLevels[requiredTier] || 0;

  if (userLevel >= requiredLevel) {
    return children;
  }

  return fallback || (
    <div>
      <p>This feature requires {requiredTier} tier or higher.</p>
      <a href="/upgrade">Upgrade Now</a>
    </div>
  );
}

// Usage
function FeaturePage() {
  return (
    <div>
      <h1>Features</h1>
      
      <TierGate requiredTier="basic">
        <div>Basic feature content</div>
      </TierGate>
      
      <TierGate requiredTier="premium">
        <div>Premium feature content</div>
      </TierGate>
    </div>
  );
}
```

---

## 6. Axios Alternative (If you prefer Axios)

```javascript
// utils/axios.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Request interceptor - Add token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('patreonToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('patreonToken');
      localStorage.removeItem('patreonUser');
      window.location.href = '/login';
    }
    
    if (error.response?.status === 403) {
      window.location.href = '/subscribe';
    }
    
    return Promise.reject(error);
  }
);

export default api;

// Usage
import api from './utils/axios';

const fetchContent = async () => {
  const response = await api.get('/protected/premium-content');
  return response.data;
};
```

---

## 7. Complete Login Flow Example

```jsx
// pages/Login.jsx
import { useState } from 'react';

function Login() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:5000/api/patreon/auth');
      const data = await response.json();

      if (data.status === 'success') {
        window.location.href = data.data.authUrl;
      } else {
        setError('Failed to get authorization URL');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <h1>Login to Access Premium Content</h1>
      <p>You need an active Patreon subscription to access this site.</p>
      
      {error && <div className="error">{error}</div>}
      
      <button 
        onClick={handleLogin} 
        disabled={loading}
        className="patreon-button"
      >
        {loading ? 'Loading...' : '🔒 Login with Patreon'}
      </button>
      
      <p className="info">
        Don't have a subscription? 
        <a href="https://patreon.com/your_page" target="_blank">
          Subscribe on Patreon
        </a>
      </p>
    </div>
  );
}

export default Login;
```

---

## 8. Environment Variables (Frontend)

```env
# .env (React/Vite)
VITE_API_BASE_URL=http://localhost:5000/api

# .env (Next.js)
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
```

```javascript
// Use in code
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL; // Vite
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL; // Next.js
```

---

## Summary Checklist

### Frontend Requirements:

- ✅ **Login page** with "Login with Patreon" button
- ✅ **Callback page** at `/patreon/callback` route
- ✅ **Protected route wrapper** component
- ✅ **API helper** with authentication headers
- ✅ **Token storage** (localStorage or cookies)
- ✅ **Error handling** for expired tokens and inactive subscriptions
- ✅ **User context** (optional but recommended)
- ✅ **Tier-based UI** components

### Admin Frontend Requirements (Optional):

- ✅ **User list page** showing all Patreon subscribers
- ✅ **User detail page** with subscription info
- ✅ **Revoke access button** for manual intervention
- ✅ **Analytics dashboard** (subscriber count, revenue, etc.)

---

## Need Help?

Check `PATREON_SETUP.md` for backend details and troubleshooting.
