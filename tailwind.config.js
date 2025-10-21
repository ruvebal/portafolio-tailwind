// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
	content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
	theme: {
		// Override default font sizes instead of creating new utilities
		fontSize: {
			xs: ['0.75rem', { lineHeight: '1.2' }],
			sm: ['0.875rem', { lineHeight: '1.35' }],
			base: ['1rem', { lineHeight: '1.7' }],
			lg: ['1.125rem', { lineHeight: '1.6' }],
			xl: ['1.375rem', { lineHeight: '1.35', letterSpacing: '-0.005em' }],
			'2xl': ['1.75rem', { lineHeight: '1.25', letterSpacing: '-0.01em' }],
			'3xl': ['2rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
			'4xl': ['2.5rem', { lineHeight: '1.15', letterSpacing: '-0.015em' }],
			'5xl': ['3.25rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
			'6xl': ['4rem', { lineHeight: '1.05', letterSpacing: '-0.025em' }],
			'7xl': ['4.5rem', { lineHeight: '1.05', letterSpacing: '-0.03em' }],
		},
		extend: {
			// Design tokens (aka "theme extensions").
			// Using these keys in your markup (e.g., bg-primary-500, text-content-muted)
			// decouples UI styling from raw hex values. If you tweak a token here,
			// all components using that token update consistently.
			colors: {
				// Brand colors: use for primary actions and navigation backgrounds
				primary: {
					50: '#eff6ff',
					500: '#3b82f6',
					900: '#1e3a8a',
				},
				// Surfaces: use for page backgrounds and contrasting sections
				surface: {
					light: '#f8fafc', // light page background
					dark: '#1e293b', // dark footer/sections background
				},
				// Content colors: use for text. Prefer these over gray-XXX
				content: {
					DEFAULT: '#0f172a', // strong/default text
					muted: '#64748b', // subdued/secondary text
					inverted: '#ffffff', // text on dark/brand backgrounds
				},
			},
			// Spacing tokens to augment Tailwind scale
			spacing: {
				18: '4.5rem',
				88: '22rem',
			},
			// Large radius for prominent CTAs/cards
			borderRadius: {
				'4xl': '2rem',
			},
			// Custom typography: map semantic font families
			fontFamily: {
				display: [
					'ui-sans-serif',
					'system-ui',
					'Segoe UI',
					'Inter',
					'Roboto',
					'Helvetica Neue',
					'Arial',
					'Noto Sans',
					'Apple Color Emoji',
					'Segoe UI Emoji',
					'Segoe UI Symbol',
					'Noto Color Emoji',
				],
				body: [
					'ui-sans-serif',
					'system-ui',
					'Inter',
					'Roboto',
					'Helvetica Neue',
					'Arial',
					'Noto Sans',
					'Apple Color Emoji',
					'Segoe UI Emoji',
					'Segoe UI Symbol',
					'Noto Color Emoji',
				],
			},
			// Subtle elevation for cards/CTAs
			boxShadow: {
				elevated: '0 12px 30px -12px rgba(59, 130, 246, 0.35)', // uses primary color tint
			},
			// Container defaults (so class "container" is centered with padding)
			container: {
				center: true,
				padding: {
					DEFAULT: '1rem',
					sm: '1rem',
					md: '2rem',
					lg: '2rem',
					xl: '2.5rem',
				},
			},
		},
	},
	plugins: [],
};
