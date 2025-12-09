# 🚀 CI/CD Deployment Plan: GitHub Pages

> _"Automate the tedious. The pipeline should be invisible until it fails."_
> — The Tao of the Developer

This document outlines the complete plan for setting up Continuous Integration and Continuous Deployment (CI/CD) to publish the Portfolio SPA to GitHub Pages using Vite's build system.

---

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Implementation Tasks](#implementation-tasks)
4. [Configuration Details](#configuration-details)
5. [Testing the Deployment](#testing-the-deployment)
6. [Troubleshooting](#troubleshooting)

---

## Overview

### What We're Building

A GitHub Actions workflow that:

1. Triggers on push to `main` branch
2. Installs dependencies
3. Builds the Vite application
4. Deploys to GitHub Pages automatically

### The Deployment Flow

```
Developer pushes to main
        ↓
GitHub Actions triggered
        ↓
Checkout code
        ↓
Setup Node.js (v20)
        ↓
Install dependencies (npm ci)
        ↓
Build with Vite (npm run build)
        ↓
Upload dist/ as artifact
        ↓
Deploy to GitHub Pages
        ↓
Site live at https://username.github.io/portafolio-tailwind/
```

---

## Prerequisites

Before implementing, ensure:

- [ ] Repository is on GitHub
- [ ] You have push access to the repository
- [ ] `main` branch exists (or adjust workflow for your default branch)
- [ ] `package.json` has a `build` script: `"build": "vite build"`

---

## Implementation Tasks

### Task 1: Create GitHub Actions Workflow

**File:** `.github/workflows/deploy.yml`

Create this file in your repository root:

```yaml
# Deploy to GitHub Pages using Vite
name: Deploy to GitHub Pages

on:
 # Trigger on push to main branch
 push:
  branches: ['main']
 # Allow manual trigger from Actions tab
 workflow_dispatch:

# Sets permissions for GITHUB_TOKEN to allow deployment
permissions:
 contents: read
 pages: write
 id-token: write

# Allow only one concurrent deployment
concurrency:
 group: 'pages'
 cancel-in-progress: true

jobs:
 # Build job
 build:
  runs-on: ubuntu-latest
  steps:
   - name: Checkout
     uses: actions/checkout@v4

   - name: Setup Node.js
     uses: actions/setup-node@v4
     with:
      node-version: '20'
      cache: 'npm'

   - name: Install dependencies
     run: npm ci

   - name: Build with Vite
     run: npm run build

   - name: Setup Pages
     uses: actions/configure-pages@v4

   - name: Upload artifact
     uses: actions/upload-pages-artifact@v3
     with:
      path: './dist'

 # Deploy job
 deploy:
  environment:
   name: github-pages
   url: ${{ steps.deployment.outputs.page_url }}
  runs-on: ubuntu-latest
  needs: build
  steps:
   - name: Deploy to GitHub Pages
     id: deployment
     uses: actions/deploy-pages@v4
```

**Key Points:**

- Uses `actions/checkout@v4` (latest stable)
- Node.js 20 with npm cache for faster builds
- `npm ci` for reproducible installs
- Separate build and deploy jobs for clarity
- Concurrency control prevents multiple deployments

---

### Task 2: Update Vite Configuration

**File:** `vite.config.js`

**Current state:**

```javascript
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [tailwindcss()],
});
```

**Updated configuration:**

```javascript
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [tailwindcss()],
	// Base path for GitHub Pages
	// IMPORTANT: Replace 'portafolio-tailwind' with your actual repository name
	base: process.env.NODE_ENV === 'production' ? '/portafolio-tailwind/' : '/',
	build: {
		outDir: 'dist',
		// Ensure proper asset handling
		assetsDir: 'assets',
	},
});
```

**Critical:** The `base` path must match your repository name exactly:

- Repository: `username/portafolio-tailwind` → base: `'/portafolio-tailwind/'`
- Repository: `username/my-portfolio` → base: `'/my-portfolio/'`

**Why the base path?**
GitHub Pages serves your site from a subdirectory, not the root. Without the correct base path:

- Assets (CSS, JS) won't load
- Router navigation will break
- Images and fonts will 404

---

### Task 3: Handle View Templates

Your application dynamically loads HTML templates from `./src/views/*.html`. These need to be available in the production build.

**Option A: Use Vite's Public Directory (Recommended)**

Move view templates to `public/src/views/`:

```bash
mkdir -p public/src/views
cp src/views/*.html public/src/views/
```

Then update router template paths:

```javascript
// src/views/index.js
export const views = {
	'/': {
		templateId: 'view-home',
		templateUrl: '/src/views/home.html', // Absolute path from public/
		// ...
	},
};
```

**Option B: Use vite-plugin-static-copy**

Install the plugin:

```bash
npm install -D vite-plugin-static-copy
```

Update `vite.config.js`:

```javascript
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
	plugins: [
		tailwindcss(),
		viteStaticCopy({
			targets: [
				{
					src: 'src/views/*.html',
					dest: 'src/views',
				},
			],
		}),
	],
	base: process.env.NODE_ENV === 'production' ? '/portafolio-tailwind/' : '/',
});
```

**Option C: Use import.meta.env.BASE_URL (Best for Dynamic Paths)**

Update router to use Vite's base URL:

```javascript
// src/router.js - in ensureTemplateAvailable function
async function ensureTemplateAvailable(templateId, templateUrl) {
	if (document.getElementById(templateId)) return;
	if (!templateUrl || templateCache.has(templateId)) return;

	// Prepend base URL for production
	const baseUrl = import.meta.env.BASE_URL;
	const fullUrl = templateUrl.startsWith('/') ? `${baseUrl}${templateUrl.slice(1)}` : `${baseUrl}${templateUrl}`;

	const res = await fetch(fullUrl, { credentials: 'same-origin' });
	// ... rest of function
}
```

**Recommendation:** Use Option C for maximum flexibility.

---

### Task 4: Update Router Template Paths

**File:** `src/views/index.js`

Ensure template paths work in both development and production:

```javascript
// Option 1: Use absolute paths with BASE_URL
const BASE_URL = import.meta.env.BASE_URL;

export const views = {
	'/': {
		templateId: 'view-home',
		templateUrl: `${BASE_URL}src/views/home.html`,
		// ...
	},
};

// Option 2: Keep relative paths (works if templates are in public/)
export const views = {
	'/': {
		templateId: 'view-home',
		templateUrl: './src/views/home.html', // Relative to base URL
		// ...
	},
};
```

---

### Task 5: Enable GitHub Pages

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Pages**
3. Under **Source**, select **GitHub Actions** (not "Deploy from a branch")
4. Save settings

**Why GitHub Actions over branch deployment?**

- More control over build process
- Can run tests before deployment
- Better error messages
- Supports custom build steps

---

### Task 6: Update Documentation

**File:** `docs/ARCHITECTURE_GUIDE.md`

Add a new section after "4. The Lifecycle: Mount & Unmount Hooks":

```markdown
## 6. Deployment: CI/CD with GitHub Actions

> _"Automate the tedious. The pipeline should be invisible until it fails."_
> — The Tao of the Developer

### 6.1 The Deployment Pipeline

Our application uses GitHub Actions to automatically build and deploy to GitHub Pages:
```

Push to main
↓
GitHub Actions triggered
↓
Install dependencies (npm ci)
↓
Build with Vite (npm run build)
↓
Upload dist/ as artifact
↓
Deploy to GitHub Pages
↓
Site live at https://username.github.io/repo-name/

````

### 6.2 Key Configuration Points

| File | Purpose |
|------|---------|
| `.github/workflows/deploy.yml` | CI/CD pipeline definition |
| `vite.config.js` | Build configuration with `base` path |

### 6.3 The Base Path Problem

GitHub Pages serves your site from a subdirectory:
- **Local:** `http://localhost:5173/`
- **Production:** `https://user.github.io/portafolio-tailwind/`

**Solution:** Dynamic base path in Vite:

```javascript
base: process.env.NODE_ENV === 'production' ? '/repo-name/' : '/'
````

Without this, all asset paths break because the browser looks for:

- ❌ `https://user.github.io/assets/main.js` (wrong)
- ✅ `https://user.github.io/portafolio-tailwind/assets/main.js` (correct)

### 6.4 Template Loading in Production

Since our router dynamically loads HTML templates, we must ensure they're available in production:

1. **Option A:** Copy templates to `public/` directory
2. **Option B:** Use `vite-plugin-static-copy` to include them in build
3. **Option C:** Use `import.meta.env.BASE_URL` to construct correct paths

> _"The path that works in development must also work in production. Test the build locally before deploying."_
> — The Tao of the Developer

### Exercise 6: The Deployment Challenge

**Questions:**

1. Why do we use `npm ci` instead of `npm install` in CI?
2. What happens if `base` is not set correctly?
3. How would you add a staging environment that deploys to a different branch?
4. What would break if view templates aren't copied to `dist/`?

````

---

## Configuration Details

### Workflow Permissions Explained

```yaml
permissions:
  contents: read      # Read repository code
  pages: write        # Deploy to GitHub Pages
  id-token: write     # Required for OIDC authentication
````

### Why `npm ci` Instead of `npm install`?

| Command       | Use Case                                           |
| ------------- | -------------------------------------------------- |
| `npm install` | Development (updates `package-lock.json`)          |
| `npm ci`      | CI/CD (fails if `package-lock.json` doesn't match) |

`npm ci` ensures:

- Reproducible builds
- Faster installs (skips dependency resolution)
- Fails fast if dependencies are out of sync

### Concurrency Control

```yaml
concurrency:
 group: 'pages'
 cancel-in-progress: true
```

This ensures:

- Only one deployment runs at a time
- New pushes cancel in-progress deployments
- Prevents race conditions

---

## Testing the Deployment

### Step 1: Test Build Locally

```bash
# Build the project
npm run build

# Preview the production build
npm run preview
```

**Check:**

- [ ] All assets load correctly
- [ ] Router navigation works
- [ ] Templates load from correct paths
- [ ] No 404 errors in console

### Step 2: Test with Base Path

```bash
# Simulate GitHub Pages base path
npm run build
cd dist
python3 -m http.server 8080
# Visit http://localhost:8080/portafolio-tailwind/
```

**Check:**

- [ ] All assets load with base path
- [ ] Router handles base path correctly
- [ ] Templates load successfully

### Step 3: Test Workflow

1. Push to `main` branch
2. Go to **Actions** tab in GitHub
3. Watch workflow run
4. Check for errors in logs
5. Visit deployed site

---

## Troubleshooting

### Problem: Assets Return 404

**Symptoms:**

- CSS/JS files not loading
- Console shows 404 errors

**Solution:**

- Verify `base` path in `vite.config.js` matches repository name
- Check browser Network tab for actual request URLs
- Ensure base path has trailing slash: `'/repo-name/'`

### Problem: Templates Not Loading

**Symptoms:**

- Router shows "Template not found"
- 404 errors for `.html` files

**Solution:**

- Ensure templates are copied to `dist/` during build
- Check template paths use `import.meta.env.BASE_URL`
- Verify templates exist in `dist/src/views/` after build

### Problem: Router Navigation Breaks

**Symptoms:**

- Hash routes don't work
- Links navigate to wrong URLs

**Solution:**

- Check router uses correct base path
- Verify `history.pushState` uses correct base
- Test with `npm run preview` locally

### Problem: Workflow Fails

**Common Errors:**

| Error          | Solution                                             |
| -------------- | ---------------------------------------------------- |
| `npm ci` fails | Check `package-lock.json` is committed               |
| Build fails    | Check for TypeScript/lint errors                     |
| Deploy fails   | Verify Pages is enabled with "GitHub Actions" source |

### Debugging Workflow

1. Check **Actions** tab for failed runs
2. Click on failed job to see logs
3. Look for error messages in build step
4. Test locally with same Node version (v20)

---

## Directory Structure After Implementation

```
portafolio-tailwind/
├── .github/
│   └── workflows/
│       └── deploy.yml          ← NEW: GitHub Actions workflow
├── docs/
│   ├── ARCHITECTURE_GUIDE.md   ← UPDATED: Added deployment section
│   └── DEPLOYMENT_PLAN.md      ← NEW: This file
├── public/
│   └── src/
│       └── views/              ← NEW: If using Option A for templates
├── src/
│   └── ...
├── dist/                       ← Generated by build (gitignored)
├── vite.config.js              ← UPDATED: Added base path
└── package.json
```

---

## Pre-Deployment Checklist

Before your first deployment:

- [ ] `.github/workflows/deploy.yml` created
- [ ] `vite.config.js` has correct `base` path
- [ ] Template paths handle base URL correctly
- [ ] Local build succeeds: `npm run build`
- [ ] Local preview works: `npm run preview`
- [ ] GitHub Pages enabled with "GitHub Actions" source
- [ ] Repository name matches `base` path in config
- [ ] All view templates are accessible in production build

---

## Next Steps

1. **Implement the workflow** (Task 1)
2. **Update Vite config** (Task 2)
3. **Handle templates** (Task 3)
4. **Test locally** (Testing section)
5. **Push to main** and watch it deploy!

---

## Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html#github-pages)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)

---

> _"The first deployment is always the hardest. After that, it becomes routine. Automate the routine."_
> — The Tao of the Developer

---

_Plan created for educational purposes. May your deployments be smooth._ 🚀
