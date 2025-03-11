// @ts-check
import payloadEsLintConfig from '@payloadcms/eslint-config'

export const defaultESLintIgnores = [
  '**/.temp',
  '**/.*', // ignore all dotfiles
  '**/.git',
  '**/.hg',
  '**/.pnp.*',
  '**/.svn',
  '**/playwright.config.ts',
  '**/jest.config.js',
  '**/tsconfig.tsbuildinfo',
  '**/README.md',
  '**/eslint.config.js',
  '**/payload-types.ts',
  '**/dist/',
  '**/.yarn/',
  '**/build/',
  '**/node_modules/',
  '**/temp/',
]

const config = [
  // ...payloadEsLintConfig,
  {
    rules: {
      'no-restricted-exports': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'perfectionist/sort-objects': 'off',
      'perfectionist/sort-imports': 'off',
      'perfectionist/sort-keys': 'off',
      'perfectionist/sort-switch-case': 'off',
      'perfectionist/sort-jsx-props': 'off',
      'perfectionist/**': 'off',
    },
  },
  {
    languageOptions: {
      parserOptions: {
        sourceType: 'module',
        ecmaVersion: 'latest',
        projectService: {
          maximumDefaultProjectFileMatchCount_THIS_WILL_SLOW_DOWN_LINTING: 40,
          allowDefaultProject: ['scripts/*.ts', '*.js', '*.mjs', '*.spec.ts', '*.d.ts'],
        },
        // projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
]

export default config
