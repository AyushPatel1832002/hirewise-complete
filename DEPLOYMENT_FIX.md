# Deployment Fix Guide

## Root Cause

Your Vercel deployment is failing with `FUNCTION_INVOCATION_FAILED` and returning "A server error has occurred" instead of proper JSON responses. This is caused by:

1. **Prisma client not being generated**: The `ignoredBuiltDependencies` in package.json was preventing Prisma from building correctly
2. **Poor error messages**: The server was failing to initialize but not providing clear error information

## Fixes Applied

### 1. Fixed package.json (✓ Applied)
Removed the `ignoredBuiltDependencies` that was blocking Prisma:
```diff
- "ignoredBuiltDependencies": [
-   "@prisma/engines",
-   "prisma"
- ]
```

### 2. Enhanced Error Logging (✓ Applied)
Updated `server/_core/vercel-handler.ts` to:
- Log full error stack traces
- Ensure JSON responses even during init failures
- Add success logging for debugging

## Steps to Fix

### 1. Verify Environment Variables in Vercel

Make sure these environment variables are set in your Vercel dashboard:

```bash
DATABASE_URL=postgresql://neondb_owner:npg_AIhtPSeJc1R5@ep-solitary-violet-axz6i9v0.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require
JWT_SECRET=Qo7wFva5x43VQDKMJAtvnk
OAUTH_SERVER_URL=https://api.manus.im
OWNER_OPEN_ID=65XVwZ3rvE37UR5wENnpCq
OWNER_NAME=Ayush Patel
BUILT_IN_FORGE_API_URL=https://forge.manus.ai
BUILT_IN_FORGE_API_KEY=XCP7z79H8uZCpPfd2AMGha
```

### 2. Re-deploy to Vercel

After the package.json changes, re-deploy:

```bash
git add package.json
git commit -m "fix: remove Prisma from ignoredBuiltDependencies for Vercel deployment"
git push
```

Or trigger a manual redeploy in Vercel dashboard.

### 3. Verify Build Logs

Check the Vercel build logs to ensure:
- `prisma generate` runs successfully
- The Prisma client is generated
- The function bundle includes `.prisma/client`

### 4. Test After Deployment

Once deployed, test the health endpoint:
```bash
curl https://hirewise-complete.vercel.app/api/health
```

Should return:
```json
{"status":"ok","jobCount":123,"timestamp":"..."}
```

## Alternative: Local Testing

Test the production build locally before deploying:

```bash
# Build
pnpm run build

# Test the API bundle
node api/index.mjs
```

## Common Vercel Issues with Prisma

1. **Missing Prisma Client**: Make sure `postinstall` runs `prisma generate`
2. **Binary Targets**: Prisma should auto-detect Vercel's runtime
3. **Function Size**: Prisma can make functions large - current limit is 1024MB (already configured)
4. **Cold Starts**: First request might timeout - consider database connection pooling

## If Issues Persist

1. Check Vercel function logs in the dashboard
2. Verify DATABASE_URL is accessible from Vercel's network
3. Consider using Neon's connection pooling URL for better serverless performance
