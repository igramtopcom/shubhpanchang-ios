// app.json holds the config; this file only switches the widget extension.
//
// SP_WIDGETS=off leaves expo-widgets out of the native project: no widget
// extension, no App Group. The TestFlight workflow builds with SP_WIDGETS=on
// since build 15 (2026-10-22), when the App Group group.in.shubhpanchang.app
// was registered on the Apple Developer site; an App Store Connect API key
// cannot create App Groups, so a build without it fails to sign (run
// 39629150307). With widgets off the app reads `extra.widgets`
// (src/lib/features.ts) and neither feeds widgets nor offers the Live Activity.
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
