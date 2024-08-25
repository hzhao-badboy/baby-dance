/* eslint-env node */
module.exports = {
  parser: "vue-eslint-parser",
  root: true,
  'extends': [
    'plugin:vue/vue3-essential',
    'plugin:@typescript-eslint/recommended',
    'eslint:recommended'
  ],
  parserOptions: {
    parser: "@typescript-eslint/parser",
    sourceType: "module",
    ecmaVersion: 'latest'
  }
}
