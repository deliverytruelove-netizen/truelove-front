import type { Config } from "tailwindcss";

const config: Config = {
<<<<<<< HEAD
    darkMode: ["class"],
    content: [
=======
  content: [
>>>>>>> 5ab54bc479f1f03d2f4bb12a0b68cf1f441938a8
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
<<<<<<< HEAD
  	extend: {
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
=======
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
>>>>>>> 5ab54bc479f1f03d2f4bb12a0b68cf1f441938a8
};
export default config;
