/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        aqi: {
          good: '#10B981',
          moderate: '#EAB308',
          sensitive: '#F97316',
          unhealthy: '#EF4444',
          veryUnhealthy: '#8B5CF6',
          hazardous: '#881337',
        }
      }
    },
  },
  plugins: [],
}
