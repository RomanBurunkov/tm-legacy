const eslintConfig = {
  env: {
    node: true,
    jest: true,
  },
  extends: ['airbnb-base'],
  ignorePatterns: ['node_modules'],
  parserOptions: {
    ecmaFeatures: {
      legacyDecorators: true,
    },
  },
  rules: {
    'import/prefer-default-export': 'off',
  },
};

module.exports = eslintConfig;
