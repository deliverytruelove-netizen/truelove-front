import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          '50': '#f3faf6',
          '100': '#d7f0e5',
          '200': '#aee1cb',
          '300': '#7ecaac',
          '400': '#59b090',
          '500': '#3a9273',
          '600': '#2c755c',
          '700': '#275e4d',
          '800': '#234c40',
          '900': '#214036',
          '950': '#0e251f',
        },
        secondary: {
          '50': '#eff4fe',
          '100': '#e1ecfe',
          '200': '#c9d9fc',
          '300': '#a8c0f9',
          '400': '#7a94f3',
          '500': '#687bec',
          '600': '#4b54e0',
          '700': '#3d44c5',
          '800': '#343b9f',
          '900': '#31377e',
          '950': '#1d2049',
        },
        'color-main': '#606060'
      },
    },
  },
  plugins: [],
};
export default config;
