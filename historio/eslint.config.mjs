import globals from "globals"
import pluginJs from "@eslint/js"
import tseslint from "typescript-eslint"
import pluginReact from "eslint-plugin-react"
import eslintPluginUnicorn from "eslint-plugin-unicorn"
import tailwind from "eslint-plugin-tailwindcss"
import { FlatCompat } from "@eslint/eslintrc"

const compat = new FlatCompat({
  // import.meta.dirname is available after Node.js v20.11.0
  baseDirectory: import.meta.dirname,
})

/** @type {import('eslint').Linter.Config[]} */
const config = [
  { ignores: [".next/**", "public/**", "next.config.js", "postcss.config.js"] },
  { files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"] },
  { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  eslintPluginUnicorn.configs["flat/recommended"],
  ...tailwind.configs["flat/recommended"],
  ...compat.config({
    extends: ["next"],
    settings: {
      next: {
        rootDir: ".",
      },
    },
  }),
  ...compat.config({
    extends: ["plugin:drizzle/all"],
  }),
  {
    rules: {
      "no-undef": "error",
      "react/react-in-jsx-scope": "off",
      "tailwindcss/no-custom-classname": "off",
      "@typescript-eslint/no-unused-vars": [
        "error", // or "error"
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "unicorn/prevent-abbreviations": "off",
    },
  },
  {
    files: ["**/*.{jsx,tsx}"],
    rules: {
      "no-console": "warn",
    },
  },
]
export default config
