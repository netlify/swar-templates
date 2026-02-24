---
name: netlify-debugging
description: Debug Netlify deployments, functions, and builds. Use when troubleshooting build failures, function errors, deployment issues, or monitoring logs on Netlify.
license: Apache-2.0
metadata:
  author: netlify
  version: "1.0"
---

# Netlify Debugging

Guide to debugging builds, functions, deployments, and runtime issues on Netlify.

## When to Use

- Build failures or timeouts
- Function errors or timeouts
- Deployment not working as expected
- Environment variable issues
- Redirect/rewrite problems
- Performance troubleshooting

## Function Logs

### Viewing in Netlify UI

1. Go to your site dashboard
2. Navigate to **Logs** → **Functions**
3. Select a function to view its logs
4. Filter by time range or search for specific errors

### Streaming Logs with CLI

```bash
# Stream all function logs
netlify functions:log

# Stream logs for a specific function
netlify functions:log --name=my-function

# Stream with tail (follow mode)
netlify functions:log --tail

# Filter by level
netlify functions:log --level=error
```

### Adding Logs to Functions

```typescript
// netlify/functions/api.ts
export default async (request: Request, context: Context) => {
  console.log("Request received:", {
    method: request.method,
    url: request.url,
    headers: Object.fromEntries(request.headers),
  });
  
  try {
    const result = await processRequest(request);
    console.log("Request processed successfully:", result);
    return Response.json(result);
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response("Internal error", { status: 500 });
  }
};
```

### Structured Logging

```typescript
function log(level: "info" | "warn" | "error", message: string, data?: object) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...data,
  };
  
  if (level === "error") {
    console.error(JSON.stringify(entry));
  } else {
    console.log(JSON.stringify(entry));
  }
}

// Usage
log("info", "User logged in", { userId: "123" });
log("error", "Database connection failed", { error: err.message });
```

## Build Logs

### Viewing Build Logs

1. Go to **Deploys** in site dashboard
2. Click on a deploy
3. View **Deploy log** for full build output

### Local Build Testing

```bash
# Run the build command locally
npm run build

# Test with Netlify CLI (simulates Netlify environment)
netlify build

# Build with specific context
netlify build --context=deploy-preview
```

### Common Build Issues

#### Out of Memory

```toml
# netlify.toml - Increase Node.js memory
[build.environment]
  NODE_OPTIONS = "--max_old_space_size=4096"
```

#### Missing Dependencies

```bash
# Ensure all dependencies are in package.json
npm install missing-package --save

# Clear cache if issues persist
# In Netlify UI: Deploys → Trigger deploy → Clear cache and deploy site
```

#### Build Timeout

```toml
# netlify.toml - Check your build command
[build]
  command = "npm run build"
  publish = "dist"

# Consider:
# - Splitting build into smaller chunks
# - Using build caching
# - Optimizing slow operations
```

## Environment Variables

### Debugging Environment Variables

```typescript
// Log available environment variables (be careful with secrets!)
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("CONTEXT:", process.env.CONTEXT);
console.log("DEPLOY_URL:", process.env.DEPLOY_URL);

// Check if variable exists
if (!process.env.API_KEY) {
  console.error("API_KEY is not set!");
}
```

### Netlify-Provided Variables

| Variable | Description |
|----------|-------------|
| `CONTEXT` | Build context: `production`, `deploy-preview`, `branch-deploy` |
| `DEPLOY_URL` | URL of the current deploy |
| `DEPLOY_PRIME_URL` | Primary URL for the deploy |
| `URL` | Main site URL |
| `SITE_ID` | Netlify site ID |
| `SITE_NAME` | Site name |
| `BUILD_ID` | Unique build ID |
| `COMMIT_REF` | Git commit SHA |
| `BRANCH` | Git branch name |

### Testing Different Environments

```bash
# Run locally with production environment
netlify dev --context production

# Check what variables are available
netlify env:list
```

## Debugging Redirects

### Testing Redirects Locally

```bash
# netlify dev respects _redirects and netlify.toml
netlify dev
```

### Common Redirect Issues

```toml
# netlify.toml

# Order matters - first match wins
[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/api/:splat"
  status = 200

# SPA fallback (should be LAST)
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Debugging with Headers

```toml
# Add debug headers to see which rule matched
[[headers]]
  for = "/*"
  [headers.values]
    X-Debug = "true"
```

## Function Debugging

### Local Function Development

```bash
# Run functions locally with hot reload
netlify dev

# Functions available at:
# http://localhost:8888/.netlify/functions/function-name
```

### Debugging Timeouts

```typescript
// Check how long operations take
export default async (request: Request, context: Context) => {
  const start = Date.now();
  
  try {
    const result = await someOperation();
    console.log(`Operation took ${Date.now() - start}ms`);
    return Response.json(result);
  } catch (error) {
    console.error(`Failed after ${Date.now() - start}ms:`, error);
    throw error;
  }
};
```

### Memory Issues

```typescript
// Monitor memory usage
export default async (request: Request) => {
  const memBefore = process.memoryUsage();
  console.log("Memory before:", {
    heapUsed: Math.round(memBefore.heapUsed / 1024 / 1024) + "MB",
    heapTotal: Math.round(memBefore.heapTotal / 1024 / 1024) + "MB",
  });
  
  // ... your code ...
  
  const memAfter = process.memoryUsage();
  console.log("Memory after:", {
    heapUsed: Math.round(memAfter.heapUsed / 1024 / 1024) + "MB",
  });
  
  return new Response("OK");
};
```

## Edge Function Debugging

### Edge Function Logs

```bash
# View edge function logs
netlify logs:function --edge

# Or in the UI: Logs → Edge Functions
```

### Local Edge Function Testing

```bash
# Edge functions run locally with netlify dev
netlify dev

# Test specific paths configured in netlify.toml
```

## Deploy Previews

### Debugging Deploy Previews

1. Each PR gets a unique deploy preview URL
2. Check the deploy log for the specific PR
3. Test the preview URL to reproduce issues

```bash
# Get deploy preview URL
netlify deploy --build
# Outputs: Draft URL: https://abc123--sitename.netlify.app
```

## CLI Debugging Commands

```bash
# Check Netlify CLI status
netlify status

# View site info
netlify sites:list

# Check linked site
netlify link --status

# View current environment
netlify env:list

# Test function locally
netlify functions:invoke function-name --payload '{"key": "value"}'

# Open site dashboard
netlify open

# Open function logs
netlify open:logs
```

## Troubleshooting Checklist

### Build Failures

- [ ] Check build logs for error messages
- [ ] Verify `build.command` in `netlify.toml`
- [ ] Ensure all dependencies are in `package.json`
- [ ] Check Node.js version compatibility
- [ ] Try clearing cache and redeploying
- [ ] Test build locally with `netlify build`

### Function Issues

- [ ] Check function logs for errors
- [ ] Verify function file is in correct directory
- [ ] Check function naming (no spaces, correct extension)
- [ ] Verify environment variables are set
- [ ] Test locally with `netlify dev`
- [ ] Check for timeout issues (default 10s)

### Deployment Issues

- [ ] Verify publish directory is correct
- [ ] Check that build outputs files to publish directory
- [ ] Verify no `.gitignore` issues with built files
- [ ] Check deploy summary for warnings

### Environment Variable Issues

- [ ] Variables set in Netlify UI are available
- [ ] Check variable scopes (build vs. functions)
- [ ] Verify variable names match exactly (case-sensitive)
- [ ] Redeploy after adding new variables

## Log Drains (Advanced)

Send logs to external services:

```bash
# Configure log drain to external service
netlify logs:drain add --type http --destination https://logs.example.com/ingest

# List configured drains
netlify logs:drain list
```

## Performance Debugging

### Function Cold Starts

```typescript
// Measure cold start impact
let isWarm = false;

export default async (request: Request) => {
  if (!isWarm) {
    console.log("Cold start detected");
    isWarm = true;
  }
  
  // ... function logic
};
```

### Response Time Monitoring

```typescript
export default async (request: Request, context: Context) => {
  const startTime = performance.now();
  
  const response = await handleRequest(request);
  
  const duration = performance.now() - startTime;
  console.log(`Request processed in ${duration.toFixed(2)}ms`);
  
  return new Response(response.body, {
    ...response,
    headers: {
      ...response.headers,
      "X-Response-Time": `${duration.toFixed(2)}ms`,
    },
  });
};
```
