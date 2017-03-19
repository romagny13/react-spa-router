var path = require('path'),
    webpack = require('webpack');

module.exports = {
    entry: './example/index',
    output: {
        path: path.resolve(__dirname, './dist'),
        publicPath: '/dist/',
        filename: 'build.js'
    },
    module: {
        loaders: [
            { test: /\.tsx?$/, exclude: /node_modules/, loader: "ts-loader" }
        ]
    },
    resolve: {
        extensions: ["", ".ts", ".tsx", ".js"]
    },
    devServer: {
        contentBase: "./example",
        historyApiFallback: true,
        noInfo: true
    },
    devtool: '#eval-source-map'
}
