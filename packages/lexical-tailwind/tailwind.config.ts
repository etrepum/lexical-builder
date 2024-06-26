import { type Config } from "tailwindcss";
import { lexicalTailwindPlugin } from "@etrepum/lexical-tailwind-plugin";

const config: Config = {
  content: [],
  theme: {
    extend: {},
  },
  plugins: [lexicalTailwindPlugin],
};

export default config;
