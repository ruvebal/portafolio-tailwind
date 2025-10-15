// src/router.js
class SimpleRouter {
	constructor(routes) {
		this.routes = routes;
		this.currentView = null;

		// Listen for hash changes
		window.addEventListener('hashchange', () => this.handleRoute());
		window.addEventListener('load', () => this.handleRoute());
	}

	handleRoute() {
		const hash = window.location.hash.slice(1) || '/';
		const route = this.routes[hash] || this.routes['404'];

		if (route !== this.currentView) {
			this.renderView(route);
			this.updateActiveNav(hash);
			this.currentView = route;
		}
	}

	renderView(route) {
		const app = document.getElementById('app');
		app.innerHTML = route.template;

		// Execute any view-specific JavaScript
		if (route.script) {
			route.script();
		}
	}

	updateActiveNav(currentHash) {
		// Only consider SPA router links that start with "#/".
		// This avoids touching in-page anchors like "#app" (skip links, section links).
		document.querySelectorAll('nav a[href^="#/"]').forEach((link) => {
			link.removeAttribute('aria-current');
		});

		// currentHash is like "/", "/about", ...
		// Build the full selector as `#${currentHash}` to match nav hrefs (e.g. href="#/about").
		const activeLink = document.querySelector(`nav a[href="#${currentHash}"]`);
		if (activeLink) {
			activeLink.setAttribute('aria-current', 'page');
		}
	}
}

export default SimpleRouter;
