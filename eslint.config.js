import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "specs/**",
      "dist/**",
      "coverage/**",
      ".claude/**",
      ".specify/**",
      ".playwright-mcp/**",
      "node_modules/**",
    ],
  },
  ...tseslint.configs.recommended,
  {
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "AssignmentExpression[left.property.name=/^(innerHTML|outerHTML)$/]",
          message: "Do not assign innerHTML or outerHTML; build DOM with createElement and textContent.",
        },
      ],
    },
  },
);
