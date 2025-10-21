// src/views/404.js
export default {
	template: `
   <section class="py-16">
     <div class="container mx-auto px-4 text-center">
      <h1 class="text-4xl font-bold text-content mb-6">Page Not Found</h1> <!-- default size (text-4xl) overridden in config -->
      <p class="text-lg text-content-muted mb-8">The page you're looking for doesn't exist.</p> <!-- default size (text-lg) overridden in config -->
      <a href="#/" class="bg-primary-500 hover:bg-primary-900 text-content-inverted font-bold py-3 px-8 rounded-4xl shadow-elevated transition-colors"> <!-- brand button -->
         Go Home
       </a>
     </div>
   </section>
 `,
};
