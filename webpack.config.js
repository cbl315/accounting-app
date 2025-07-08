const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: path.resolve(__dirname, 'index.web.js'),
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules\/(?!react-native-vector-icons)/,
        use: ['babel-loader'],
      },
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules\/react-native-image-picker/,
        use: ['ts-loader'],
      },
      {
        test: /react-native-image-picker\/.*\.ts$/,
        use: ['babel-loader'],
      },
      {
        test: /\.(png|jpe?g|gif)$/i,
        use: ['file-loader'],
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.ttf$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          mimetype: 'application/octet-stream',
        },
      },
    ],
  },
  resolve: {
    extensions: ['.web.js', '.js', '.jsx', '.ts', '.tsx', '.mjs', '.json'],
    alias: {
      'react-native$': 'react-native-web',
      'react-native-linear-gradient': 'react-native-web-linear-gradient',
      '@expo/vector-icons': 'react-native-vector-icons',
      '@react-native-masked-view/masked-view': path.resolve(__dirname, 'src/utils/MaskedViewWrapper'),
      '../MaskedView': path.resolve(__dirname, 'src/utils/MaskedViewWrapper'),
      'react-native-masked-view': path.resolve(__dirname, 'src/utils/MaskedViewWrapper'),
      './useBackButton': path.resolve(__dirname, 'src/utils/navigationHooks'),
      './useDocumentTitle': path.resolve(__dirname, 'src/utils/navigationHooks'), 
      './useLinking': path.resolve(__dirname, 'src/utils/navigationHooks'),
    },
    fallback: {
      fs: false,
      path: require.resolve('path-browserify'),
      util: require.resolve('util/'),
    },
    mainFields: ['browser', 'module', 'main'],
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    }),
    new webpack.NormalModuleReplacementPlugin(
      /..\/MaskedView/,
      function(resource) {
        resource.request = '@react-native-masked-view/masked-view';
      }
    ),
    new webpack.ProvidePlugin({
      MaskedView: ['@react-native-masked-view/masked-view', 'default']
    }),
  ],
  devServer: {
    static: path.resolve(__dirname, 'public'),
    hot: true,
  },
};
