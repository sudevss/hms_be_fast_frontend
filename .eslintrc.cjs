/* eslint-disable spellcheck/spell-checker */
module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: ["plugin:react/recommended", "airbnb", "prettier"],
  overrides: [],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  plugins: ["spellcheck", "react", "@tanstack/query", "prettier"],
  rules: {
    "prettier/prettier": "error",
    "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    "react/jsx-uses-react": "off",
    "react/react-in-jsx-scope": "off",
    "react/jsx-props-no-spreading": "off",
    // "react/prop-types": "warn",
    "react/prop-types": "off",
    "import/prefer-default-export": "false",
    "@tanstack/query/exhaustive-deps": "error",
    "@tanstack/query/stable-query-client": "error",
    camelcase: ["off", { ignoreGlobals: true }],
    "padding-line-between-statements": [
      "error",
      { blankLine: "always", prev: "*", next: "return" },
      { blankLine: "always", prev: "directive", next: "*" },
      { blankLine: "any", prev: "directive", next: "directive" },
      { blankLine: "always", prev: ["const", "let", "var"], next: "*" },
      {
        blankLine: "any",
        prev: ["const", "let", "var"],
        next: ["const", "let", "var"],
      },
    ],
    "spellcheck/spell-checker": [
      1,
      {
        comments: true,
        strings: true,
        identifiers: true,
        templates: true,
        lang: "en_US",
        skipWords: [
          "Carelon",
          "bgcolor",
          "MoreVertIcon",
          "DecrementalChart",
          "SvgIcon",
        ],
        skipIfMatch: ["http://[^s]*"],
        // skipWordIfMatch: ["^foobar.*$"],
        minLength: 3, // Words with a character-amount of less than the minLength will not be spell-checked.
        ignoreRequire: true,
      },
    ],
  },
  settings: {
    "import/resolver": {
      alias: {
        map: [
          ["@components", "./src/components"],
          ["@contexts", "./src/contexts"],
          ["@data", "./src/data"],
          ["@features", "./src/features"],
          ["@pages", "./src/pages"],
          ["@utils", "./src/utils"],
          ["@assets", "./src/assets"],
          ["@hooks", "./src/hooks"],
          ["@stores", "./src/stores"],
          ["@", "./src"],
        ],
        extensions: [".js", ".jsx"],
      },
    },
    react: {
      version: "detect",
    },
  },
};
