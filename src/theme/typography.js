export const fontFamily = [
  "ui-sans-serif",
  "system-ui",
  "sans-serif",
  '"Apple Color Emoji"',
  '"Segoe UI Emoji"',
  "Segoe UI Symbol",
  '"Noto Color Emoji"',
].join(",");

export const typography = {
  fontFamily,
  fontSize: 14,
  h1: {
    fontSize: "2.25rem",
    fontWeight: 700,
    "@media (max-width:600px)": { fontSize: "1.75rem" },
  },
  h2: {
    fontSize: "2rem",
    fontWeight: 600,
    "@media (max-width:600px)": { fontSize: "1.5rem" },
  },
  h3: {
    fontSize: "1.75rem",
    fontWeight: 500,
  },
  h4: {
    fontSize: "1.5rem",
    fontWeight: 400,
  },
  h5: {
    fontSize: "1.25rem",
    fontWeight: 400,
  },
  h6: {
    fontSize: "1rem",
    fontWeight: 400,
  },
};
