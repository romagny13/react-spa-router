var fs = require('fs');
var zlib = require('zlib');
var rollup = require('rollup');
var uglify = require('uglify-js');
var typescript = require('rollup-plugin-typescript');
var version = process.env.VERSION || require('../package.json').version;
var banner =
    '/*!\n' +
    ' * React Spa Router v' + version + '\n' +
    ' * (c) ' + new Date().getFullYear() + ' romagny13\n' +
    ' * Released under the MIT License.\n' +
    ' */';

rollup.rollup({
    entry: "./src/main.ts",
    plugins: [typescript({
        typescript: require('typescript')
    })]
})
    .then(function (bundle) {
        return write('dist/react-spa-router.js', bundle.generate({
            format: 'umd',
            banner: banner,
            moduleName: 'ReactSpaRouter'
        }).code)
    })
    .then(function () {
        return write(
            'dist/react-spa-router.min.js',
            banner + '\n' + uglify.minify('dist/react-spa-router.js').code
        )
    })
    .then(function () {
        return new Promise(function (resolve, reject) {
            fs.readFile('dist/react-spa-router.min.js', function (err, buf) {
                if (err) return reject(err)
                zlib.gzip(buf, function (err, buf) {
                    if (err) return reject(err)
                    write('dist/react-spa-router.min.gz', buf).then(resolve)
                })
            })
        })
    })
    .catch(logError);

function write(dest, code) {
    return new Promise(function (resolve, reject) {
        fs.writeFile(dest, code, function (err) {
            if (err) return reject(err)
            console.log(blue(dest) + ' ' + getSize(code))
            resolve()
        })
    })
};

function getSize(code) {
    return (code.length / 1024).toFixed(2) + 'kb'
};

function logError(e) {
    console.log(e)
};

function blue(str) {
    return '\x1b[1m\x1b[34m' + str + '\x1b[39m\x1b[22m'
};
