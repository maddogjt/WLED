const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const CompressionPlugin = require('compression-webpack-plugin');
const { HotModuleReplacementPlugin, webpack } = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');
const { existsSync } = require('fs');
const PreactRefreshPlugin = require('@prefresh/webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const SizePlugin = require('size-plugin');

const PATHS = {
  src: path.join(__dirname, 'src'),
};

module.exports = function (env, argv) {
  const isEnvDevelopment = argv.mode === 'development';
  const isEnvProduction = argv.mode === 'production';

  return {
    mode: isEnvProduction ? 'production' : isEnvDevelopment && 'development',

    // Stop compilation early in production
    bail: isEnvProduction,
    devtool: isEnvProduction ? 'source-map' : isEnvDevelopment && 'cheap-module-source-map',

    entry: {
      index: './src/index.tsx',
    },

    optimization: {
      concatenateModules: !Boolean(env.noconcat),
      usedExports: true,
      minimize: isEnvProduction,
      minimizer: [
        new TerserPlugin({
          parallel: true,
          terserOptions: {
            // https://github.com/webpack-contrib/terser-webpack-plugin#terseroptions
          },
        }),
      ],
    },

    output: {
      filename: '[name].bundle.js',
      path: path.resolve(__dirname, './dist'),
      publicPath: '/',
    },

    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx'],
      alias: {
        // preact: path.resolve(__dirname, "node_modules/preact"),
        'color-picker': path.resolve(__dirname, 'src/controls/color-picker/'),
        predux: path.resolve(__dirname, 'src/libraries/predux/'),
        'predux/preact': path.resolve(__dirname, 'src/libraries/predux/preact'),
        // react: "preact/compat",
        // "react-dom/test-utils": "preact/test-utils",
        // "react-dom": "preact/compat",
        // react: "preact/compat",
        // "react-dom/test-utils": "preact/test-utils",
        // "react-dom": "preact/compat",
        // Must be below test-utils
      },
    },

    stats: {
      // Display bailout reasons
      // optimizationBailout: true,
    },

    devServer: {
      contentBase: './dist',
      hot: true,
      compress: false,
      historyApiFallback: true,
    },

    plugins: [
      Boolean(env.analyze) &&
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          defaultSizes: 'gzip',
          reportFilename: 'stats/bundle-analyzer.html',
          openAnalyzer: false,

          generateStatsFile: env.analyze, // Expensive. Only generate when needed
          statsFilename: 'stats/stats.json',
        }),
      isEnvProduction && new SizePlugin(),
      isEnvProduction && new CleanWebpackPlugin(),
      new HtmlWebpackPlugin(
        Object.assign(
          {},
          {
            title: 'WebPack - Preact',
            template: './public/index.html',
            inlineSource: '.(js|css)$',
          },
          isEnvProduction
            ? {
                minify: {
                  removeComments: true,
                  collapseWhitespace: true,
                  removeRedundantAttributes: true,
                  useShortDoctype: true,
                  removeEmptyAttributes: true,
                  removeStyleLinkTypeAttributes: true,
                  keepClosingSlash: true,
                  minifyJS: true,
                  minifyCSS: true,
                  minifyURLs: true,
                },
              }
            : undefined
        )
      ),
      new ForkTsCheckerWebpackPlugin({
        typescript: {
          diagnosticOptions: {
            semantic: true,
            syntactic: true,
          },
          mode: 'write-references',
        },
      }),
      isEnvProduction &&
        new MiniCssExtractPlugin({
          filename: '[name].css',
        }),
      isEnvProduction &&
        new CompressionPlugin({
          filename: '[path][base].gz[query]',
          algorithm: 'gzip',
          test: /\.(js|css|html?|svg|ico)$/,
          threshold: 10240,
          minRatio: 0.8,
        }),
      isEnvProduction &&
        new CompressionPlugin({
          filename: '[path][base].br[query]',
          algorithm: 'brotliCompress',
          test: /\.(js|css|html?|svg|ico)$/,
          compressionOptions: {
            level: 11,
          },
          threshold: 10240,
          minRatio: 0.8,
        }),
      isEnvDevelopment && new HotModuleReplacementPlugin(),
      isEnvDevelopment && new PreactRefreshPlugin(),
    ].filter(Boolean),

    module: {
      rules: [
        {
          // SASS
          enforce: 'pre',
          test: /\.s[ac]ss$/,
          loader: 'sass-loader',
        },
        {
          test: /\.(p?css|less|s[ac]ss|styl)$/,
          // include: ['./src'],
          use: [
            isEnvProduction ? MiniCssExtractPlugin.loader : 'style-loader',
            {
              loader: 'css-loader',
              options: {
                importLoaders: 1,
                sourceMap: true,
              },
            },
            {
              loader: 'postcss-loader',
              options: {
                postcssOptions: {
                  plugins: [
                    ['postcss-preset-env'],
                    isEnvProduction && [
                      '@fullhuman/postcss-purgecss',
                      {
                        content: ['./src/**/*.{js,jsx,ts,tsx}'],
                        defaultExtractor: (content) => content.match(/[\w-/:]+(?<!:)/g) || [],
                        safelist: ['html', 'body'],
                      },
                    ],
                  ].filter(Boolean),
                },
              },
            },
          ],
        },
        // For webpack v5
        {
          test: /\.(png|jpe?g|gif|svg|eot|ttf|woff|woff2)$/i,
          // More information here https://webpack.js.org/guides/asset-modules/
          type: 'asset',
        },
        {
          test: /\.(tsx?|jsx?)$/,
          loader: 'babel-loader',
          exclude: /node_modules/,
          options: {
            envName: isEnvProduction ? 'production' : 'development',
          },
        },
      ],
    },
  };
};
