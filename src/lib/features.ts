// Features that depend on how the native app was built (app.config.js).
import Constants from 'expo-constants';

/** Widgets and the Parana Live Activity: false when the build left the widget extension out. */
export const WIDGETS = Constants.expoConfig?.extra?.widgets !== false;
