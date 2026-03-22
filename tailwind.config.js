export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        theme: {
          start: "var(--theme-start)",
          end: "var(--theme-end)",
        },
      },
    },
  },
  plugins: [],
}
