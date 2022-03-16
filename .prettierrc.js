module.exports = {
  semi: false,
  singleQuote: false,
  tabWidth: 2,
  trailingComma: "all",
  useTabs: false,
  importOrder: [
    "<THIRD_PARTY_MODULES>",
    "^./flows/(.*)$",
    "^./flows",
    "^frontend/(.*)$",
    "^components/(.*)$",
    "^./hooks/(.*)$",
    "^[./]",
  ],
  importOrderSeparation: true,
  importOrderParserPlugins: ["jsx", "typescript"],
  overrides: [
    {
      files: [
        "*.js",
        "*.jsx",
        "*.ts",
        "*.tsx",
        "*.json",
        "*.yml",
        "*.yaml",
        "*.md",
      ],
      options: {
        tabWidth: 2,
      },
    },
  ],
}
