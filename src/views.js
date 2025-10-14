// src/views.js
export const views = {
	'/': {
		template: `
      <section class="py-16">
        <div class="container mx-auto px-4 text-center">
          <h1 class="text-5xl font-bold text-gray-900 mb-6">Bienvenido a Inicio</h1>
          <p class="text-xl text-gray-600 mb-8">Esta es la página de inicio de nuestra SPA.</p>
          <a href="#/sobre" class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-lg transition-colors">
            Conoce Sobre Nosotros
          </a>
        </div>
      </section>
    `,
	},
	'/sobre': {
		template: `
      <section class="py-16">
        <div class="container mx-auto px-4">
          <h1 class="text-4xl font-bold text-gray-900 mb-6">Sobre Nosotros</h1>
          <div class="max-w-3xl mx-auto">
            <p class="text-lg text-gray-700 mb-4">
              Construimos aplicaciones web modernas con Tailwind CSS y JavaScript vanilla.
              Nuestro enfoque está en accesibilidad, rendimiento y experiencia de usuario.
            </p>
            <p class="text-lg text-gray-700 mb-6">
              Esta SPA demuestra ruteo, diseño responsive y mejora progresiva.
            </p>
            <a href="#/" class="text-blue-500 hover:text-blue-600 font-medium">← Volver a Inicio</a>
          </div>
        </div>
      </section>
    `,
	},
	404: {
		template: `
      <section class="py-16">
        <div class="container mx-auto px-4 text-center">
          <h1 class="text-4xl font-bold text-gray-900 mb-6">Página No Encontrada</h1>
          <p class="text-xl text-gray-600 mb-8">La página que buscas no existe.</p>
          <a href="#/" class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-lg transition-colors">
            Ir a Inicio
          </a>
        </div>
      </section>
    `,
	},
};

