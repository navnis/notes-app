import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import jsxA11y from "eslint-plugin-jsx-a11y";

export default tseslint.config(
  {
    ignores: ["**/node_modules/**", "**/dist/**"],
  },

  // Base rules for every TS file in the monorepo (frontend, backend, common)
  js.configs.recommended,
  ...tseslint.configs.recommended,

  // Backend: Node runtime globals (process, __dirname, etc.)
  {
    files: ["backend/**/*.ts"],
    languageOptions: {
      globals: globals.node,
    },
  },

  // Frontend: browser globals + React/JSX/accessibility rules
  {
    files: ["frontend/src/**/*.{ts,tsx}"],
    languageOptions: {
      globals: globals.browser,
    },
    extends: [reactHooks.configs["recommended-latest"], jsxA11y.flatConfigs.recommended],
    plugins: {
      "react-refresh": reactRefresh,
    },
    rules: {
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
    },
  }
);
