import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import tseslint from 'typescript-eslint';

const controlFlowStatements = ['if', 'for', 'for-in', 'for-of', 'while', 'do', 'switch', 'try'];

export default tseslint.config(
  { ignores: ['dist', 'coverage'] },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [js.configs.recommended, ...tseslint.configs.recommendedTypeChecked],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
      parserOptions: {
        project: ['./tsconfig.app.json', './tsconfig.node.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      'padding-line-between-statements': [
        'error',
        { blankLine: 'always', prev: '*', next: 'return' },
        { blankLine: 'always', prev: '*', next: controlFlowStatements },
        { blankLine: 'always', prev: controlFlowStatements, next: '*' },
        { blankLine: 'any', prev: controlFlowStatements, next: controlFlowStatements },
      ],
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            ['^node:'],
            ['^@?\\w'],
            ['^@/'],
            ['^\\.\\.(?!/?$)', '^\\.\\./?$'],
            ['^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$'],
            ['^\\u0000(?!.*\\.s?css$)'],
            ['^\\u0000.*\\.s?css$', '^.+\\.s?css$'],
          ],
        },
      ],
      'simple-import-sort/exports': 'error',
    },
  },
);
