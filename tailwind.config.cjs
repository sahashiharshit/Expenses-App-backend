/** @type {import('tailwindcss').Config} */
import forms from '@tailwindcss/forms'; 
import typography from '@tailwindcss/typography';
export default {
  content: [
    "./views/**/*.html",  // adjust based on your structure
    "./public/js/**/*.js"
  ],
  theme: {
    extend: {},
  },
  plugins: [
   forms,
   typography,
   
  ],
}
