const path = require('path')
const Webpack = require('webpack')

const config = {
  entry: './src/main.js',

  output: {
    path: path.join(__dirname, 'dist'),
    publicPath: '/dist/',
    filename: 'bundle.js'
  },

  module: {
    rules: [
      {
        test: /\.vue$/,
        exclude: /node_modules/,
        use: 'vue-loader'
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: 'babel-loader'
      }
    ],
  },

  devtool: 'cheap-eval-sourcemaps',

  plugins: [
    new Webpack.HotModuleReplacementPlugin(),
    new Webpack.SourceMapDevToolPlugin({
      filename: '[name].map',
    })
  ],

  devServer: {
    contentBase: __dirname,
    port: 9000,
    hot: true,
    noInfo: true,
    overlay: true,
  }
}

module.exports = config
