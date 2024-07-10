module.exports = {
  extends: ['next/core-web-vitals', 'plugin:storybook/recommended', 'prettier'],
  plugins: ['unused-imports'],
  overrides: [
    {
      files: ['test/**'],
      plugins: ['jest'],
      extends: ['plugin:jest/recommended', 'plugin:jest/style'],
    },
  ],
  settings: {
    'import/external-module-folders': ['.yarn', 'node_modules'],
  },
  rules: {
    'import/order': [
      'error',
      {
        groups: [
          'builtin',
          'external',
          'internal',
          ['parent', 'sibling', 'index'],
          'object',
          'type',
        ],
        pathGroups: [
          {
            pattern: '@/**',
            group: 'parent',
            position: 'before',
          },
        ],
        pathGroupsExcludedImportTypes: [
          'builtin',
          'external',
          'object',
          'type',
        ],
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
        'newlines-between': 'never',
      },
    ],
    'unused-imports/no-unused-imports': 'error',
  },
  root: true,
}
