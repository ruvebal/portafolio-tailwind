// src/views/index.js
import notFound from './404.js';
import about from './about.js';
import components from './components.js';
import contact from './contact.js';
import home from './home.js';
import projects from './projects.js';

export const views = {
	'/': home,
	'/about': about,
	'/projects': projects,
	'/contact': contact,
	'/components': components,
	404: notFound,
};
