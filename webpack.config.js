const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

const { NODE_ENV: ENV } = process.env;
const isProduction = ENV === 'production';

const libraryName = 'Funcaches';

const config = {
  entry: `${__dirname}/src/funcaches.js`,
  mode: ENV || 'development',
  devtool: 'source-map',
  output: {
    path: `${__dirname}/dist`,
    filename: `${libraryName.toLowerCase()}${isProduction ? '.min' : ''}.js`,
    library: libraryName,
    libraryTarget: 'umd',
    umdNamedDefine: true,
  },
  module: {
    rules: [{
      test: /(\.jsx|\.js)$/,
      loader: 'babel-loader',
      exclude: /node_modules/,
    }],
  },
  resolve: {
    modules: [__dirname, `${__dirname}/src`, 'node_modules'],
    extensions: ['*', '.js'],
  },
  plugins: [
    ...(isProduction ? [new UglifyJsPlugin({
      sourceMap: true,
    })] : []),
  ],
};

module.exports = config;
