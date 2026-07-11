/** @type {import('tailwindcss').Config} */
// Crêpes à Latte brand, taken from the IHG "Espresso Service Experience"
// proposal: Antonio (display), Futura-style geometric (subheads), Abel (labels);
// navy / indigo / teal / magenta palette.
module.exports = {
  content: ["./app/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // brand palette
        navy: "#1A428A",
        indigo: "#2E2776",
        teal: "#10CFC9",
        magenta: "#B5007C",
        gold: "#F2C400",
        red: "#E1352B",
        // semantic
        purple: "#1A428A",   // primary accent (kept token name so utilities repoint to navy)
        ink: "#1B1A18",
        paper: "#ffffff",
        mist: "#f4f2f0",
        line: "#e6e2de",
        muted: "#6e6a66",
        // pipelines
        national: "#1A428A",
        cafelines: "#B5007C",
        // pattern classes
        fixed: "#1A428A",
        anchor: "#0E9E99",
        rotation: "#2E2776",
        drift: "#B5007C",
        insufficient: "#9a948e",
      },
      fontFamily: {
        head: ["var(--font-antonio)", "Antonio", "system-ui", "sans-serif"],
        body: ["var(--font-jost)", "Jost", "system-ui", "sans-serif"],
        label: ["var(--font-abel)", "Abel", "system-ui", "sans-serif"],
      },
      maxWidth: { screen: "1500px" },
    },
  },
  plugins: [],
};
