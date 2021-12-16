module.exports = {
  mode: "jit",
  purge: ["./**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      boxShadow: {
        "bottom-sheet": "0 0 30px 8px rgba(0, 0, 0, 0.02)",
      },
      colors: {
        black: "#212121",
      },
      fontFamily: {
        lato: ["Lato", "sans-serif"],
      },
      animation: {
        bounce200: "bounce 1s infinite 200ms",
        bounce400: "bounce 1s infinite 400ms",
      },
    },
  },
  darkMode: false, // or 'media' or 'class'
  variants: {
    extend: {
      backgroundColor: ["checked"],
      borderColor: ["checked"],
      inset: ["checked"],
      zIndex: ["hover", "active"],
    },
  },
}
