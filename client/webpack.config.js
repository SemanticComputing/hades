const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const path = require('path');

const extractLess = new ExtractTextPlugin({
  filename: '[name].[contenthash].css',
  disable: process.env.NODE_ENV !== 'production'
});

const config = new webpack.DefinePlugin({
  'API_URL': JSON.stringify(process.env.NODE_ENV === 'production' ? 'api/v1' : 'http://localhost:3003/api/v1')
});

module.exports = {
  entry: './src/scripts/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  devServer: {
    contentBase: path.resolve(__dirname, 'public'),
    hot: true
  },
  module: {
    rules: [
      { test: /\.js$/, use: 'babel-loader', exclude: /node_modules/ },
      {
        test: /\.less$/,
        use: extractLess.extract({
          use: [
            { loader: 'css-loader' },
            { loader: 'less-loader' }
          ],
          // use style-loader in development
          fallback: 'style-loader'
        }),
        exclude: /node_modules/
      },
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'public/index.html'
    }),
    new webpack.NamedModulesPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    extractLess,
    config
  ]
};
