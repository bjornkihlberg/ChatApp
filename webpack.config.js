const path = require("path")
const HtmlWebpackPlugin = require('html-webpack-plugin')


module.exports = {
    mode: "development",
    entry: "./Client/main",
    output: {
        path: path.resolve(__dirname, "./public/"),
        filename: "bundle.js"
    },
    resolve: { extensions: [".ts", ".tsx", ".js"] },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                enforce: "pre",
                use: [{
                    loader: "tslint-loader",
                    options: { emitErrors: true, typeCheck: true }
                }]
            },
            {
                test: /\.css$/,
                use: [
                    "style-loader",
                    {
                        loader: "css-loader",
                        options: { modules: true }
                    }
                ]
            },
            {
                test: /\.tsx?$/,
                loader: "ts-loader"
            }
        ]
    },
    plugins: [new HtmlWebpackPlugin({ template: "./Client/index.html" })]
}