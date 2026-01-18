module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          alias: {
            'lucide-react-native': 'lucide-react-native/dist/cjs/lucide-react-native.js',
          },
        },
      ],
      'react-native-reanimated/plugin',
    ],
  };
};
