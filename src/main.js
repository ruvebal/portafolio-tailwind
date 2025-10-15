// src/main.js
import SimpleRouter from './router.js';
import './style.css';
import { views } from './views.js';

// Initialize router
const router = new SimpleRouter(views);

// Optional: Smooth scroll for in-page anchors (hash links) WITHOUT breaking SPA routing
// We:
// 1) Use event delegation (single listener) to capture clicks on anchor tags.
// 2) Only handle hashes that point to in-page sections (e.g. #app, #footer).
// 3) Explicitly ignore router links that start with "#/" so hash-based routing continues to work.
document.addEventListener('click', (e) => {
	const link = e.target.closest('a[href^="#"]');
	if (!link) return; // Not a hash link
	const href = link.getAttribute('href');

	// Ignore SPA router links like "#/about" — let the router handle navigation
	if (href.startsWith('#/')) return;

	// Smooth-scroll to in-page target (e.g. #app)
	const target = document.querySelector(href);
	if (target) {
		e.preventDefault();
		target.scrollIntoView({ behavior: 'smooth', block: 'start' });
	}
});
