'use strict'

const { EOL } = require('os')
const path = require('path')
const { format } = require('url')
const WebpackUserscript = require('webpack-userscript')
const packageJson = require('./package.json')

const isDev = process.env.NODE_ENV !== 'production'

if (isDev) {
    const url = format({
        pathname: path.resolve(__dirname, 'dist', `${packageJson.name}.user.js`),
        protocol: 'file',
        slashes: true,
    })

    let msg = ''
    const log = (s) => msg += (s || '') + EOL

    log('-'.repeat(80))
    log()
    log('Development Notes:')
    log()
    log(`1. Install http://localhost:8080/${packageJson.name}.meta.js`)
    log('2. Go into Chrome -> Extensions -> TamperMonkey -> Enable "Allow access to file URLs"')
    log('3. Add this line to UserScript config:')
    log()
    log(`// @require ${url}`)
    log()
    log('-'.repeat(80))

    console.info(msg)
}

const Config = {
    target: 'web',

    mode: process.env.NODE_ENV,
    devtool: 'inline-source-map',
    entry: path.resolve(__dirname, './src/index.ts'),
    output: {
        filename: `${packageJson.name}.user.js`,
    },

    resolve: {
        extensions: ['.ts', '.js'],
        alias: {
            '@Constants': path.resolve(__dirname, './src/Constants.ts'),
            '@img': path.resolve(__dirname, './src/assets/img'),
            '@css': path.resolve(__dirname, './src/assets/css'),
        },
        modules: [
            path.resolve(__dirname, './src'),
            'node_modules',
        ],
    },

    module: {
        rules: [
            {
                test: /\.tsx?$/,
                exclude: /node_modules/,
                use: [
                    'ts-loader',
                ],
            },
            {
                test: /\.s(a|c)ss$/,
                use: [
                    'style-loader',
                    'css-loader',
                    {
                        loader: 'sass-loader',
                        options: {
                            additionalData: '@import "@css/variables.scss";',
                        },
                    },
                ],
            },
            {
                test: /\.(png|jpg|gif)$/,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            // To avoid any issues related to asar, embed any image up to 10MB as data url
                            limit: 10 * 1024 * 1024,
                            name: 'imgs/[name]--[folder].[ext]',
                            esModule: false,
                        },
                    },
                ],
            },
        ],
    },

    devServer: {
        writeToDisk: true,
        inline: false,
    },

    plugins: [
        new WebpackUserscript({
            headers: {
                name: packageJson.productName,
                version: isDev
                    ? '[version]-build.[buildNo]'
                    : '[version]',
                match: [
                    '*://*.youtube.com/*',
                ],
                grant: [
                    'GM.setValue',
                    'GM.getValue',
                ],
                require: [
                    'https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js',
                ],
            },
            proxyScript: {
                enable: false,
            },
        }),
    ],
}

module.exports = Config
