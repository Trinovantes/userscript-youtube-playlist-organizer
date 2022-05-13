/* eslint-disable quote-props */

// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path')

// eslint-disable-next-line @typescript-eslint/no-var-requires
const INLINE_ELEMENTS = require('eslint-plugin-vue/lib/utils/inline-non-void-elements.json')

module.exports = {
    root: true,

    parserOptions: {
        extraFileExtensions: ['.vue'],
        parser: '@typescript-eslint/parser',
        project: path.resolve(__dirname, './tsconfig.json'),
        tsconfigRootDir: __dirname,
        ecmaVersion: 2021, // Allows for the parsing of modern ECMAScript features
        sourceType: 'module', // Allows for the use of imports
    },

    // Predefines global variables (e.g. browser env predefines 'window' variable)
    env: {
        browser: true,
        node: true,
        'vue/setup-compiler-macros': true,
    },

    // Disable warnings for variables that are accessed but not defined in same file
    globals: {
        'DEFINE': 'readonly',
        'GM': 'readonly',
        '$': 'readonly',
        'jQuery': 'readonly',
    },

    // Rules order is important, please avoid shuffling them
    extends: [
        'standard',
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
        'plugin:vue/vue3-recommended',
    ],

    plugins: [
        '@typescript-eslint',
        'vue',
    ],

    settings: {
        'import/resolver': {
            'typescript': {
                'alwaysTryTypes': true,
            },
        },
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
        'import/order': ['error', {
            warnOnUnassignedImports: true,
            alphabetize: {
                order: 'asc',
                caseInsensitive: false,
            },
            pathGroups: [
                {
                    'pattern': '@/**',
                    'group': 'parent',
                },
            ],
            groups: [
                'builtin', 'external', 'parent', 'sibling', 'index', 'object', 'type',
            ],
        }],

        'comma-dangle': 'off',
        '@typescript-eslint/comma-dangle': ['error', 'always-multiline'],

        'space-before-function-paren': ['error', 'never'],
        'indent': ['error', 4, {
            'SwitchCase': 1,
        }],

        'vue/html-indent': ['error', 4],
        'vue/max-attributes-per-line': ['error', {
            singleline: 999,
            multiline: 1,
        }],

        'vue/singleline-html-element-content-newline': ['error', {
            'ignores': ['ExternalLink', 'pre', 'router-link', ...INLINE_ELEMENTS],
        }],

        'vue/component-tags-order': ['error', {
            'order': ['script', 'template', 'style'],
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

        '@typescript-eslint/member-delimiter-style': ['error', {
            multiline: {
                delimiter: 'none',
                requireLast: true,
            },
            singleline: {
                delimiter: 'semi',
                requireLast: false,
            },
        }],

        'semi': 'off',
        '@typescript-eslint/semi': ['error', 'never'],

        'no-debugger': 'error',

        '@typescript-eslint/naming-convention': [
            'error',
            {
                'selector': 'default',
                'format': null,
                'modifiers': ['requiresQuotes'],
            },
            {
                'selector': 'typeLike',
                'format': ['PascalCase'],
            },
            {
                'selector': 'parameter',
                'format': ['strictCamelCase'],
                'leadingUnderscore': 'allow',
            },
            {
                'selector': 'memberLike',
                'modifiers': ['private'],
                'format': ['strictCamelCase'],
                'leadingUnderscore': 'require',
            },
            {
                'selector': [
                    'variableLike',
                    'method',
                ],
                'filter': {
                    'regex': '^update:',
                    'match': false,
                },
                'format': ['strictCamelCase', 'UPPER_CASE'],
            },
        ],

        '@typescript-eslint/strict-boolean-expressions': ['error', {
            allowNullableBoolean: true,
            allowNullableString: true,
        }],
    },
}
