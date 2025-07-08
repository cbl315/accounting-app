module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    ['@babel/plugin-proposal-decorators', { legacy: true }],
    ['@babel/plugin-proposal-class-properties', { loose: true }],
    ['@babel/plugin-transform-private-methods', { loose: true }],
    ['react-native-web', { commonjs: true }],
    ['module-resolver', {
      alias: {
        '../MaskedView': '@react-native-masked-view/masked-view',
        './useBackButton': '@react-navigation/native',
        './useDocumentTitle': '@react-navigation/native',
        './useLinking': '@react-navigation/native'
      }
    }]
  ],
  env: {
    web: {
      presets: ['@babel/preset-env', '@babel/preset-react', '@babel/preset-typescript'],
    }
  }
};
