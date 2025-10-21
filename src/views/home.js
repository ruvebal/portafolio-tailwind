// src/views/home.js
export default {
	template: `
   <section class="py-16">
     <div class="container mx-auto px-4 text-center">
      <h1 class="text-5xl font-bold text-content mb-6">Welcome Home</h1> <!-- default size (text-5xl) overridden in config -->
      <p class="text-lg text-content-muted mb-8">This is the home page of our SPA.</p> <!-- default size (text-lg) overridden in config -->
      <a href="#/about" class="bg-primary-500 hover:bg-primary-900 text-content-inverted font-bold py-3 px-8 rounded-4xl shadow-elevated transition-colors"> <!-- brand button with big radius + shadow -->
         Learn About Us
       </a>
     </div>
   </section>
 `,
};
