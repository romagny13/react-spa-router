var path = require('path');

module.exports = {
    debug: true,
    noInfo: false,
    target: 'web',
    entry: './test/unit/index.js',
    output: {
        path: path.resolve(__dirname, 'test'),
        publicPath: '/',
        filename: 'bundle.js'
    },
    resolve: {
         extensions: ["", ".ts", ".tsx", ".js"]
    },
    module: {
        loaders: [
              { test: /\.tsx?$/, exclude: /node_modules/, loader: "ts-loader" }
        ]
    }
}

