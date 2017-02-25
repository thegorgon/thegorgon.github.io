var path = require("path")
var webpack = require('webpack')
var BundleTracker = require('webpack-bundle-tracker')
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');

var nodeEnv = process.env.NODE_ENV;
var bundleTrackerFilename = './webpack-stats.json';

var config = {
  context: __dirname + '/src/assets',

  devtool: "source-map",

  entry: {
    index: './javascripts/index'
  },

  output: {
    path: path.resolve('./src/assets/bundles/'),
    filename: "[name].js",
  },

  plugins: [
    new BundleTracker({filename: bundleTrackerFilename}),
    new ExtractTextPlugin({ filename: 'index.css', disable: false, allChunks: true })
  ],

  module: {
    rules: [
      { test: /\.jsx?$/,
        exclude: [/node_modules/],
        use: [{
          loader: 'babel-loader'
        }]
      }, // to transform JSX into JS
      { test: /\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: 'css-loader',
        })
      },
      { test: /\.scss$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            { loader: 'css-loader', options: { sourceMap: true } },
            { loader: 'resolve-url-loader', options: { sourceMap: true } },
            { loader: 'sass-loader', options: { sourceMap: true } }
          ]
        })
      },
      { test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        use: [{
          loader: 'url-loader',
          options: {
            limit: 10000,
            mimetype: 'application/font-woff',
            name: '[name].[ext]'
          }
        }]
      },
      { test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        use: [{
          loader: "file-loader",
          options: {
            name: '[name].[ext]'
          }
        }]
      },
      { test: /.*\.(ico|gif|png|jpe?g|svg)$/i,
        use: [
          {
            loader: 'file-loader',
            options: {
              hash: 'sha512',
              digest: 'hex',
              name: '[path][name].[ext]'
            }
          },
          {
            loader: 'image-webpack-loader',
            options: {
              mozjpeg: {
                quality: 65
              },
              pngquant:{
                quality: "65-90",
                speed: 4
              },
              svgo:{
                plugins: [
                  {
                    removeViewBox: false
                  },
                  {
                    removeEmptyAttrs: false
                  }
                ]
              }
            }
          }
        ]
      }
    ],
  },

  resolve: {
    modules: ['node_modules'],
    extensions: ['.js', '.jsx', '.json']
  },
};

if (nodeEnv === 'production') {
  config.output.path = path.resolve('./assets/dist');
  config.plugins.push(new webpack.DefinePlugin({
    'process.env': {
      NODE_ENV: JSON.stringify('production')
    }
  }));
  new webpack.optimize.UglifyJsPlugin()
  config.plugins.push(
    new webpack.optimize.UglifyJsPlugin({ compress: { warnings: false } })
  );
  config.plugins.push(
    new OptimizeCssAssetsPlugin()
  );
  config.output.filename = '[name]-[hash].js';
}

module.exports = config;
