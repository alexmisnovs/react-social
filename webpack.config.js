const path = require("path");

module.exports = {
  entry: "./app/app.js",
  output: {
    publicPath: "/",
    path: path.resolve(__dirname, "app"),
    filename: "bundled.js"
  },
  resolve: {
    extensions: ["*", ".js", ".jsx"]
  },
  mode: "development",
  devtool: "source-map",
  devServer: {
    host: "127.0.0.1",
    port: 5555,
    contentBase: path.join(__dirname, "app"),
    hot: true,
    historyApiFallback: { index: "index.html" }
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /(node_modules)/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-react", ["@babel/preset-env", { targets: { node: "12" } }]]
          }
        }
      }
    ]
  }
};
