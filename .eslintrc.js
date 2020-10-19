// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path')

module.exports = {
    // https://eslint.org/docs/user-guide/configuring#configuration-cascading-and-hierarchy
    // This option interrupts the configuration hierarchy at this file
    // Remove this if you have an higher level ESLint config file (it usually happens into a monorepos)
    root: true,

    parserOptions: {
        // https://github.com/typescript-eslint/typescript-eslint/tree/master/packages/parser#configuration
        // https://github.com/TypeStrong/fork-ts-checker-webpack-plugin#eslint
        parser: '@typescript-eslint/parser',
        project: path.resolve(__dirname, './tsconfig.json'),
        tsconfigRootDir: __dirname,
        ecmaVersion: 2017, // Allows for the parsing of modern ECMAScript features
        sourceType: 'module', // Allows for the use of imports
    },

    // Predefines global variables (e.g. browser env predefines 'window' variable)
    env: {
        browser: true,
        node: true,
    },

    // Rules order is important, please avoid shuffling them
    extends: [
        // Base ESLint recommended rules
        // 'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',

        'standard',
    ],

    plugins: [
        '@typescript-eslint',
    ],

    // Disable warnings for variables that are accessed but not defined in same file
    globals: {
        GM: true,
        $: true,
        JQuery: true,
    },

    rules: {
        'generator-star-spacing': ['error', 'before'],
        'arrow-parens': ['error', 'always'],
        'one-var': ['error', 'never'],
        'no-void': ['error', {
            allowAsStatement: true,
        }],
        'space-before-blocks': ['error', 'always'],

        'import/first': 'off',
        'import/named': 'error',
        'import/namespace': 'error',
        'import/default': 'error',
        'import/export': 'error',
        'import/extensions': 'off',
        'import/no-unresolved': 'off',
        'import/no-extraneous-dependencies': 'off',

        'comma-dangle': ['error', 'always-multiline'],
        'space-before-function-paren': ['error', 'never'],
        indent: ['error', 4, {
            SwitchCase: 1,
        }],

        '@typescript-eslint/type-annotation-spacing': 'error',
        '@typescript-eslint/restrict-template-expressions': ['error', {
            allowNumber: true,
            allowBoolean: true,
            allowAny: false,
            allowNullish: true,
        }],
        '@typescript-eslint/no-inferrable-types': ['error', {
            ignoreParameters: false,
            ignoreProperties: true,
        }],
        '@typescript-eslint/consistent-type-assertions': ['error', {
            assertionStyle: 'as',
            objectLiteralTypeAssertions: 'never',
        }],
        '@typescript-eslint/array-type': ['error', {
            default: 'generic',
        }],

        semi: 'off',
        '@typescript-eslint/semi': ['error', 'never'],

        // allow debugger during development only
        'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    },
}
