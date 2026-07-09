/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // CAL brand
        purple: "#944197",
        ink: "#000000",
        paper: "#ffffff",
        mist: "#f5f2f6",
        line: "#e5dfe7",
        muted: "#6b6570",
        // pattern-class palette (purple family, distinct steps)
        fixed: "#944197",
        anchor: "#b56bb8",
        rotation: "#6d2f70",
        oneoff: "#c9b9cb",
        // pipelines
        national: "#944197",
        cafelines: "#d9a441",
      },
      fontFamily: {
        head: ["var(--font-bricolage)", "system-ui", "sans-serif"],
        body: ["var(--font-karla)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
