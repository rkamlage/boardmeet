/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#6366f1",
        secondary: "#8b5cf6",
        background: "#0f172a",
        card: "#1e293b",
        text: "#f8fafc",
        muted: "#94a3b8"
      }
    },
  },
  plugins: [],
}
