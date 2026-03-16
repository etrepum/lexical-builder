/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{html,js,svelte,ts}",
    require.resolve("@lexical/tailwind"),
  ],
  theme: {
    extend: {},
  },
};
