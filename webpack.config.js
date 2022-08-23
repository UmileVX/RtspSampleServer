const path = require("path");

module.exports = {
    mode: "development",
    entry: {
        viewer_all: "./public/js/viewer_all.js",
    },
    devtool: "inline-source-map",
    output: {
        path: path.resolve("./dist"),
        filename: "[name]_bundle.js",
    },
};
