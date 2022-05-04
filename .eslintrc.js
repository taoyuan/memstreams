module.exports = {
  extends: ['@loopback/eslint-config/eslintrc.js'],
  overrides: [
    {
      files: ['**/*.ts'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/naming-convention': 'off',
      },
    },
  ],
};
