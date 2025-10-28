// demo/src/main.js
import { SimpleRouter } from './router.js';
import './style.css';
import { views } from './views/index.js';


new SimpleRouter(views);

// Desplazamiento suave opcional para anclas en la página que no son enlaces del router
document.addEventListener('click', (e) => {
	const link = e.target.closest('a[href^="#"]');
	if (!link) return;
	const href = link.getAttribute('href');
	if (href.startsWith('#/')) return; // enlace del router
	const target = document.querySelector(href);
	if (target) {
		e.preventDefault();
		target.scrollIntoView({ behavior: 'smooth', block: 'start' });
	}
});
