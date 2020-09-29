module.exports = {
  parser: '@typescript-eslint/parser',
  extends: ['plugin:prettier/recommended'],
  plugins: ['prettier'],
  env: {
    node: true
  },
  parserOptions: {
    ecmaVersion: 2019,
    sourceType: 'module'
  },
  rules: { 'prettier/prettier': ['error', { 'endOfLine': 'auto' }] }
}
