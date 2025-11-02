# 🐛 White Page / Error on First Load - Fix Guide

## 🔍 Problem Analysis

Your website shows a white page or error on first load, but works after reload. Based on the console errors:

```
GET https://api.sketchshaper.com/api/search?search= 400 (Bad Request)
GET https://api.sketchshaper.com/api/categories/undefined 500 (Internal Server Error)
Uncaught Error: Minified React error #418
Uncaught Error: Minified React error #423
```

**Root Cause:** Frontend is making API calls with invalid/undefined data before components are ready, causing:
1. Backend returns 400/500 errors
2. React crashes trying to handle the errors
3. White page appears
4. On reload, data is cached/ready, so it works

---

## ✅ Backend Fixes (Already Applied)

I've added validation to your backend to return proper error messages:

### 1. **Category Endpoint** - Now validates ID
```javascript
// Before: Crashes with "undefined"
GET /api/categories/undefined → 500 Error

// After: Returns helpful error
GET /api/categories/undefined → 400 "Category ID is required"
```

### 2. **Search Endpoint** - Now validates empty searches
```javascript
// Before: Accepts empty search
GET /api/search?search= → Tries to search

// After: Returns validation error
GET /api/search?search= → 400 "Search term is required and cannot be empty"
```

---

## 🎯 Frontend Fixes (You Need to Apply)

The main issue is in your **Next.js/React frontend**. Here's what to fix:

### **Issue 1: Calling API with `undefined` Category ID**

**Location:** Wherever you're fetching categories

```javascript
// ❌ BAD - Calls API before categoryId is ready
useEffect(() => {
  fetch(`https://api.sketchshaper.com/api/categories/${categoryId}`)
    .then(res => res.json())
    .then(data => setCategory(data));
}, [categoryId]);

// ✅ GOOD - Only calls when categoryId exists
useEffect(() => {
  if (!categoryId || categoryId === 'undefined') {
    return; // Don't fetch
  }
  
  fetch(`https://api.sketchshaper.com/api/categories/${categoryId}`)
    .then(res => res.json())
    .then(data => setCategory(data))
    .catch(err => {
      console.error('Failed to fetch category:', err);
      setError(err);
    });
}, [categoryId]);
```

### **Issue 2: Calling Search API with Empty String**

**Location:** Your search component

```javascript
// ❌ BAD - Calls API even when search is empty
useEffect(() => {
  fetch(`https://api.sketchshaper.com/api/search?search=${searchTerm}`)
    .then(res => res.json())
    .then(data => setResults(data));
}, [searchTerm]);

// ✅ GOOD - Only searches when there's actual input
useEffect(() => {
  if (!searchTerm || searchTerm.trim() === '') {
    setResults([]); // Clear results
    return; // Don't fetch
  }
  
  const debounceTimer = setTimeout(() => {
    fetch(`https://api.sketchshaper.com/api/search?search=${encodeURIComponent(searchTerm.trim())}`)
      .then(res => res.json())
      .then(data => setResults(data))
      .catch(err => console.error('Search failed:', err));
  }, 300); // Debounce for 300ms
  
  return () => clearTimeout(debounceTimer);
}, [searchTerm]);
```

### **Issue 3: Missing Loading States**

Add loading states to prevent rendering before data is ready:

```javascript
const [category, setCategory] = useState(null);
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState(null);

useEffect(() => {
  if (!categoryId) {
    setIsLoading(false);
    return;
  }
  
  setIsLoading(true);
  setError(null);
  
  fetch(`https://api.sketchshaper.com/api/categories/${categoryId}`)
    .then(res => {
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    })
    .then(data => {
      setCategory(data);
      setError(null);
    })
    .catch(err => {
      console.error(err);
      setError(err.message);
    })
    .finally(() => {
      setIsLoading(false);
    });
}, [categoryId]);

// Render with loading state
if (isLoading) return <div>Loading...</div>;
if (error) return <div>Error: {error}</div>;
if (!category) return <div>No category found</div>;

return <div>{/* Render category */}</div>;
```

### **Issue 4: React Hydration Errors**

The `HierarchyRequestError` suggests hydration mismatch. Fix by:

```javascript
// Use dynamic imports for client-only components
import dynamic from 'next/dynamic';

const ClientOnlyComponent = dynamic(
  () => import('../components/ClientOnlyComponent'),
  { ssr: false }
);

// Or check if window exists
const [isMounted, setIsMounted] = useState(false);

useEffect(() => {
  setIsMounted(true);
}, []);

if (!isMounted) return null;
```

---

## 🔧 Quick Fixes Checklist

### **In Your Frontend Code:**

- [ ] Add `if (!categoryId) return;` before fetching categories
- [ ] Add `if (!searchTerm.trim()) return;` before searching
- [ ] Add loading states to all data-fetching components
- [ ] Add error boundaries to catch React errors
- [ ] Use `try/catch` or `.catch()` on all API calls
- [ ] Add `encodeURIComponent()` to URL parameters
- [ ] Check for `undefined` or `null` before using data

### **Testing:**

1. Clear browser cache and cookies
2. Open in incognito/private window
3. Visit your site fresh (not reload)
4. Check console for errors
5. Should load without white page

---

## 📝 Example: Complete Fixed Component

```javascript
'use client';

import { useState, useEffect } from 'react';

export default function CategoryPage({ params }) {
  const [category, setCategory] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const categoryId = params?.id;

  useEffect(() => {
    // Validate ID before fetching
    if (!categoryId || categoryId === 'undefined') {
      setIsLoading(false);
      setError('Invalid category ID');
      return;
    }

    const fetchCategory = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch(
          `https://api.sketchshaper.com/api/categories/${categoryId}`
        );
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        setCategory(data);
      } catch (err) {
        console.error('Failed to fetch category:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategory();
  }, [categoryId]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500">
          <h2>Error loading category</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  // No data state
  if (!category) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Category not found</p>
      </div>
    );
  }

  // Success - render category
  return (
    <div>
      <h1>{category.name}</h1>
      {/* Rest of your component */}
    </div>
  );
}
```

---

## 🎯 Summary

**Problem:** Frontend calls APIs before data is ready → Backend errors → React crashes → White page

**Solution:**
1. ✅ **Backend:** Added validation (already done)
2. ⚠️ **Frontend:** Add checks before API calls (you need to do this)
3. ⚠️ **Frontend:** Add loading states (you need to do this)
4. ⚠️ **Frontend:** Add error handling (you need to do this)

**The issue is 90% frontend, 10% backend.** The backend fixes I made will help with better error messages, but the main fix needs to be in your Next.js code.

---

## 📚 Additional Resources

- [React Error Boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
- [Next.js Data Fetching](https://nextjs.org/docs/app/building-your-application/data-fetching)
- [React Hydration Errors](https://nextjs.org/docs/messages/react-hydration-error)

---

**Need help with specific frontend files? Share the code and I can fix it for you!** 🚀
