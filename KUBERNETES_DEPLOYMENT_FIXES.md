# Kubernetes Deployment Fixes - Summary

## Issues Fixed

### 1. **Selected Course Not Appearing Formatted Locally** ✅
**Root Cause:** The `.selected-courses` CSS styling was only defined in `builder.css`, but the element is displayed on the `profile.html` page which links to `profile.css`.

**Fix:**
- Added `.selected-courses` styling to [frontend/css/profile.css](frontend/css/profile.css)
- Style includes blue left border and light blue background for visual formatting

### 2. **Blue Outline on Dropdown** ✅
**Root Cause:** Focus styles in CSS had `box-shadow: 0 0 0 4px rgba(17, 17, 17, 0.05)` creating a visible outline effect.

**Fixes:**
- Updated `select:focus` in [frontend/css/main.css](frontend/css/main.css) to remove box-shadow
- Updated `.form-group select:focus` in [frontend/css/builder.css](frontend/css/builder.css) to remove box-shadow
- Added explicit focus styles to `.schedule-selector` in [frontend/css/builder.css](frontend/css/builder.css)
- Focus state now uses only border color change without outline/shadow

### 3. **Required Units Not Reflected** ✅
**Root Cause:** Backend returns `req_units` in the API response, but frontend was never extracting and storing it in localStorage.

**Fixes:**
- Updated [frontend/scripts/profile.js](frontend/scripts/profile.js):
  - Extract `req_units` from server response in `loadFromServer()`
  - Store `req_units` to localStorage when term selection is applied
  - Clear `reqUnits` from localStorage in `clearTermCache()`

- Updated [frontend/scripts/subjects.js](frontend/scripts/subjects.js):
  - Extract `req_units` from server response in `getTermData()`
  - Store `req_units` to localStorage for display in unit counter
  - Clear `reqUnits` from localStorage in `clearTermCache()`

### 4. **Critical: API Hardcoded to localhost:3000** ✅
**Root Cause:** All frontend scripts had hardcoded `const API_BASE = 'http://localhost:3000/api'` which fails in Kubernetes deployment.

**Fixes - Dynamic API URL Detection:**
- Updated [frontend/scripts/profile.js](frontend/scripts/profile.js)
- Updated [frontend/scripts/subjects.js](frontend/scripts/subjects.js)
- Updated [frontend/scripts/setup.js](frontend/scripts/setup.js)
- Updated [frontend/scripts/auth.js](frontend/scripts/auth.js)
- Updated [frontend/scripts/plotter.js](frontend/scripts/plotter.js)

**Implementation:**
```javascript
const API_BASE = (() => {
  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:3000/api';
  }
  // In Kubernetes/production, use same hostname with /api path
  const protocol = window.location.protocol;
  const port = window.location.port ? ':' + window.location.port : '';
  return `${protocol}//${hostname}${port}/api`;
})();
```

This allows:
- Local development: Routes to `http://localhost:3000/api`
- Kubernetes deployment: Routes API calls through nginx proxy to backend service

### 5. **Kubernetes Deployment Configuration** ✅
**Changes:**
- Created [nginx.conf](nginx.conf) - Nginx configuration for the frontend container
  - Proxies `/api/` requests to `backend-service:3000`
  - Includes proper CORS headers
  - Caches static assets (1 year)
  - Adds security headers (X-Frame-Options, X-Content-Type-Options, X-XSS-Protection)
  
- Updated [Dockerfile](Dockerfile)
  - Added COPY directive for nginx configuration
  - Configuration is installed at `/etc/nginx/conf.d/default.conf`

## How It Works in Kubernetes

1. **Frontend Service** (LoadBalancer):
   - Exposes nginx on port 80
   - Serves static HTML/CSS/JS files
   - Proxies `/api/*` requests to backend service

2. **Backend Service** (LoadBalancer):
   - Exposes backend API on port 3000
   - Frontend can reach it internally via `backend-service:3000`

3. **Frontend JavaScript**:
   - Detects deployment environment by hostname
   - In K8s: Uses `https://your-frontend-domain/api` (through nginx proxy)
   - Locally: Uses `http://localhost:3000/api` (direct connection)

## Deployment Steps

1. **Build new frontend image with nginx config:**
   ```bash
   docker build -t jjtschooldlsud/sched-builder-frontend:v5 .
   ```

2. **Push to registry:**
   ```bash
   docker push jjtschooldlsud/sched-builder-frontend:v5
   ```

3. **Update frontend deployment image:**
   ```yaml
   image: jjtschooldlsud/sched-builder-frontend:v5
   ```

4. **Apply Kubernetes manifests:**
   ```bash
   kubectl apply -f k8s/
   ```

## Testing Checklist

- [ ] Selected course displays with blue border formatting on profile page
- [ ] Dropdown focus doesn't show blue outline
- [ ] Required units display correctly (e.g., "Units: 18 / 18")
- [ ] Schedule picker loads available courses
- [ ] Add course functionality works
- [ ] Save schedule functionality works
- [ ] Unit counter updates when courses are added/removed
- [ ] REGULAR/IRREGULAR status badge displays correctly

## Environment Variables (Optional)

If you need more control over API routing, consider adding environment variables to the deployment:
- `REACT_APP_API_BASE_URL` - Can be set in deployment for centralized API configuration
- This would require updating frontend code to read from window.__env__ or similar

## Files Modified

- `frontend/scripts/profile.js` - Dynamic API URL, req_units storage
- `frontend/scripts/subjects.js` - Dynamic API URL, req_units storage
- `frontend/scripts/setup.js` - Dynamic API URL
- `frontend/scripts/auth.js` - Dynamic API URL
- `frontend/scripts/plotter.js` - Dynamic API URL
- `frontend/css/profile.css` - Added .selected-courses styling
- `frontend/css/main.css` - Fixed select:focus styles
- `frontend/css/builder.css` - Fixed form-group focus styles, added schedule-selector focus
- `Dockerfile` - Added nginx.conf copy
- `nginx.conf` - NEW: Nginx configuration for API proxying

## Notes

- Backend should remain unchanged (already returns req_units correctly)
- CSS changes ensure consistent styling across pages
- Dynamic API URL detection is backward compatible with local development
- Nginx proxy preserves headers for authentication (Authorization header is forwarded)
