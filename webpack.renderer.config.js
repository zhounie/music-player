const rules = require('./webpack.rules');
const CopyWebpackPlugin = require('copy-webpack-plugin')
const path = require('path')



rules.push({
  test: /\.css$/,
  use: [
    { loader: 'style-loader' },
    { loader: 'css-loader' },
    { loader: 'postcss-loader'}
  ],
});

rules.push({
  test: /\.(png|jpg|gif)$/i,
  type: 'asset/resource'
});

module.exports = {
  // Put your normal webpack config below here
  module: {
    rules,
  },
  plugins: ['assets'].map(asset => {
    return new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, 'src', asset),
          to: asset
        }
      ]
    });
  })
};
