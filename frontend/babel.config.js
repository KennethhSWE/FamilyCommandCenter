module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          alias: {
            '@': './app',
          },
        },
      ],
      'react-native-reanimated/plugin', // 👈 must be last in the list
    ],
  };
};