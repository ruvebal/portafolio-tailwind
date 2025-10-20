// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
	content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
	theme: {
		extend: {
			colors: {
				primary: {
					50: '#eff6ff',
					500: '#3b82f6',
					900: '#1e3a8a',
				},
				surface: {
					light: '#f8fafc',
					dark: '#1e293b',
				},
			},
			spacing: {
				18: '4.5rem',
				88: '22rem',
			},
			borderRadius: {
				'4xl': '2rem',
			},
		},
	},
	plugins: [],
};
