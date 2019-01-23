const path = require("path")

module.exports = {
    mode: "development",
    entry: "./Client/Client.fsproj",
    output: {
        path: path.join(__dirname, "./public"),
        filename: "bundle.js"
    },
    module: {
        rules: [{
            test: /\.fs(proj)?$/,
            use: "fable-loader"
        }]
    }
}