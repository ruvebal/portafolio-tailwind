// src/router.js
class SimpleRouter {
	constructor(routes) {
		this.routes = routes;
		this.currentView = null;

		// Escuchar cambios de hash
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

		// Ejecutar JavaScript específico de la vista
		if (route.script) {
			route.script();
		}
	}

	updateActiveNav(currentHash) {
		// Remover aria-current de todos los enlaces de navegación
		document.querySelectorAll('nav a').forEach((link) => {
			link.removeAttribute('aria-current');
		});

		// Añadir aria-current al enlace activo
		const activeLink = document.querySelector(`nav a[href="${currentHash}"]`);
		if (activeLink) {
			activeLink.setAttribute('aria-current', 'page');
		}
	}
}

export default SimpleRouter;

