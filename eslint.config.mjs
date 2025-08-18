import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Allow external links to use <a> tags
      "@next/next/no-html-link-for-pages": "off",
      // Allow <img> tags for external images (Bandcamp covers)
      "@next/next/no-img-element": "off",
      // Allow unused variables with underscore prefix
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          "argsIgnorePattern": "^_",
          "varsIgnorePattern": "^_"
        }
      ]
    }
  },
  {
    files: ["src/lib/notion-cms.ts"],
    rules: {
      // Allow any types in Notion CMS integration file since Notion API responses are complex
      "@typescript-eslint/no-explicit-any": "off"
    }
  }
];

export default eslintConfig;
