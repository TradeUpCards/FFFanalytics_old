import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      ff_orange: '#FA923D',
      ff_orange_light: '#FDBB75',
  
    },
    extend: {
    fontFamily: {
      gaegu: ['var(--font-gaegu)'],
      lilita_one: ['var(--font-lilita_one)'],
    }
    },
  },
  plugins: [],
};
export default config;
