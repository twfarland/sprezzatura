module.exports = {
    entry: {
        "tests.js": "./test/tests.ts"
    },
    output: {
        path: "test/",
        filename: "[name]"
    },
    resolve: {
        extensions: ["", ".webpack.js", ".web.js", ".ts", ".tsx", ".js"]
    },
    module: {
        loaders: [
            { test: /\.tsx?$/, loader: "ts-loader" }
        ]
    }
}