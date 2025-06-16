# STEP 0: LeoFinder Codebase Audit

## 🚨 CRITICAL ISSUES FOUND

### 1. **Backend Architecture Mismatch** ⚠️
- **Problem**: User expects FastAPI + Python, but codebase uses Node.js/Express + TypeScript
- **Evidence**: `server/` folder contains `.ts` files, `package.json`, not Python
- **Impact**: Backend health check failing, database disconnected
- **Solution**: Need to decide: migrate to FastAPI or update user expectations

### 2. **Missing Navigation** 🔍
- **Problem**: Settings/Search buttons in Header are not functional links
- **Evidence**: `Header.tsx` has buttons but no routing/onClick handlers
- **Impact**: User can't navigate to Settings page they need
- **Files**: `src/components/Header.tsx`

### 3. **Backend Database Issues** 💾
- **Problem**: Firebase Firestore connection failing 
- **Evidence**: Health endpoint returns `"database":"disconnected"`
- **Impact**: No listings data, scraping won't work
- **Files**: `server/db/firestore.ts`, missing environment variables

## ❌ FILES SAFE TO DELETE

### Frontend Cruft
```
src/App.css                    # Unused, Tailwind handles styling
src/utils/leoPersona.ts        # Mock data, not used in production
src/components/DevTools.tsx    # Development only
dist/                         # Build artifacts
```

### Backend/Docs Cruft
```
server/db/index.ts            # Old PostgreSQL code, replaced by firestore.ts
server/db/schema.sql          # PostgreSQL schema, not needed for Firestore
CLAUDE.MD                     # Outdated specs
DEPLOYMENT_READY.md           # Outdated
FINAL_STATUS.md              # Contains exposed secrets
FIREBASE_SETUP.md            # Setup docs, not code
FRONTEND_SETUP.md            # Setup docs
SUPABASE_SETUP.md            # Old database docs
render.yaml                  # Render config, using Netlify now
```

### Dependencies to Remove
```
package.json: @types/pg, pg   # PostgreSQL types/driver not needed
server/package.json: pg, @types/pg  # Same
```

## 🛠️ FILES THAT NEED REWRITE

### Critical Functionality Issues

#### `src/components/Header.tsx` - NO NAVIGATION
```typescript
// Current: Dead buttons
<Button variant="ghost" size="sm">
  <Settings className="w-4 h-4" />
</Button>

// Needs: Router links
<Button variant="ghost" size="sm" asChild>
  <Link to="/settings">
    <Settings className="w-4 h-4" />
  </Link>
</Button>
```

#### `src/pages/Index.tsx` - NOTIFICATION BUTTON BROKEN
```typescript
// Current: Missing handler
<Button>Enable LEO Alerts</Button>

// Needs: Real functionality
const handleEnableNotifications = async () => {
  await requestPermission();
  toast.success('LEO alerts enabled!');
};
```

#### `server/db/firestore.ts` - CONNECTION FAILING
- Firebase credentials not properly configured in Render
- Error handling too aggressive (throws on connection issues)
- Needs retry logic and graceful degradation

#### `server/services/scraper.ts` - NOT FUNCTIONAL
- Puppeteer setup incomplete
- No error handling for failed scrapes
- Foreclosure.com scraper has hardcoded credentials

### Architecture Issues

#### `server/index.ts` - MISSING CORS/ROUTES
```typescript
// Missing proper CORS for frontend domain
// Missing rate limiting
// Health check returns wrong data
```

## ✅ FILES ALREADY SOLID

### Frontend Infrastructure
```
src/App.tsx                  # React Router setup good
src/api/client.ts            # Axios client properly configured
src/hooks/useListings.ts     # React Query integration solid
src/hooks/usePushNotifications.ts  # FCM setup correct
src/components/ui/          # Shadcn components complete
src/pages/Settings.tsx      # Well-structured settings page
src/pages/Search.tsx        # Good search interface
```

### Backend Core
```
server/services/ai.ts       # Anthropic integration working
server/services/notifications.ts  # Firebase messaging setup
server/services/scoring.ts  # Keyword scoring logic solid
server/types/index.ts       # Type definitions good
server/keywords.json        # Scoring keywords comprehensive
```

### Configuration
```
netlify.toml                # Deployment config correct
package.json                # Frontend deps mostly good
tsconfig.json               # TypeScript config solid
tailwind.config.ts          # Styling setup good
vite.config.ts              # Build config working
```

## 🎯 IMMEDIATE FIXES NEEDED (Priority Order)

### 1. **Fix Navigation** (5 min)
- Add React Router links to Header buttons
- Test Settings/Search page navigation

### 2. **Fix Backend Database** (15 min)  
- Add missing Firebase environment variables to Render
- Test `/health` endpoint returns connected

### 3. **Enable Notifications** (10 min)
- Connect "Enable LEO Alerts" button to FCM
- Test notification permissions

### 4. **Fix Scraping** (20 min)
- Debug Foreclosure.com scraper
- Add error handling and user feedback

### 5. **Clean Up Cruft** (10 min)
- Remove unused files and dependencies
- Clean build warnings

## 📊 CURRENT STATE SUMMARY

**Architecture**: Node.js/Express + React (NOT FastAPI + Python as expected)
**Database**: Firebase Firestore (configured but not connected)
**Deployment**: Netlify frontend ✅ + Render backend ⚠️ 
**Functionality**: ~70% complete, main issues are navigation + backend connection

**User Impact**: Settings button doesn't work, no listings data, scraping fails
**Time to Fix**: ~60 minutes to get fully functional

## 🔧 NEXT STEPS

1. **Confirm Architecture**: User needs to approve Node.js approach OR switch to FastAPI
2. **Fix Critical Path**: Navigation → Database → Notifications → Scraping
3. **Test End-to-End**: Verify user can navigate, see listings, enable alerts

**Note**: If switching to FastAPI is required, estimated 4-6 hours for full backend rewrite.