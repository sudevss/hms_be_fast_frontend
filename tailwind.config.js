/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#115E59",
          light: "#a4e3bda8",
          dark: "#2B1B49",
          white: "#F5F5F5",
        },
        hms: { DEFAULT: "#231E33", light: "#4E4988", dark: "#0C0A1A" },
        text: {
          primary: "#0A121E",
          subtitle: "#636C7F",
        },
        background: { DEFAULT: "#FFFFFF", light: "#F5F5F5" },
      },
      fontFamily: {
        sans: [
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
          '"Apple Color Emoji"',
          '"Segoe UI Emoji"',
          "Segoe UI Symbol",
          '"Noto Color Emoji"',
        ],
      },
      boxShadow: {
        intuismart:
          "0px 1px 5px rgba(80, 9, 181, 0.1), 0px 8px 24px rgba(43, 27, 73, 0.15)",
      },
      backgroundImage: {
        "custom-gradient": "linear-gradient(#F3F3F3, #DBD1E9, #F3F3F3)",
      },
    },
  },
  plugins: [],
};
