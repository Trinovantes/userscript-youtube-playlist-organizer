import { EOL } from 'os'
import path from 'path'
import url from 'url'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import { VueLoaderPlugin } from 'vue-loader'
import webpack from 'webpack'
import 'webpack-dev-server'
import WebpackUserscript from 'webpack-userscript'
import packageJson from './package.json'

const isDev = (process.env.NODE_ENV === 'development')
const srcDir = path.resolve(__dirname, 'src')
const distDir = path.resolve(__dirname, 'dist')
const baseUrl = process.env.WSL_DISTRO_NAME
    ? url.pathToFileURL(distDir).href.replace('file://', `file:////wsl.localhost/${process.env.WSL_DISTRO_NAME}`)
    : url.pathToFileURL(distDir).href

if (isDev) {
    let msg = ''
    const log = (s?: string) => {
        msg += (s ?? '') + EOL
    }

    log('-'.repeat(80))
    log()
    log('Development Notes:')
    log()
    log('1. Go into Chrome -> Extensions -> TamperMonkey -> Enable "Allow access to file URLs"')
    log(`2. Install http://localhost:8080/${packageJson.name}.proxy.user.js`)
    log()
    log('-'.repeat(80))

    console.info(msg)
}

const config: webpack.Configuration = {
    target: 'web',

    mode: isDev
        ? 'development'
        : 'production',

    entry: path.resolve(srcDir, 'main.ts'),
    output: {
        filename: `${packageJson.name}.user.js`,
    },

    resolve: {
        extensions: ['.ts', '.js', '.vue'],
        alias: {
            '@': path.resolve(srcDir),
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
                            additionalData: '@use "sass:math"; @import "@/assets/css/variables.scss";',
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

            'DEFINE.IS_DEV': JSON.stringify(isDev),

            'DEFINE.NAME': JSON.stringify(packageJson.name),
            'DEFINE.PRODUCT_NAME': JSON.stringify(packageJson.productName),
            'DEFINE.AUTHOR': JSON.stringify(packageJson.author),
            'DEFINE.DESC': JSON.stringify(packageJson.description),
            'DEFINE.VERSION': JSON.stringify(packageJson.version),
            'DEFINE.REPO': JSON.stringify(packageJson.repository),
        }),
        new VueLoaderPlugin(),
        new HtmlWebpackPlugin({
            inject: false,
        }),
        new WebpackUserscript({
            headers: {
                name: packageJson.productName,
                version: isDev
                    ? '0.0.0'
                    : '[version]',
                match: [
                    '*://*.youtube.com/*',
                ],
                grant: [
                    'GM.getValue',
                    'GM.setValue',
                ],
                require: [
                    'https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js',
                ],
            },
            proxyScript: {
                enable: isDev,
                baseUrl,
            },
        }),
    ],
}

export default config
