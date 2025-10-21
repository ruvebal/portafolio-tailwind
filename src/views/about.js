// src/views/about.js
export default {
	template: `
   <section class="py-16">
     <div class="container mx-auto px-4">
      <h1 class="text-4xl font-bold text-content mb-6">About Us</h1> <!-- default size (text-4xl) overridden in config -->
       <div class="max-w-3xl mx-auto">
        <p class="text-lg text-content mb-4"> <!-- default size (text-lg) overridden in config -->
           We build modern web applications with Tailwind CSS and vanilla JavaScript.
           Our focus is on accessibility, performance, and user experience.
         </p>
        <p class="text-lg text-content-muted mb-6"> <!-- default size (text-lg) overridden in config -->
           This SPA demonstrates routing, responsive design, and progressive enhancement.
         </p>
        <a href="#/" class="text-primary-500 hover:text-primary-900 font-medium">← Back to Home</a> <!-- brand link -->
       </div>
     </div>
   </section>
 `,
};
