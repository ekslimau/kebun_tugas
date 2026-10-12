const { withGradleProperties } = require('expo/config-plugins');

// shortcut: release APK only packages arm64-v8a libs (halves size); add x86 back if you need an emulator build.
const ARCHS = 'arm64-v8a';

module.exports = function gradleAbiPlugin(config) {
  return withGradleProperties(config, (config) => {
    const key = 'reactNativeArchitectures';
    const prop = config.modResults.find((item) => item.type === 'property' && item.key === key);
    if (prop) prop.value = ARCHS;
    else config.modResults.push({ type: 'property', key, value: ARCHS });
    return config;
  });
};
