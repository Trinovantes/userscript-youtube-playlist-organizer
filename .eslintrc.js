// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-var-requires
const INLINE_ELEMENTS = require('eslint-plugin-vue/lib/utils/inline-non-void-elements.json')

module.exports = {
    root: true,

    parserOptions: {
        extraFileExtensions: ['.vue'],
        parser: '@typescript-eslint/parser',
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
        ecmaVersion: 'latest',
        sourceType: 'module',
    },

    // Predefines global variables (e.g. browser env predefines 'window' variable)
    env: {
        browser: true,
        node: true,
        'vue/setup-compiler-macros': true,
    },

    extends: [
        'standard',
        'eslint:recommended',
        'plugin:@typescript-eslint/strict-type-checked',
        'plugin:vue/vue3-recommended',
    ],

    plugins: [
        '@typescript-eslint',
        'import',
        'vue',
    ],

    rules: {
        semi: 'off',
        'comma-dangle': 'off',

        'arrow-parens': ['error', 'always'],
        'eol-last': ['error', 'always'],
        'generator-star-spacing': ['error', 'before'],
        'no-trailing-spaces': 'error',
        'space-before-blocks': ['error', 'always'],
        'space-before-function-paren': ['error', 'never'],
        'n/prefer-node-protocol': ['error'],
        indent: ['error', 4, {
            SwitchCase: 1,
        }],
        'no-multi-spaces': ['error', {
            exceptions: {
                Property: true,
                VariableDeclarator: true,
                ImportDeclaration: false,
            },
            ignoreEOLComments: true,
        }],
        'no-empty-pattern': ['error', {
            allowObjectPatternsAsParameters: true,
        }],
        'no-void': ['error', {
            allowAsStatement: true,
        }],
        quotes: ['error', 'single', {
            avoidEscape: true,
            allowTemplateLiterals: false,
        }],

        'vue/html-indent': ['error', 4],
        'vue/max-attributes-per-line': ['error', {
            singleline: 999,
            multiline: 1,
        }],
        'vue/component-tags-order': ['error', {
            order: ['script', 'template', 'style'],
        }],
        'vue/singleline-html-element-content-newline': ['error', {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            ignores: ['ExternalLink', 'router-link', 'pre', ...INLINE_ELEMENTS],
        }],

        '@typescript-eslint/return-await': ['error', 'always'],
        '@typescript-eslint/prefer-literal-enum-member': 'off',
        '@typescript-eslint/no-unnecessary-condition': 'off',
        '@typescript-eslint/semi': ['error', 'never'],
        '@typescript-eslint/comma-dangle': ['error', 'always-multiline'],
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
        '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
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
        '@typescript-eslint/strict-boolean-expressions': ['error', {
            allowNullableBoolean: true,
            allowNullableString: true,
        }],
        '@typescript-eslint/naming-convention': ['error',
            {
                selector: 'default',
                format: null,
                modifiers: ['requiresQuotes'],
            },
            {
                selector: 'typeLike',
                format: ['PascalCase'],
            },
            {
                selector: 'parameter',
                format: ['strictCamelCase', 'UPPER_CASE'],
                leadingUnderscore: 'allowSingleOrDouble',
                trailingUnderscore: 'allowDouble',
            },
            {
                selector: 'memberLike',
                modifiers: ['private'],
                format: ['strictCamelCase'],
                leadingUnderscore: 'require',
            },
            {
                selector: [
                    'variableLike',
                    'method',
                ],
                filter: {
                    regex: '^update:',
                    match: false,
                },
                format: ['strictCamelCase', 'UPPER_CASE'],
                leadingUnderscore: 'allowDouble',
                trailingUnderscore: 'allowDouble',
            },
        ],
        '@typescript-eslint/no-unused-vars': ['error', {
            argsIgnorePattern: '^_',
        }],
    },
}
