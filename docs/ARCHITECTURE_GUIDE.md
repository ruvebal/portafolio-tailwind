# 🎓 Portfolio SPA — Architecture Guide

> _"The master developer writes code that explains itself, but documents the **why** behind the decisions."_
> — The Tao of the Developer

This guide explains the architecture of our Single Page Application (SPA) portfolio, covering four interconnected systems: **Tailwind CSS styling**, **hash-based routing**, **GSAP animations**, and **lifecycle management**.

---

## Table of Contents

1. [The Styling System: Tailwind CSS 4](#1-the-styling-system-tailwind-css-4)
2. [The Router: Hash-Based Navigation](#2-the-router-hash-based-navigation)
3. [The Animation Engine: GSAP & ScrollTrigger](#3-the-animation-engine-gsap--scrolltrigger)
4. [The Lifecycle: Mount & Unmount Hooks](#4-the-lifecycle-mount--unmount-hooks)
5. [Critical Thinking Exercises](#5-critical-thinking-exercises)

---

## 1. The Styling System: Tailwind CSS 4

> _"A thousand utility classes, yet they flow as one stream. The wise developer names things by their purpose, not their appearance."_
> — The Tao of the Developer

### 1.1 What is Tailwind CSS?

Tailwind is a **utility-first CSS framework**. Instead of writing custom CSS, you compose styles directly in your HTML using pre-defined classes.

```html
<!-- Traditional CSS approach -->
<button class="my-button">Click me</button>
<style>
	.my-button {
		background-color: blue;
		color: white;
		padding: 0.5rem 1rem;
		border-radius: 0.25rem;
	}
</style>

<!-- Tailwind approach -->
<button class="bg-blue-500 text-white px-4 py-2 rounded">Click me</button>
```

**Why utility-first?**

- No context-switching between HTML and CSS files
- No inventing class names like `.card-wrapper-inner-container`
- Styles are **co-located** with the markup they affect
- Dead CSS elimination is automatic

### 1.2 The Modular CSS Architecture (Barrel Pattern)

Our project organizes CSS using a **barrel pattern** — a single entry point that imports all modules:

```
src/styles/
├── index.css              ← Entry point (the "barrel")
├── theme.css              ← Tailwind 4 @theme configuration
└── tokens/
    ├── typography.css     ← Font sizes, line heights
    ├── colors.css         ← Light mode palette
    ├── colors-dark.css    ← Dark mode overrides
    └── spacing.css        ← Spacing, radius, shadows
```

> _"Separate what changes for different reasons. Colors change with branding. Typography changes with readability concerns. They should live apart."_
> — The Tao of the Developer

#### The Entry Point (`index.css`)

```css
/* Import order matters! */
@import 'tailwindcss'; /* 1. Base framework */
@import './theme.css'; /* 2. Theme configuration */
@import './tokens/typography.css'; /* 3. Design tokens */
@import './tokens/colors.css';
@import './tokens/colors-dark.css';
@import './tokens/spacing.css';
```

**Critical Question:** _Why does import order matter?_

Answer: Later imports can override earlier ones. Tailwind's base styles must come first so our tokens can build upon them.

### 1.3 Design Tokens: The Single Source of Truth

Design tokens are **named values** that represent design decisions:

```css
/* tokens/colors.css */
@layer base {
	:root {
		--color-primary: #0052a3; /* ← The token */
		--color-primary-foreground: #ffffff;
	}
}
```

We then **reference** these tokens in Tailwind's `@theme` block:

```css
/* theme.css */
@theme {
	--color-primary: var(--color-primary); /* Tailwind reads this */
}
```

**The Result:** You can use `bg-primary` and `text-primary` classes anywhere!

```html
<button class="bg-primary text-primary-foreground">This button uses our design tokens</button>
```

### 1.4 Dark Mode: The CSS Variable Swap

Dark mode works by **redefining CSS variables** under a `.dark` class:

```css
/* Light mode (default) */
:root {
	--color-background: #e5e7eb; /* Light gray */
	--color-foreground: #0f172a; /* Dark text */
}

/* Dark mode */
.dark {
	--color-background: #0a0a0a; /* Near black */
	--color-foreground: #fafafa; /* Light text */
}
```

When JavaScript toggles the `dark` class on `<html>`:

```javascript
document.documentElement.classList.toggle('dark');
```

All components using `bg-background` and `text-foreground` automatically update!

> _"The wise system changes many things by changing one thing."_
> — The Tao of the Developer

---

## 2. The Router: Hash-Based Navigation

> _"The URL is a contract with the user. Break it, and they cannot return to where they were."_
> — The Tao of the Developer

### 2.1 What is Hash-Based Routing?

In a Single Page Application, we don't reload the page when navigating. Instead, we:

1. Listen to URL changes
2. Swap content dynamically
3. Update browser history

**Hash-based routing** uses the URL fragment (`#`) for navigation:

```
https://mysite.com/#/about    ← Route: /about
https://mysite.com/#/contact  ← Route: /contact
https://mysite.com/#/#gallery ← Route: / with section: gallery
```

**Why the hash?**

- The browser doesn't send hash changes to the server
- No server configuration needed
- Works on static hosting (GitHub Pages, Netlify)

### 2.2 The SimpleRouter Class

```javascript
export class SimpleRouter {
	constructor(routes) {
		this.routes = routes;
		this.currentView = null;

		// Listen for navigation events
		window.addEventListener('hashchange', () => this.handleRoute());
		window.addEventListener('load', () => this.handleRoute());
	}
}
```

**The Event Flow:**

```
User clicks link (#/about)
        ↓
Browser fires 'hashchange' event
        ↓
Router calls handleRoute()
        ↓
Router finds matching route config
        ↓
Router calls onUnmount() on previous view
        ↓
Router fetches and renders new template
        ↓
Router calls onMount() on new view
```

### 2.3 Route Configuration

Routes are defined as a plain object:

```javascript
export const views = {
	'/': {
		templateId: 'view-home',
		templateUrl: './src/views/home.html',
		onMount: (container) => {
			initScrollView(container); // Initialize animations
		},
		onUnmount: () => {
			cleanupScrollView(); // Cleanup animations
		},
	},
	'/about': {
		templateId: 'view-about',
		templateUrl: './src/views/about.html',
	},
	404: {
		templateId: 'view-404',
		templateUrl: './src/views/404.html',
	},
};
```

**Anatomy of a Route:**

| Property      | Purpose                         |
| ------------- | ------------------------------- |
| `templateId`  | ID of the `<template>` element  |
| `templateUrl` | Path to load template from      |
| `onMount`     | Function called after rendering |
| `onUnmount`   | Function called before leaving  |

### 2.4 Handling Section Navigation

A challenge: How do we combine hash routing (`#/about`) with in-page anchors (`#gallery`)?

**Solution:** Parse the hash into route + section:

```javascript
async handleRoute() {
  const fullHash = window.location.hash.slice(1) || '/';
  // "/#gallery" → route: "/", section: "gallery"
  const [routeHash, sectionHash] = fullHash.split('#');
  const hash = routeHash || '/';

  // Navigate to route...

  // Then scroll to section if specified
  if (sectionHash) {
    const section = document.querySelector(`#${sectionHash}`);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
```

> _"When two systems must coexist, find the seam where they can communicate."_
> — The Tao of the Developer

---

## 3. The Animation Engine: GSAP & ScrollTrigger

> _"Animation without purpose is decoration. Animation with purpose is communication."_
> — The Tao of the Developer

### 3.1 What is GSAP?

**GSAP** (GreenSock Animation Platform) is a professional-grade JavaScript animation library. It provides:

- Smooth, performant animations
- Timeline sequencing
- Scroll-based triggers
- Plugin ecosystem

### 3.2 Registering Plugins

GSAP uses a plugin architecture. We register plugins once at module load:

```javascript
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
```

| Plugin           | Purpose                                     |
| ---------------- | ------------------------------------------- |
| `ScrollTrigger`  | Trigger animations based on scroll position |
| `ScrollToPlugin` | Smooth scroll to elements                   |

### 3.3 The Fade-Up Animation

Elements with `data-animate="fade-up"` animate into view:

```javascript
initFadeUp(container) {
  const elements = gsap.utils.toArray(
    container.querySelectorAll('[data-animate="fade-up"]')
  );

  elements.forEach((el) => {
    // Initial state: invisible, shifted down
    gsap.set(el, { opacity: 0, y: 40 });

    // Animate to: visible, original position
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: el,           // Element that triggers
        start: 'top 85%',      // When top hits 85% viewport
        toggleActions: 'play none none none'
      }
    });
  });
}
```

**In HTML:**

```html
<h2 data-animate="fade-up">This heading fades up when scrolled into view</h2>
```

### 3.4 The Parallax Effect

Parallax creates depth by moving elements at different speeds:

```javascript
initParallax(container) {
  container.querySelectorAll('[data-parallax]').forEach((el) => {
    const speed = parseFloat(el.dataset.parallax) || 0.2;

    gsap.to(el, {
      yPercent: -100 * speed,  // Move up as user scrolls down
      ease: 'none',            // Linear movement
      scrollTrigger: {
        trigger: el.parentElement,
        start: 'top bottom',   // Begin when parent enters
        end: 'bottom top',     // End when parent leaves
        scrub: true            // Link to scroll position
      }
    });
  });
}
```

**In HTML:**

```html
<div class="relative overflow-hidden">
	<img data-parallax="0.3" src="background.jpg" alt="Parallax background" />
</div>
```

**Understanding `scrub: true`:**

| scrub value | Behavior                                     |
| ----------- | -------------------------------------------- |
| `false`     | Animation plays once when triggered          |
| `true`      | Animation position matches scroll position   |
| `0.5`       | Animation follows scroll with 0.5s smoothing |

### 3.5 Staggered Card Reveals

Multiple elements reveal with a cascading delay:

```javascript
initProjectCards(container) {
  const cards = container.querySelectorAll('.project-card');

  // Initial state
  gsap.set(cards, { y: 50, opacity: 0 });

  // Batch animation with stagger
  ScrollTrigger.batch(cards, {
    onEnter: (batch) => {
      gsap.to(batch, {
        y: 0,
        opacity: 1,
        duration: 0.7,
        stagger: 0.12,  // 120ms delay between each
        ease: 'power2.out'
      });
    },
    start: 'top 90%',
    once: true  // Only animate once
  });
}
```

> _"The stagger is the rhythm. Too fast feels chaotic. Too slow feels sluggish. Find the breath between each beat."_
> — The Tao of the Developer

### 3.6 Respecting User Preferences

Always check for reduced motion preference:

```javascript
const config = {
  reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches
};

init(container) {
  if (config.reducedMotion) {
    console.log('⚠️ Reduced motion detected — animations disabled');
    this.showAllElements(container);  // Show without animation
    return;
  }
  // ... proceed with animations
}
```

**Why this matters:**

- Some users experience motion sickness
- Accessibility is not optional
- The OS provides this preference — respect it!

---

## 4. The Lifecycle: Mount & Unmount Hooks

> _"Every resource acquired must be released. Every listener attached must be detached. This is the way of no memory leaks."_
> — The Tao of the Developer

### 4.1 The Problem

In a SPA, views are dynamically created and destroyed. Without proper cleanup:

- Event listeners accumulate
- Animations run on removed elements
- Memory usage grows indefinitely

### 4.2 The Solution: Lifecycle Hooks

```javascript
// Route definition with lifecycle hooks
'/': {
  templateId: 'view-home',
  templateUrl: './src/views/home.html',
  onMount: (container) => {
    // Called AFTER the view is rendered
    initScrollView(container);
  },
  onUnmount: () => {
    // Called BEFORE navigating away
    cleanupScrollView();
  }
}
```

**The Flow:**

```
Navigate to /about
        ↓
Router calls home.onUnmount()
        ↓
cleanupScrollView() runs:
  - ScrollTrigger.getAll().forEach(t => t.kill())
  - gsap.killTweensOf('*')
        ↓
Router renders about.html
        ↓
Router calls about.onMount() (if defined)
```

### 4.3 The Cleanup Function

```javascript
export function cleanupScrollView() {
	// Kill all ScrollTrigger instances
	ScrollTrigger.getAll().forEach((trigger) => trigger.kill());

	// Stop all GSAP animations
	gsap.killTweensOf('*');

	console.log('🧹 Scroll view cleaned up');
}
```

### 4.4 Event Listener Management

The navigation module tracks its event listeners for cleanup:

```javascript
const navigation = {
	eventListeners: [], // Track all listeners

	initSmoothScroll(container) {
		const clickHandler = (e) => {
			/* ... */
		};

		anchor.addEventListener('click', clickHandler);

		// Store reference for later cleanup
		this.eventListeners.push({
			element: anchor,
			event: 'click',
			handler: clickHandler,
		});
	},

	destroy() {
		// Remove all stored listeners
		this.eventListeners.forEach(({ element, event, handler }) => {
			element.removeEventListener(event, handler);
		});
		this.eventListeners = [];
	},
};
```

> _"The novice adds listeners. The journeyman removes listeners. The master tracks listeners from the moment of their creation."_
> — The Tao of the Developer

---

## 5. Deployment: CI/CD with GitHub Actions

> _"Automate the tedious. The pipeline should be invisible until it fails."_
> — The Tao of the Developer

### 5.1 The Deployment Pipeline

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
```

### 5.2 Key Configuration Points

| File                           | Purpose                              |
| ------------------------------ | ------------------------------------ |
| `.github/workflows/deploy.yml` | CI/CD pipeline definition            |
| `vite.config.js`               | Build configuration with `base` path |

### 5.3 The Base Path Problem

GitHub Pages serves your site from a subdirectory:

- **Local:** `http://localhost:5173/`
- **Production:** `https://user.github.io/portafolio-tailwind/`

**Solution:** Dynamic base path in Vite:

```javascript
base: process.env.NODE_ENV === 'production' ? '/repo-name/' : '/';
```

Without this, all asset paths break because the browser looks for:

- ❌ `https://user.github.io/assets/main.js` (wrong)
- ✅ `https://user.github.io/portafolio-tailwind/assets/main.js` (correct)

### 5.4 Template Loading in Production

Since our router dynamically loads HTML templates, we must ensure they're available in production:

1. **Option A:** Copy templates to `public/` directory
2. **Option B:** Use `vite-plugin-static-copy` to include them in build
3. **Option C:** Use `import.meta.env.BASE_URL` to construct correct paths

> _"The path that works in development must also work in production. Test the build locally before deploying."_
> — The Tao of the Developer

### 5.5 Why `npm ci` in CI/CD?

| Command       | Use Case                                           |
| ------------- | -------------------------------------------------- |
| `npm install` | Development (updates `package-lock.json`)          |
| `npm ci`      | CI/CD (fails if `package-lock.json` doesn't match) |

`npm ci` ensures:

- Reproducible builds
- Faster installs (skips dependency resolution)
- Fails fast if dependencies are out of sync

### 5.6 The Workflow Structure

```yaml
jobs:
 build:
  # Install, build, upload artifact
 deploy:
  # Deploy artifact to GitHub Pages
```

**Why separate jobs?**

- Clear separation of concerns
- Can add tests between build and deploy
- Easier to debug failures

> _"The pipeline that is easy to understand is easy to fix."_
> — The Tao of the Developer

**For complete deployment instructions, see:** [`docs/DEPLOYMENT_PLAN.md`](./DEPLOYMENT_PLAN.md)

---

## 6. Critical Thinking Exercises

### Exercise 1: The Token Challenge

Look at this code from `colors.css`:

```css
--color-primary: #0052a3;
--color-primary-foreground: #ffffff;
```

**Questions:**

1. Why do we have `-foreground` variants?
2. What happens if `primary` is changed to a light yellow?
3. How does the dark mode palette solve this problem?

### Exercise 2: The Router Mystery

Given this URL: `http://localhost:5173/#/about#team`

**Questions:**

1. What route will the router match?
2. What section will it scroll to?
3. What happens if we click a link to `#team` while on `/contact`?

### Exercise 3: The Animation Audit

```javascript
gsap.to(el, {
	opacity: 1,
	y: 0,
	duration: 0.8,
	ease: 'power2.out',
	scrollTrigger: {
		trigger: el,
		start: 'top 85%',
		toggleActions: 'play none none none',
	},
});
```

**Questions:**

1. What does `start: 'top 85%'` mean in plain English?
2. What do the four values in `toggleActions` represent?
3. Why use `power2.out` instead of `linear`?

### Exercise 4: The Memory Leak Hunt

```javascript
element.addEventListener('click', () => {
	console.log('clicked');
});
```

**Questions:**

1. Why is this code potentially problematic in a SPA?
2. How would you rewrite it to allow cleanup?
3. What pattern does our codebase use to solve this?

### Exercise 5: Design System Philosophy

> _"The system that survives is not the most complex, but the most adaptable."_

**Questions:**

1. Why did we split colors into separate files for light and dark mode?
2. What would happen if a designer asked for a "high contrast" theme?
3. How would you add a third theme (e.g., "sepia mode")?

### Exercise 6: The Deployment Challenge

**Questions:**

1. Why do we use `npm ci` instead of `npm install` in CI?
2. What happens if `base` is not set correctly in `vite.config.js`?
3. How would you add a staging environment that deploys to a different branch?
4. What would break if view templates aren't copied to `dist/` during build?

---

## Summary: The Four Pillars

| Pillar         | Technology           | Purpose                                    |
| -------------- | -------------------- | ------------------------------------------ |
| **Styling**    | Tailwind CSS 4       | Utility-first CSS with design tokens       |
| **Routing**    | SimpleRouter         | Hash-based navigation without page reloads |
| **Animation**  | GSAP + ScrollTrigger | Performant scroll-based animations         |
| **Lifecycle**  | onMount/onUnmount    | Resource management and cleanup            |
| **Deployment** | GitHub Actions       | Automated CI/CD to GitHub Pages            |

> _"Five streams, one river. The styling paints the interface. The router navigates the user. The animation guides attention. The lifecycle maintains harmony. The deployment automates the release. Together, they create the experience."_
> — The Tao of the Developer

---

## Further Reading

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [GSAP Documentation](https://gsap.com/docs/v3/)
- [ScrollTrigger Guide](https://gsap.com/docs/v3/Plugins/ScrollTrigger/)
- [MDN: History API](https://developer.mozilla.org/en-US/docs/Web/API/History_API)
- [WCAG: Motion Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/animation-from-interactions.html)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html#github-pages)
- [Deployment Plan](./DEPLOYMENT_PLAN.md) - Complete CI/CD setup guide

---

_Document created for educational purposes. May the code be with you._ 🙏
