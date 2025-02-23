/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	darkMode: 'selector',

	theme: {
		extend: {
			boxShadow: {
				'custom-light': '0 -10px 100px rgba(0, 0, 0, 0.089)'
			},
			fontFamily:{
				inter: 'inter',
				lato:"Lato"
			}
		}
	},

	plugins: [require('@tailwindcss/typography')]
};
