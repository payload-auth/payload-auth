const functions = ['cn', 'clsx', 'cva']
/** @type {import("prettier").Config} */
module.exports = {
  singleQuote: true,
  trailingComma: 'none',
  printWidth: 140,
  semi: false,
  jsxBracketSameLine: true,
  tailwindFunctions: functions,
  customFunctions: functions,
  endingPosition: 'absolute-with-indent',
  plugins: ['prettier-plugin-classnames', 'prettier-plugin-tailwindcss', 'prettier-plugin-merge']
}
