import path from 'node:path'
import url from 'node:url'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import webpack from 'webpack'
import 'webpack-dev-server'
import WebpackUserscript from 'webpack-userscript'
import packageJson from './package.json' with { type: 'json' }
import { VueLoaderPlugin } from 'vue-loader'

const isDev = (process.env.NODE_ENV === 'development')
const srcDir = path.resolve('src')
const distDir = path.resolve('dist')
const baseUrl = process.env.WSL_DISTRO_NAME
    ? url.pathToFileURL(distDir).href.replace('file://', `file:////wsl.localhost/${process.env.WSL_DISTRO_NAME}`)
    : url.pathToFileURL(distDir).href

if (isDev) {
    console.info(`
        ${'-'.repeat(80)}

            Development Notes:
                1. Go into Chrome -> Extensions -> TamperMonkey -> Enable "Allow access to file URLs"
                2. Install http://localhost:8080/${packageJson.name}.proxy.user.js

        ${'-'.repeat(80)}
    `)
}

const config: webpack.Configuration = {
    target: 'web',

    mode: isDev
        ? 'development'
        : 'production',

    devtool: false,

    entry: {
        [packageJson.name]: path.resolve(srcDir, 'main.ts'),
    },

    output: {
        path: distDir,
    },

    resolve: {
        extensions: ['.ts', '.js', '.vue'],
        alias: {
            '@css': path.resolve(srcDir, 'assets', 'css'),
            '@img': path.resolve(srcDir, 'assets', 'img'),
        },
    },

    module: {
        rules: [
            {
                test: /\.tsx?$/,
                exclude: /node_modules/,
                use: [{
                    loader: 'esbuild-loader',
                    options: {
                        loader: 'ts',
                    },
                }],
            },
            {
                test: /\.vue$/,
                use: 'vue-loader',
            },
            {
                test: /\.s(a|c)ss$/,
                use: [
                    'style-loader',
                    'css-loader',
                    {
                        loader: 'sass-loader',
                        options: {
                            additionalData: '@use "sass:color"; @use "sass:math"; @use "@css/variables.scss" as *;',
                        },
                    },
                ],
            },
            {
                test: /\.(png|jpg|gif)$/,
                type: 'asset/inline',
            },
        ],
    },

    devServer: {
        hot: false,
        webSocketServer: false,
        devMiddleware: {
            writeToDisk: true,
        },
    },

    plugins: [
        new webpack.DefinePlugin({
            __VUE_OPTIONS_API__: JSON.stringify(false),
            __VUE_PROD_DEVTOOLS__: JSON.stringify(false),
            __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: JSON.stringify(false),

            __IS_DEV__: JSON.stringify(isDev),
            __NAME__: JSON.stringify(packageJson.name),
            __PRODUCT_NAME__: JSON.stringify(packageJson.productName),
            __AUTHOR__: JSON.stringify(packageJson.author),
            __DESC__: JSON.stringify(packageJson.description),
            __VERSION__: JSON.stringify(packageJson.version),
            __REPO_URL__: JSON.stringify(packageJson.repository.url),
        }),
        new VueLoaderPlugin(),
        new HtmlWebpackPlugin({
            inject: false,
        }),
        new WebpackUserscript.default({
            headers: {
                name: packageJson.productName,
                version: isDev
                    ? '0.0.0'
                    : packageJson.version,
                match: [
                    '*://*.youtube.com/*',
                ],
                grant: [
                    'GM.getValue',
                    'GM.setValue',
                ],
            },
            ...(isDev
                ? {
                    proxyScript: {
                        baseURL: `${baseUrl}/`,
                        filename: '[basename].proxy.user.js',
                    },
                }
                : {}
            ),
        }),
    ],
}

export default config
