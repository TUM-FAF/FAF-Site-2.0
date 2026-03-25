/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './src/**/*.{astro,html,js,jsx,ts,tsx,vue,svelte}',
    ],
    theme: {
        extend: {
            colors: {
                bg: '#050505',
                'bg-alt': '#121212',
                accent: '#ff9b2b',
                'accent-soft': '#ff5b2b',
                text: '#ffffff',
                muted: '#b3b3b3',
            },
        },
    },
    plugins: [],
};