/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{html,js,svelte,ts}",
    require.resolve("@etrepum/lexical-tailwind"),
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require("@tailwindcss/typography"),
    require("@etrepum/lexical-tailwind-plugin"),
  ],
};
