module.exports = {
  mode: "jit",
  purge: ['./**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],

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
}
