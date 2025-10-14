import './style.css'
import SimpleRouter from './router.js';
import { views } from './views.js';

// Inicializar router
const router = new SimpleRouter(views);

// Opcional: Añadir scroll suave para enlaces ancla
/*
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
	anchor.addEventListener('click', function (e) {
		e.preventDefault();
		const target = document.querySelector(this.getAttribute('href'));
		if (target) {
			target.scrollIntoView({
				behavior: 'smooth',
				block: 'start',
			});
		}
	});
});
*/

