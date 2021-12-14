module.exports = {
  important: true,
  purge: {
    content: [
      "./src/**/*.{ts,tsx,js,jsx}",
      "./src/components/**/*.{ts,tsx,js,jsx}",
      "./src/components/*.{ts,tsx,js,jsx}",
    ],
  },
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      spacing: {
        "1px": "1px",
        "3px": "3px",
        "4px": "4px",
        "12px": "12px",
        "15px": "15px",
        "18px": "18px",
        "22px": "22px",
        "23px": "23px",
        "26px": "26px",
        "30px": "30px",
        "50px": "50px",
        "70px": "70px",
        "125px": "125px",
        "200px": "200px",
        "250px": "250px",
        "390px": "390px",
        "100vh": "100vh",
        "9%": "9%",
      },
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
  variants: {
    extend: {
      backgroundColor: ["checked"],
      borderColor: ["checked"],
      inset: ["checked"],
      zIndex: ["hover", "active"],
    },
  },
  plugins: [require("@tailwindcss/forms")],
}
