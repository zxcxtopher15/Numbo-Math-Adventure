import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';
const plugin = require('tailwindcss/plugin'); // ✅ Correct way

/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ['class'],
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                fredoka: ['Varela', 'sans-serif'],
            },
            colors: {
                primary: {
                    DEFAULT: 'hsl(var(--primary))',
                    foreground: 'hsl(var(--primary-foreground))',
                },
                secondary: {
                    DEFAULT: 'hsl(var(--secondary))',
                    foreground: 'hsl(var(--secondary-foreground))',
                },
                accent: {
                    DEFAULT: 'hsl(var(--accent))',
                    foreground: 'hsl(var(--accent-foreground))',
                },
                gray: {
                    100: '#f7fafc',
                    200: '#edf2f7',
                    300: '#e2e8f0',
                    400: '#cbd5e0',
                    500: '#a0aec0',
                    600: '#718096',
                    700: '#4a5568',
                    800: '#2d3748',
                    900: '#1a202c',
                },
                customGray: '#1a202c',
                darkBlue: '#1D3557',
                lightBlue: '#A8DADC',
                softGreen: '#6CCF3D',
                background: 'hsl(var(--background))',
                surface: '#ffffff',
                success: '#11D211',
                warning: '#f6ad55',
                danger: '#DF642F',
                info: '#3182ce',
                border: 'hsl(var(--border))',
                customPink: '#F50057',
                customPurple: '#9B59B6',
                foreground: 'hsl(var(--foreground))',
                card: {
                    DEFAULT: 'hsl(var(--card))',
                    foreground: 'hsl(var(--card-foreground))',
                },
                popover: {
                    DEFAULT: 'hsl(var(--popover))',
                    foreground: 'hsl(var(--popover-foreground))',
                },
                muted: {
                    DEFAULT: 'hsl(var(--muted))',
                    foreground: 'hsl(var(--muted-foreground))',
                },
                destructive: {
                    DEFAULT: 'hsl(var(--destructive))',
                    foreground: 'hsl(var(--destructive-foreground))',
                },
                input: 'hsl(var(--input))',
                ring: 'hsl(var(--ring))',
                chart: {
                    1: 'hsl(var(--chart-1))',
                    2: 'hsl(var(--chart-2))',
                    3: 'hsl(var(--chart-3))',
                    4: 'hsl(var(--chart-4))',
                    5: 'hsl(var(--chart-5))',
                },
                sidebar: {
                    DEFAULT: 'hsl(var(--sidebar-background))',
                    foreground: 'hsl(var(--sidebar-foreground))',
                    primary: 'hsl(var(--sidebar-primary))',
                    'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
                    accent: 'hsl(var(--sidebar-accent))',
                    'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
                    border: 'hsl(var(--sidebar-border))',
                    ring: 'hsl(var(--sidebar-ring))',
                },
            },
            borderRadius: {
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)',
            },
        },
    },

    plugins: [
        forms,
        require('tailwindcss-animate'),
        require('tailwind-scrollbar')({ nocompatible: true }), // Enables styling
        plugin(function ({ addBase }) {
            addBase({
                '::-webkit-scrollbar': {
                    width: '8px',
                    height: '8px',
                },
                '::-webkit-scrollbar-track': {
                    background: 'trasparent', // Light gray background
                    marginTop: '30px', // Adds space at the top
                    marginBottom: '30px', // Adds space at the bottom
                    borderRadius: '10px',
                },
                '::-webkit-scrollbar-thumb': {
                    background: '#cbd5e0', // Indigo color
                    borderRadius: '8px',
                },
                '::-webkit-scrollbar-thumb:hover': {
                    background: '#cbd5e0', // Darker indigo on hover
                },
            });
        }),
    ],
};
