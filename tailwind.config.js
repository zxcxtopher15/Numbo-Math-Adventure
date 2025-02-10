import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
    './storage/framework/views/*.php',
    './resources/views/**/*.blade.php',
    './resources/js/**/*.jsx',
  ],

  theme: {
    extend: {
      fontFamily: {
        sans: ['Varela Round', ...defaultTheme.fontFamily.sans],
      },
      colors: {
        // Primary Colors
        primary: '#3490dc', // Blue
        secondary: '#ffed4a', // Yellow
        accent: '#e3342f', // Red
        // Neutral Colors
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
        // Custom Grayscale
        customGray: '#1a202c', // Dark gray for backgrounds
        // Custom Colors
        darkBlue: '#1D3557', // Deep blue for contrasts
        lightBlue: '#A8DADC', // Light blue
        softGreen: '#6CCF3D', // Soft green for buttons or call-to-action
        // Background and Surface
        background: '#f4f4f9', // Light background color
        surface: '#ffffff', // White surface color for cards or containers
        // Other colors
        success: '#38a169', // Green for success
        warning: '#f6ad55', // Yellow for warnings
        danger: '#e53e3e', // Red for errors
        info: '#3182ce', // Blue for information
        // Border colors
        border: '#e2e8f0', // Light border color
        // Custom Pink
        customPink: '#F50057', // Pink
        // Custom Purple
        customPurple: '#9B59B6', // Purple
      },
    },
  },

  plugins: [forms],
};
