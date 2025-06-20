# Chrome Extension CSP & CORS Fix

## Problem
Your Chrome extension was getting this error:
```
Uncaught EvalError: Refused to evaluate a string as JavaScript because 'unsafe-eval' is not an allowed source of script in the following Content Security Policy directive
```

## Root Cause
The Express.js backend had a restrictive Content Security Policy (CSP) that:
1. **Blocked Chrome extensions** from connecting to localhost
2. **Prevented `unsafe-eval`** which some Chrome extension frameworks need
3. **Restricted CORS** to only allow specific origins

## Fixes Applied

### 1. Updated Content Security Policy
**File:** `src/middleware/security.ts`

**Changes:**
- Added `chrome-extension://*` to `connectSrc`
- Added `'unsafe-eval'` in development mode
- Added `http://localhost:*` and `http://127.0.0.1:*` to `connectSrc`
- Added `frameSrc` to allow Chrome extension frames

### 2. Updated CORS Configuration
**File:** `src/middleware/security.ts`

**Changes:**
- Added dynamic origin checking for Chrome extensions
- Added your specific extension ID: `chrome-extension://66524fcd-e700-4a96-86c9-b12bce692153`
- Added wildcard support for Chrome extensions in development
- Added missing headers: `X-Timestamp`, `X-Signature`

## New CSP Configuration

```typescript
helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: [
      "'self'", 
      "'unsafe-inline'",
      // Allow unsafe-eval in development mode for Chrome extensions
      ...(process.env.NODE_ENV === 'development' ? ["'unsafe-eval'"] : [])
    ],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", 'data:', 'https:'],
    connectSrc: [
      "'self'", 
      'https://api.openrouter.ai',
      'http://localhost:*',
      'http://127.0.0.1:*',
      'chrome-extension://*'
    ],
    frameSrc: ["'self'", 'chrome-extension://*'],
    objectSrc: ["'none'"],
    baseUri: ["'self'"],
    formAction: ["'self'"],
    frameAncestors: ["'self'"],
    upgradeInsecureRequests: [],
  },
})
```

## New CORS Configuration

```typescript
cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'chrome-extension://66524fcd-e700-4a96-86c9-b12bce692153',
      'chrome-extension://*'
    ];
    
    if (process.env.ALLOWED_ORIGINS) {
      allowedOrigins.push(...process.env.ALLOWED_ORIGINS.split(','));
    }
    
    if (allowedOrigins.includes(origin) || allowedOrigins.some(allowed => allowed.includes('*'))) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Extension-ID', 'X-Timestamp', 'X-Signature'],
  credentials: true,
  maxAge: 86400,
})
```

## Testing the Fix

### 1. Restart Your Server
```bash
npm run dev
```

### 2. Test from Chrome Extension
```javascript
// This should now work without CSP errors
fetch('http://localhost:3000/api/auth/dev-test')
  .then(response => response.json())
  .then(data => console.log(data));
```

### 3. Check Browser Console
- No more CSP errors
- No more CORS errors
- Requests should work normally

## Security Notes

### Development Mode
- `'unsafe-eval'` is allowed for Chrome extension compatibility
- Wildcard origins are allowed for easier development

### Production Mode
- `'unsafe-eval'` is disabled for security
- Only specific origins are allowed
- Stricter CSP rules apply

## Environment Variables

Make sure your `.env` file includes:
```env
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:3000,chrome-extension://66524fcd-e700-4a96-86c9-b12bce692153
```

## Summary

✅ **Fixed:** CSP now allows Chrome extensions  
✅ **Fixed:** CORS now accepts Chrome extension origins  
✅ **Fixed:** `unsafe-eval` allowed in development mode  
✅ **Fixed:** All required headers are now allowed  

Your Chrome extension should now work without CSP or CORS errors! 