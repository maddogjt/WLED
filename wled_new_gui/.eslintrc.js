module.exports = {
  root: true,
  ignorePatterns: ['.eslintrc.js', 'webpack.config.js', 'babel.config.js'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'react', 'react-hooks'],

  env: {
    browser: true,
    es6: true,
  },
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'prettier',
  ],
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ['tsconfig.json'],
  },

  rules: {
    // '@typescript-eslint/ban-types': [      "error",
    //   {
    //     "extendDefaults": true,
    //     "types": {
    //       "object": false
    //     }
    //   }],
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-unsafe-return': 'off',
    '@typescript-eslint/no-unsafe-member-access': 'off',
    '@typescript-eslint/no-unsafe-assignment': 'off',
    '@typescript-eslint/restrict-template-expressions': ['warn', { allowAny: true }],
    // '@typescript-eslint/no-unsafe-call': 'off',

    /**
     * Preact / JSX rules
     */
    'react/no-deprecated': 2,
    'react/react-in-jsx-scope': 0, // handled this automatically
    'react/display-name': [1, { ignoreTranspilerName: false }],
    'react/jsx-no-bind': [
      1,
      {
        ignoreRefs: true,
        allowFunctions: true,
        allowArrowFunctions: true,
      },
    ],
    'react/jsx-no-comment-textnodes': 2,
    'react/jsx-no-duplicate-props': 2,
    'react/jsx-no-target-blank': 2,
    'react/jsx-no-undef': 2,
    'react/jsx-tag-spacing': [2, { beforeSelfClosing: 'always' }],
    'react/jsx-uses-react': 2, // debatable
    'react/jsx-uses-vars': 2,
    'react/jsx-key': [2, { checkFragmentShorthand: true }],
    'react/self-closing-comp': 2,
    'react/prefer-es6-class': 2,
    'react/prefer-stateless-function': 1,
    'react/require-render-return': 2,
    'react/no-danger': 1,
    // Legacy APIs not supported in Preact:
    'react/no-did-mount-set-state': 2,
    'react/no-did-update-set-state': 2,
    'react/no-find-dom-node': 2,
    'react/no-is-mounted': 2,
    'react/no-string-refs': 2,

    /**
     * Hooks
     */
    'react-hooks/rules-of-hooks': 2,
    'react-hooks/exhaustive-deps': 1,
  },
};
