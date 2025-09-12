// @ts-check

import eslintGlobals from 'globals'
import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import pluginVue from 'eslint-plugin-vue'
import stylistic from '@stylistic/eslint-plugin'
import nodePlugin from 'eslint-plugin-n'
import vueParser from 'vue-eslint-parser'
import { readFileSync } from 'node:fs'
import { includeIgnoreFile } from '@eslint/compat'
import path from 'node:path'
import { defineConfig } from 'eslint/config'

const inlineElementsJson = readFileSync('node_modules/eslint-plugin-vue/lib/utils/inline-non-void-elements.json').toString('utf-8')
const inlineElements = JSON.parse(inlineElementsJson)

export default defineConfig(
    includeIgnoreFile(path.resolve('.gitignore')),

    {
        ignores: [
            '**/raw/**/*',
            'libs',
        ],
    },

    {
        languageOptions: {
            globals: {
                ...eslintGlobals.browser,
                ...eslintGlobals.node,
            },
        },
    },

    // ------------------------------------------------------------------------
    // MARK: Style
    // ------------------------------------------------------------------------

    stylistic.configs['recommended'],
    {
        rules: {
            '@stylistic/brace-style': ['error', '1tbs'],
            '@stylistic/quotes': ['error', 'single', {
                avoidEscape: true,
                allowTemplateLiterals: 'avoidEscape',
            }],
            '@stylistic/generator-star-spacing': ['error', 'before'],
            '@stylistic/arrow-parens': ['error', 'always'],
            '@stylistic/space-before-function-paren': ['error', {
                anonymous: 'never',
                named: 'never',
                asyncArrow: 'always',
                catch: 'always',
            }],
            '@stylistic/indent': ['error', 4, {
                SwitchCase: 1,
            }],
            '@stylistic/indent-binary-ops': ['off'],
            '@stylistic/no-multi-spaces': ['error', {
                ignoreEOLComments: true,
                exceptions: {
                    Property: true,
                    BinaryExpression: true,
                    VariableDeclarator: true,
                },
            }],
            '@stylistic/member-delimiter-style': ['error', {
                multiline: {
                    delimiter: 'none',
                    requireLast: true,
                },
                singleline: {
                    delimiter: 'semi',
                    requireLast: false,
                },
            }],
            '@stylistic/operator-linebreak': ['error', 'after', {
                overrides: {
                    '?': 'before',
                    ':': 'before',
                    '&': 'before',
                    '|': 'before',
                },
            }],
            '@stylistic/object-curly-spacing': ['error', 'always'],
        },
    },

    // ------------------------------------------------------------------------
    // MARK: JavaScript
    // ------------------------------------------------------------------------

    eslint.configs.recommended,

    {
        rules: {
            'no-empty-pattern': ['error', {
                allowObjectPatternsAsParameters: true,
            }],
            'no-void': ['error', {
                allowAsStatement: true,
            }],
            'no-use-before-define': ['error', {
                functions: false,
                classes: true,
                variables: true,
                allowNamedExports: true,
            }],
        },
    },

    // ------------------------------------------------------------------------
    // MARK: TypeScript
    // ------------------------------------------------------------------------

    ...tseslint.configs.recommendedTypeChecked.map((config) => ({
        ...config,
        files: ['**/*.ts', '**/*.vue'],
    })),

    {
        files: ['**/*.ts', '**/*.vue'],

        languageOptions: {
            parser: vueParser,
            parserOptions: {
                extraFileExtensions: ['.vue'],
                parser: '@typescript-eslint/parser',
                project: './tsconfig.json',
                ecmaVersion: 'latest',
                sourceType: 'module',
                allowAutomaticSingleRunInference: false,
                disallowAutomaticSingleRunInference: true,
            },
        },

        rules: {
            '@typescript-eslint/return-await': ['error', 'always'],
            '@typescript-eslint/prefer-literal-enum-member': 'off',
            '@typescript-eslint/no-unnecessary-condition': 'off',
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
                        regex: '(^update:)|(^toJSON$)',
                        match: false,
                    },
                    format: ['strictCamelCase', 'UPPER_CASE'],
                    leadingUnderscore: 'allowDouble',
                    trailingUnderscore: 'allowDouble',
                },
            ],
            '@typescript-eslint/no-unused-vars': ['error', {
                argsIgnorePattern: '^_',
                caughtErrorsIgnorePattern: '^_',
                destructuredArrayIgnorePattern: '^_',
            }],
            '@typescript-eslint/require-array-sort-compare': ['error', {
                ignoreStringArrays: true,
            }],
            '@typescript-eslint/no-import-type-side-effects': 'error',
        },
    },

    // ------------------------------------------------------------------------
    // MARK: Node
    // ------------------------------------------------------------------------

    {
        plugins: {
            n: nodePlugin,
        },
        rules: {
            'n/prefer-node-protocol': ['error'],
        },
    },

    // ------------------------------------------------------------------------
    // MARK: Vue
    // ------------------------------------------------------------------------

    ...pluginVue.configs['flat/strongly-recommended'],

    {
        rules: {
            'vue/html-indent': ['error', 4],
            'vue/max-attributes-per-line': ['error', {
                singleline: 999,
                multiline: 1,
            }],
            'vue/block-order': ['error', {
                order: ['script', 'template', 'style'],
            }],
            'vue/singleline-html-element-content-newline': ['error', {
                ignores: ['ExternalLink', 'router-link', 'pre', ...inlineElements],
            }],
        },
    },
)
