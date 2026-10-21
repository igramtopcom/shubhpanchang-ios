// app.json holds the config; this file only switches the widget extension.
//
// SP_WIDGETS=off leaves expo-widgets out of the native project: no widget
// extension, no App Group. The TestFlight workflow builds that way until the
// App Group group.in.shubhpanchang.app is registered on the Apple Developer
// site (an App Store Connect API key cannot create App Groups, so cloud
// signing fails without it: run 39629150307). The app reads `extra.widgets`
// (src/lib/features.ts) and then neither feeds widgets nor offers the
// Parana Live Activity.
module.exports = ({ config }) => {
  const widgets = process.env.SP_WIDGETS !== 'off';
  return {
    ...config,
    plugins: widgets
      ? config.plugins
      : config.plugins.filter(p => (Array.isArray(p) ? p[0] : p) !== 'expo-widgets'),
    extra: { ...config.extra, widgets },
  };
};
