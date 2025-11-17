## Dark Mode Implementation Guide for Tailwind CSS v3+

## A Critical Coding Approach

> This guide follows the Web Atelier methodology from [https://ruvebal.github.io/web-atelier-udit/methodology/en/](https://ruvebal.github.io/web-atelier-udit/methodology/en/).
> Each section moves through: **Exploration → Reflection → Conceptualization → Production → Exhibition**.
> The goal is not only to learn _how_ to implement dark mode, but to understand _why_ these decisions matter for users, culture, and ethics.

---

## 1. Introduction: Why Dark Mode as a Critical Design Decision

### Exploration

- Visit 3–5 websites that offer dark mode (e.g. code editors, blogs, dashboards).
- Observe:
  - How you activate dark mode (system vs. manual toggle).
  - Whether the change feels comfortable, jarring, or confusing.
  - What happens to contrast, focus states, and readability.

Take 3–4 bullet notes per site. You will use these later in your reflection.

### Reflection

Dark mode is not just a “cool theme”; it intersects with:

- **Accessibility**
  - Some users experience eye strain or photophobia with bright backgrounds.
  - Others find low-contrast dark themes _harder_ to read.
  - WCAG contrast rules apply in _both_ modes.
- **Culture and aesthetics**
  - Dark interfaces signal “professional”, “nocturnal”, “developer” or “cinematic” moods.
  - Light interfaces signal “editorial”, “paper-like”, “open”.
- **Energy & environment**
  - On OLED/AMOLED, darker pixels may reduce energy use (though actual impact varies).
- **User agency**
  - Dark mode is often framed as “user preference”, but you choose defaults and options.

Ask yourself:

- Who benefits from dark mode in my project?
- Who might be excluded if I design it poorly?

### Conceptualization

We will treat dark mode as part of **inclusive design**, not as a decorative afterthought:

- Provide at least one accessible light and one accessible dark palette.
- Allow users to express preference _and_ respect system settings where appropriate.
- Ensure the implementation degrades gracefully (works when JS fails).

### Tailwind and Versions

- This guide uses **Tailwind CSS v3.4+**.
- It also points toward **Tailwind v4** concepts (CSS-first, `@custom-variant`), so that your decisions today are easier to migrate later.

---

## 2. Method 1: System Preference (`darkMode: 'media'`)

Tailwind’s default dark mode uses the operating system setting via `prefers-color-scheme`.

### Exploration

1. In DevTools, emulate dark/light system preference:
   - Chrome: `DevTools → Rendering → Emulate CSS media feature → prefers-color-scheme`.
2. Observe your site switching styles when you use `dark:` variants.

### Reflection

Ethical questions:

- If the OS is set to dark, should the website always follow?
- What if a user shares a device? What if they changed the OS setting for a single app?

Technical details:

- `darkMode: 'media'` tells Tailwind to compile `dark:` variants into a `@media (prefers-color-scheme: dark)` block.
- The browser automatically applies the matching block depending on OS theme.

### Conceptualization

Use system preference when:

- You want **zero JavaScript**.
- You accept that users change OS settings to express preference.
- User control inside your site is _not critical_.

Be cautious when:

- Your audience may not know how to change OS preferences.
- You want to offer explicit control inside the UI.

### Example

```js
// tailwind.config.js
export default {
	darkMode: 'media', // default
	// ...
};
```

```html
<main class="bg-background text-foreground dark:bg-slate-900 dark:text-slate-50">
	<h1 class="text-3xl font-bold">Hello, world</h1>
</main>
```

**Critical analysis:**

- **Pros**: no JS, respects OS, progressive enhancement.
- **Cons**: no per-site override, assumes OS setting = user’s current intent.

---

## 3. Method 2: Manual Toggle with Class (`darkMode: 'class'`)

Here you control dark mode via a `dark` class on the root element.

### Exploration

We configure Tailwind and build a simple toggle.

```js
// tailwind.config.js
export default {
	darkMode: 'class', // look for a .dark class
	// ...
};
```

```html
<!-- index.html -->
<html lang="es" class="">
	<head>
		…
	</head>
	<body class="bg-background text-foreground">
		<button
			type="button"
			id="theme-toggle"
			class="px-4 py-2 rounded bg-primary text-primary-foreground"
			aria-pressed="false">
			Toggle theme
		</button>
		<!-- content -->
		<script type="module" src="/src/theme-toggle.js"></script>
	</body>
</html>
```

```js
// src/theme-toggle.js
function applyThemeFromStorage() {
	const saved = localStorage.getItem('theme');
	if (!saved) return;
	document.documentElement.classList.toggle('dark', saved === 'dark');
}

function toggleTheme() {
	const root = document.documentElement;
	const isDark = root.classList.toggle('dark');
	localStorage.setItem('theme', isDark ? 'dark' : 'light');

	const btn = document.querySelector('#theme-toggle');
	if (btn) {
		btn.setAttribute('aria-pressed', String(isDark));
	}
}

applyThemeFromStorage();

const btn = document.querySelector('#theme-toggle');
if (btn) {
	btn.addEventListener('click', toggleTheme);
}
```

And in your HTML/CSS utilities:

```html
<div class="bg-background text-foreground dark:bg-slate-900 dark:text-slate-50">
	<p>Theme-aware content</p>
</div>
```

Copy this structure into your src/style.css to get light/dark tokens that match your Tailwind config.

```css
/* src/style.css: Color definitions example */

@layer base {
	:root {
		/* Light mode colors */
		--color-background: #c4c9ce;
		--color-foreground: #305261;

		--color-primary: #009ee0;
		--color-primary-foreground: #ffffff;

		--color-secondary: #e2007a;
		--color-secondary-foreground: #ffffff;

		--color-accent: #ffed00;
		--color-accent-foreground: #251260;

		--color-muted: #615130;
		--color-muted-foreground: #475569;

		--color-border: #e2e8f0;
		--color-input: #e2e8f0;
		--color-ring: #6779c7;

		--color-destructive: #e05100;
		--color-destructive-foreground: #ffffff;
	}

	.dark {
		/* Dark mode overrides */
		--color-background: #18181b;
		--color-foreground: #fafafa;

		--color-primary: #7dd3fc;
		--color-primary-foreground: #0c0a09;

		--color-secondary: #f472b6;
		--color-secondary-foreground: #0c0a09;

		--color-accent: #fde68a;
		--color-accent-foreground: #292524;

		--color-muted: #334155;
		--color-muted-foreground: #cbd5e1;

		--color-border: #334155;
		--color-input: #475569;
		--color-ring: #a5b4fc;

		--color-destructive: #ef4444;
		--color-destructive-foreground: #fafafa;
	}
}
```

### Reflection

Behind the scenes:

- `documentElement.classList.toggle('dark')` changes the root’s class list.
- All `dark:` utilities now apply because Tailwind compiled them into `.dark .some-class`.
- If JS fails:
  - The site remains in whichever mode the root had initially (often light).

Ethical questions:

- Are we clear with users about what this toggle does?
- Do we provide a way back to “follow system” (instead of forcing a choice forever)?

### Conceptualization

This pattern is about **user agency**:

- The site no longer blindly follows the OS.
- Responsibility: you now must handle persistence and edge cases.

### Critical analysis

- **Pros**: Full control, simple mental model, works with any markup.
- **Cons**: Requires JS, can cause FOUC, can conflict with other `.dark` usages if not scoped carefully.

---

## 4. Method 3: Selector-Based (`darkMode: ['selector', '[data-theme="dark"]']`)

This is the more semantic, v4-aligned approach.

### Exploration

Configure Tailwind to look for a specific selector:

```js
// tailwind.config.js
export default {
	darkMode: ['selector', '[data-theme="dark"]'],
	// ...
};
```

In HTML:

```html
<html lang="es" data-theme="light">
	<body class="bg-background text-foreground">
		<!-- ... -->
	</body>
</html>
```

JS toggle:

```js
// src/theme-toggle-data-theme.js
function resolveInitialTheme() {
	const saved = localStorage.getItem('theme');
	if (saved === 'dark' || saved === 'light') return saved;
	const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
	return prefersDark ? 'dark' : 'light';
}

function applyTheme(theme) {
	document.documentElement.setAttribute('data-theme', theme);
	localStorage.setItem('theme', theme);
}

(function initTheme() {
	applyTheme(resolveInitialTheme());
})();

const btn = document.querySelector('#theme-toggle');
if (btn) {
	btn.addEventListener('click', () => {
		const current = document.documentElement.getAttribute('data-theme') ?? 'light';
		applyTheme(current === 'dark' ? 'light' : 'dark');
	});
}
```

Using the variant:

```html
<div class="bg-background text-foreground [data-theme=\"dark\"]:bg-slate-950 [data-theme=\"dark\"]:text-slate-50">
  <p>Theme-aware content</p>
</div>
```

### Reflection

Why attributes?

- `data-theme` expresses _state_ (“this document is in dark theme”).
- Classes can remain focused on styling or component roles.
- This mirrors how many design systems manage state (e.g. `data-state`, `data-color-mode`).

### Conceptualization

Selector-based dark mode fits **design systems and component libraries**:

- It avoids accidental collisions with unrelated `.dark` classes.
- It maps cleanly to Tailwind v4’s CSS-first philosophy (where `@custom-variant` can define variants using selectors).

### Critical analysis

- **Pros**: Semantic, scalable, v4-ready, low risk of class conflicts.
- **Cons**: Slightly more verbose syntax in HTML, requires understanding of attribute selectors.

---

## 5. JavaScript Implementation: Robust Theme Management

Here we put everything together with a robust, ethical defaulting strategy.

### Exploration

We’ll implement:

1. Preference resolution: `localStorage` → `prefers-color-scheme` → fallback.
2. Immediate application to avoid FOUC.
3. A toggle that updates both `data-theme` and ARIA state.

```html
<!-- index.html head snippet -->
<script>
	(function () {
		try {
			const stored = localStorage.getItem('theme');
			const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
			const theme = stored || (systemPrefersDark ? 'dark' : 'light');
			document.documentElement.setAttribute('data-theme', theme);
		} catch (e) {
			// If anything fails (e.g. storage blocked), fall back to light
			document.documentElement.setAttribute('data-theme', 'light');
		}
	})();
</script>
```

Later, in a module:

```js
// src/theme-toggle-full.js
function getCurrentTheme() {
	return document.documentElement.getAttribute('data-theme') ?? 'light';
}

function setTheme(theme) {
	document.documentElement.setAttribute('data-theme', theme);
	try {
		localStorage.setItem('theme', theme);
	} catch {
		// Storage might be disabled; we fail silently but theme still works for this session
	}
}

export function initThemeToggle(buttonSelector = '#theme-toggle') {
	const btn = document.querySelector(buttonSelector);
	if (!btn) return;

	const syncButtonState = () => {
		const isDark = getCurrentTheme() === 'dark';
		btn.setAttribute('aria-pressed', String(isDark));
		btn.textContent = isDark ? 'Switch to light mode' : 'Switch to dark mode';
	};

	btn.addEventListener('click', () => {
		const current = getCurrentTheme();
		setTheme(current === 'dark' ? 'light' : 'dark');
		syncButtonState();
	});

	syncButtonState();
}
```

### Reflection

Think through:

- What happens if localStorage is blocked? (Answer: theme falls back to system / default; you still function.)
- What if JS fails to load? (Answer: you get the `data-theme` set by the head script or your static HTML.)

You are designing a **resilient** system, not just “making it work on your machine”.

### Conceptualization

- This is progressive enhancement: the site is usable without JS, and _improved_ with JS.
- You balance:
  - User preference.
  - System preference.
  - Sensible fallback.

---

## 6. Integrating with Existing Color Tokens (`src/style.css`)

Your project already uses design tokens via CSS custom properties. Dark mode simply changes their values.

We will show both:

- Method A: `.dark` class.
- Method B: `[data-theme="dark"]` attribute.

### Exploration

Current light-mode tokens (simplified from `src/style.css`):

```css
@layer base {
	:root {
		/* Typography tokens omitted for brevity */

		/* Light mode color tokens */
		--color-background: #c4c9ce;
		--color-foreground: #305261;
		--color-card: #bbbfc4;
		--color-card-foreground: var(--color-foreground);
		--color-popover: #ffffff;
		--color-popover-foreground: var(--color-foreground);

		--color-primary: #009ee0;
		--color-primary-foreground: #ffffff;

		--color-secondary: #e2007a;
		--color-secondary-foreground: #ffffff;

		--color-accent: #ffed00;
		--color-accent-foreground: #251260;

		--color-muted: #615130;
		--color-muted-foreground: #475569;
		--color-muted-foreground-rgb: 71, 85, 105;

		--color-border: #e2e8f0;
		--color-input: #e2e8f0;
		--color-ring: #6779c7;

		--color-destructive: #e05100;
		--color-destructive-foreground: #ffffff;
	}
}
```

### Reflection

Key idea:

- Components never use raw hex values directly.
- They use semantics like `bg-background`, `text-foreground`, `bg-card`, etc.
  Tailwind maps those classes to `var(--color-*)` via `tailwind.config.js`.
- Dark mode should _only_ change `--color-*` values. Components just follow.

### Method A: Class-based (`darkMode: 'class'`)

```css
@layer base {
	:root {
		/* Light mode (same as before) */
		--color-background: #c4c9ce;
		--color-foreground: #305261;
		--color-card: #bbbfc4;
		--color-card-foreground: var(--color-foreground);
		--color-popover: #ffffff;
		--color-popover-foreground: var(--color-foreground);

		--color-primary: #009ee0;
		--color-primary-foreground: #ffffff;

		--color-secondary: #e2007a;
		--color-secondary-foreground: #ffffff;

		--color-accent: #ffed00;
		--color-accent-foreground: #251260;

		--color-muted: #615130;
		--color-muted-foreground: #475569;
		--color-muted-foreground-rgb: 71, 85, 105;

		--color-border: #e2e8f0;
		--color-input: #e2e8f0;
		--color-ring: #6779c7;

		--color-destructive: #e05100;
		--color-destructive-foreground: #ffffff;
	}

	.dark {
		/* Dark mode palette */
		--color-background: #1a1a2a;
		--color-foreground: #f8fafc;

		--color-card: #252238;
		--color-card-foreground: var(--color-foreground);

		--color-popover: #000000;
		--color-popover-foreground: var(--color-foreground);

		--color-primary: #e2007a; /* Magenta as primary */
		--color-primary-foreground: #ffffff;

		--color-secondary: #009ee0; /* Cyan as secondary */
		--color-secondary-foreground: #ffffff;

		--color-accent: #ffed00;
		--color-accent-foreground: #251260;

		--color-muted: #305261;
		--color-muted-foreground: #94a3b8;
		--color-muted-foreground-rgb: 148, 163, 184;

		--color-border: #334155;
		--color-input: #334155;
		--color-ring: #6779c7;

		--color-destructive: #e05100;
		--color-destructive-foreground: #ffffff;
	}
}
```

**How it works**:

- When `<html class="dark">` is present, the `.dark` block overrides `:root` variables.
- Tailwind’s `bg-background` → `background-color: var(--color-background)` will now use the dark value.

### Method B: Data-attribute (`darkMode: ['selector', '[data-theme="dark"]']`)

If you choose the selector-based method, the CSS is almost identical, only the selector changes:

```css
@layer base {
	:root {
		/* Light mode (same as before) */
		--color-background: #c4c9ce;
		--color-foreground: #305261;
		--color-card: #bbbfc4;
		--color-card-foreground: var(--color-foreground);
		--color-popover: #ffffff;
		--color-popover-foreground: var(--color-foreground);

		--color-primary: #009ee0;
		--color-primary-foreground: #ffffff;

		--color-secondary: #e2007a;
		--color-secondary-foreground: #ffffff;

		--color-accent: #ffed00;
		--color-accent-foreground: #251260;

		--color-muted: #615130;
		--color-muted-foreground: #475569;
		--color-muted-foreground-rgb: 71, 85, 105;

		--color-border: #e2e8f0;
		--color-input: #e2e8f0;
		--color-ring: #6779c7;

		--color-destructive: #e05100;
		--color-destructive-foreground: #ffffff;
	}

	[data-theme='dark'] {
		/* Dark mode palette (same as in .dark example) */
		--color-background: #1a1a2a;
		--color-foreground: #f8fafc;

		--color-card: #252238;
		--color-card-foreground: var(--color-foreground);

		--color-popover: #000000;
		--color-popover-foreground: var(--color-foreground);

		--color-primary: #e2007a;
		--color-primary-foreground: #ffffff;

		--color-secondary: #009ee0;
		--color-secondary-foreground: #ffffff;

		--color-accent: #ffed00;
		--color-accent-foreground: #251260;

		--color-muted: #305261;
		--color-muted-foreground: #94a3b8;
		--color-muted-foreground-rgb: 148, 163, 184;

		--color-border: #334155;
		--color-input: #334155;
		--color-ring: #6779c7;

		--color-destructive: #e05100;
		--color-destructive-foreground: #ffffff;
	}
}
```

**How it works**:

- When `<html data-theme="dark">` is present, the attribute rule overrides `:root` variables.
- Tailwind classes still read `var(--color-*)`, so components adapt automatically.

### Complete Token Mapping and Tailwind Config

In `tailwind.config.js`, you already map these variables:

```js
import { colors as defaultColors } from 'tailwindcss/defaultTheme';

export default {
	// darkMode can be 'media', 'class', or ['selector', '[data-theme="dark"]']
	theme: {
		colors: {
			...defaultColors,
			border: 'var(--color-border)',
			input: 'var(--color-input)',
			ring: 'var(--color-ring)',
			background: 'var(--color-background)',
			foreground: 'var(--color-foreground)',
			primary: {
				DEFAULT: 'var(--color-primary)',
				foreground: 'var(--color-primary-foreground)',
			},
			secondary: {
				DEFAULT: 'var(--color-secondary)',
				foreground: 'var(--color-secondary-foreground)',
			},
			destructive: {
				DEFAULT: 'var(--color-destructive)',
				foreground: 'var(--color-destructive-foreground)',
			},
			muted: {
				DEFAULT: 'var(--color-muted)',
				foreground: 'var(--color-muted-foreground)',
			},
			accent: {
				DEFAULT: 'var(--color-accent)',
				foreground: 'var(--color-accent-foreground)',
			},
			popover: {
				DEFAULT: 'var(--color-popover)',
				foreground: 'var(--color-popover-foreground)',
			},
			card: {
				DEFAULT: 'var(--color-card)',
				foreground: 'var(--color-card-foreground)',
			},
		},
	},
};
```

Because the mapping always goes through `var(--color-*)`, dark mode is purely a matter of changing those variables.

### Using Semantic Tokens in Components

Example button that automatically adapts:

```html
<button
	class="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md
         bg-primary text-primary-foreground hover:bg-primary/90
         focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
	Primary action
</button>
```

- In light mode, this uses the light palette.
- In dark mode, the same classes use the dark palette.

You may still use explicit dark variants where necessary:

```html
<section class="bg-background text-foreground dark:bg-card dark:text-card-foreground">…</section>
```

---

## 7. Accessibility & Best Practices: Ethics in Practice

### Exploration

Test your dark mode implementation with:

- Browser DevTools contrast checker.
- axe DevTools or WAVE.
- Screen readers (VoiceOver, NVDA, JAWS).
- Color-blindness simulators.
- High-contrast and reduced-motion OS settings.

### Reflection

Accessibility is not a bonus; it is a **requirement**:

- WCAG contrast:
  - 4.5:1 for normal text.
  - 3:1 for large text and UI components.
- Poor dark mode can harm users (eye strain, inability to read, disorientation).

Ask:

- Does my dark palette maintain required contrast?
- Are focus rings still visible in both modes?
- Does the theme toggle work with keyboard-only navigation and screen readers?

### Conceptualization

Inclusive design principles:

- Design for the edges, not just the “average” user.
- Dark mode is an accommodation for some, an aesthetic choice for others.
- Both experiences must be robust.

### Common Pitfalls

- Forgetting to style focus states in dark mode.
- Using pure black and pure white, leading to harsh contrast.
- Cryptic theme icons with no accessible label.
- FOUC when theme is applied late.

### Critical Exercise

Write a short accessibility checklist for your dark mode implementation. For each item, note:

- How you tested it.
- What you found.
- What you changed as a result.

---

## 8. Critical Analysis: When, Why, and When Not

### Exploration

Analyze at least three real-world sites:

- One with **excellent** dark mode.
- One with **problematic** dark mode.
- One that intentionally does **not** offer dark mode.

Take notes on:

- Palette, contrast, and motion.
- How the toggle is presented.
- Whether documentation explains the choice.

### Reflection

Design choices are political:

- Not offering dark mode might be justified by brand or artistic intent.
- Offering it poorly can be worse than not offering it at all.
- Implementation cost (time, complexity, QA) is also a factor.

### Conceptualization

Consider:

- Does your project truly benefit from dark mode?
- Who is your audience? Are they likely to need/expect it?
- How does it align with your brand identity and narrative?

### Critical Questions

- Does your project **need** dark mode? Justify in 5–10 sentences.
- What assumptions are you making about your users’ abilities, environments, and devices?
- What happens in your implementation when:
  - JS fails?
  - localStorage is unavailable?
  - The user switches OS theme mid-session?

### Progressive Enhancement

Even if you use JS toggles, ensure:

- A usable, high-contrast light theme works without JS.
- `prefers-color-scheme` can still act as a hint.

---

## 8.5. Quick Implementation Guide: Method 2 in Practice

### Real Implementation Experience

Based on implementing Method 2 (class-based dark mode) in this repository, here's a battle-tested step-by-step guide:

#### Step 1: Configure Tailwind (2 minutes)

Add `darkMode: 'class'` to your `tailwind.config.js`:

```js
/** @type {import('tailwindcss').Config} */
export default {
	content: ['./index.html', './src/**/*.{js,ts,jsx,tsx,html}'],
	darkMode: 'class', // Add this line
	theme: {
		// ... rest of your config
	},
};
```

#### Step 2: Add Dark Mode Color Tokens (5 minutes)

In `src/style.css`, add a `.dark` block after your `:root` colors:

```css
@layer base {
	:root {
		/* Your existing light mode colors */
		--color-background: #c4c9ce;
		--color-foreground: #305261;
		/* ... all your other tokens ... */
	}

	/* Dark mode overrides */
	.dark {
		--color-background: #1a1a2a;
		--color-foreground: #f8fafc;
		--color-card: #252238;
		--color-primary: #e2007a;
		--color-secondary: #009ee0;
		--color-accent: #ffed00;
		--color-muted: #305261;
		--color-muted-foreground: #94a3b8;
		--color-border: #334155;
		--color-input: #334155;
		--color-ring: #6779c7;
		--color-destructive: #e05100;
		/* Map all your tokens with dark-appropriate values */
	}
}
```

**Design tip**: For dark backgrounds, use `#1a1a2a` (deep blue-purple) instead of pure black for better readability.

#### Step 3: Create Theme Toggle Module (10 minutes)

Create `src/theme-toggle.js`:

```js
/**
 * Resolve initial theme: localStorage > system preference > default
 */
function resolveInitialTheme() {
	try {
		const stored = localStorage.getItem('theme');
		if (stored === 'dark' || stored === 'light') return stored;
	} catch (e) {
		console.warn('localStorage not available:', e);
	}

	const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
	return prefersDark ? 'dark' : 'light';
}

/**
 * Apply theme and persist
 */
function applyTheme(theme) {
	const root = document.documentElement;

	if (theme === 'dark') {
		root.classList.add('dark');
	} else {
		root.classList.remove('dark');
	}

	try {
		localStorage.setItem('theme', theme);
	} catch (e) {
		console.warn('localStorage not available:', e);
	}
}

/**
 * Toggle between themes
 */
function toggleTheme() {
	const current = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
	const newTheme = current === 'dark' ? 'light' : 'dark';
	applyTheme(newTheme);
	syncButtonState();
}

/**
 * Sync button ARIA state and content
 */
function syncButtonState() {
	const btn = document.querySelector('#theme-toggle');
	if (!btn) return;

	const isDark = document.documentElement.classList.contains('dark');
	btn.setAttribute('aria-pressed', String(isDark));
	btn.setAttribute('aria-label', isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro');

	const icon = isDark ? '☀️' : '🌙';
	const text = isDark ? 'Modo claro' : 'Modo oscuro';
	btn.innerHTML = `<span aria-hidden="true">${icon}</span> <span class="sr-only sm:not-sr-only">${text}</span>`;
}

/**
 * Initialize theme toggle
 */
export function initThemeToggle() {
	const initialTheme = resolveInitialTheme();
	applyTheme(initialTheme);

	const btn = document.querySelector('#theme-toggle');
	if (btn) {
		btn.addEventListener('click', toggleTheme);
		syncButtonState();
	}

	// Listen for system preference changes
	window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
		try {
			const stored = localStorage.getItem('theme');
			if (!stored) {
				applyTheme(e.matches ? 'dark' : 'light');
				syncButtonState();
			}
		} catch (err) {
			// Ignore localStorage errors
		}
	});
}
```

#### Step 4: Add Toggle Button to HTML (3 minutes)

In your navigation (`index.html`), add:

```html
<button
	type="button"
	id="theme-toggle"
	class="px-3 py-2 rounded-md bg-background text-foreground
	       hover:bg-background/80 focus:outline-none focus:ring-2
	       focus:ring-ring focus:ring-offset-2 transition-colors"
	aria-pressed="false"
	aria-label="Cambiar tema">
	🌙
	<span class="sr-only sm:not-sr-only">Modo oscuro</span>
</button>
```

**Accessibility note**: We use `aria-pressed` to indicate toggle state, and provide both icon and text labels.

#### Step 5: Initialize in Your App (1 minute)

In `src/main.js`, import and initialize:

```js
import { initThemeToggle } from './theme-toggle.js';

// After your other initializations
initThemeToggle();
```

#### Step 6: Test (5 minutes)

**Before testing, start your development server:**

```bash
npm run dev
```

Now follow these tests in order:

1. **Visual test**:

   - Click the theme toggle button in the navigation (right side, next to nav links)
   - All colors should invert smoothly
   - Button icon should change from 🌙 to ☀️ (or vice versa)

2. **Persistence test**:

   - Refresh the page (F5 or Cmd+R / Ctrl+R)
   - Theme should remain as you set it
   - Button state should match the current theme

3. **Keyboard accessibility test**:

   - Tab to the button with keyboard (Tab key)
   - Press Enter or Space to toggle
   - Theme should change and focus should remain on button
   - Button should be clearly visible with focus ring

4. **System preference test**:

   - Open browser console (F12 → Console tab)
   - Run: `localStorage.clear()`
   - Change your OS theme (System Settings → Appearance)
   - Reload the page
   - Site should now follow your OS preference

5. **Contrast check**:

   - Open Chrome DevTools (F12)
   - Go to Elements tab
   - Select any text element
   - Open the Accessibility pane (in the right sidebar)
   - Verify contrast ratios:
     - Normal text: minimum 4.5:1
     - Large text (18px+): minimum 3:1
   - Test in both light and dark modes

6. **Screen reader test** (optional but recommended):

   - Use VoiceOver (Mac) or NVDA (Windows)
   - Navigate to the toggle button
   - Verify ARIA labels are announced correctly
   - Toggle should announce current state ("pressed" or "not pressed")

7. **Edge case test**:
   - In DevTools, disable JavaScript (Settings → Preferences → Debugger → Disable JavaScript)
   - Reload page
   - Site should stay in light mode but remain fully usable
   - All content should be readable

### Common Pitfalls & Solutions

**Pitfall 1: FOUC (Flash of Unstyled Content)**

- **Problem**: You see light mode briefly before dark mode applies.
- **Solution**: Apply theme in `initThemeToggle()` immediately, before DOM is fully ready. The function runs as soon as the module loads.

**Pitfall 2: Toggle button state doesn't sync**

- **Problem**: Button shows wrong icon after toggle.
- **Solution**: Always call `syncButtonState()` after `applyTheme()`.

**Pitfall 3: Theme doesn't persist**

- **Problem**: Theme resets on refresh.
- **Solution**: Check that `localStorage.setItem()` is working. Some browsers block it in private mode. Our code handles this with try/catch.

**Pitfall 4: Poor contrast in dark mode**

- **Problem**: Text is hard to read.
- **Solution**: Test with Chrome DevTools contrast checker. Aim for 4.5:1 minimum. Avoid pure black (`#000`) backgrounds—use `#1a1a2a` instead.

### Time Investment

- **Setup**: 20-30 minutes for first implementation
- **Testing**: 10-15 minutes for thorough accessibility testing
- **Polish**: 5-10 minutes for adjusting colors to your brand

**Total**: ~1 hour for a production-ready dark mode.

### What You Get

✓ Smooth dark/light mode toggle
✓ Respects system preferences as default
✓ Persists user choice across sessions
✓ Fully keyboard accessible
✓ Screen reader compatible
✓ Graceful degradation without JS
✓ Automatic color token switching

---

## 9. Production: Implementing Dark Mode in Your Portfolio

Here we connect everything to your own project.

### Exploration (Step-by-step)

1. **Choose a strategy**: `media`, `class`, or `selector` (`[data-theme="dark"]`).
   For new projects, prefer the selector-based approach (v4-friendly).
2. **Configure Tailwind** accordingly.
3. **Extend `src/style.css`** with full dark-mode token mappings (using either `.dark` or `[data-theme="dark"]`).
4. **Build a toggle button** with:
   - Clear label.
   - Proper ARIA attributes (`aria-pressed`, accessible text).
5. **Implement JS**:
   - Resolve initial theme (localStorage → system → fallback).
   - Persist preference.
   - Avoid FOUC.
6. **Test**:
   - Accessibility.
   - Edge cases.

### Reflection

Document:

- Why you picked your strategy (media/class/selector).
- How your palette choices support readability and brand.
- What trade-offs you accepted (complexity vs. control).

### Conceptualization

Connect your implementation to:

- Course themes (critical coding, inclusive design).
- Professional workflows (commit messages, documentation, code review).

### Exhibition

- Commit your changes with a **reflective** commit message, e.g.:

  > `feat(theme): implement dark mode via data-theme selector` > `Aligns with Tailwind v4 patterns, uses CSS tokens for palette.` > `Tested contrast in both modes and verified toggle with VoiceOver.`

- Prepare 3–5 screenshots or a short screencast demonstrating:
  - Before/after.
  - Toggle in action.
  - Accessibility tools in use.

---

## 10. Migration Path to Tailwind v4

Tailwind v4 moves configuration into CSS and encourages `@custom-variant` for variants.

Conceptually:

- Your **selector-based** dark mode already aligns with:
  - `@custom-variant dark (&[data-theme="dark"] &);`
  - CSS-first workflows.
- Your **token-based** palette (`--color-*`) works naturally with any future tooling.

When migrating:

- Re-express `dark` as a custom variant using the same `[data-theme="dark"]` selector.
- Keep the same CSS variables; only wiring changes.

---

## Implementation Notes (Critical Coding Methodology)

- This guide is designed for incremental, project-based learning: one student, one repo, one evolving portfolio.
- Each section intentionally blends:
  - **Exploration**: trying things hands-on.
  - **Reflection**: asking why they work and who they affect.
  - **Conceptualization**: connecting code to design and ethics.
  - **Production**: implementing in your own repository.
  - **Exhibition**: publishing and documenting your work.
- Use this guide not only to “get dark mode done”, but to:
  - Practice writing meaningful commit messages.
  - Practice documenting design decisions.
  - Build an accessible, maintainable, and ethically considered interface.
