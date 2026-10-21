// Config plugin: puts ShubhShortcuts.swift (App Intents and App Shortcuts)
// into the app target at prebuild. The app fills the answers it reads
// (src/components/siri-sync.tsx).
const fs = require('fs');
const path = require('path');
const { IOSConfig, withDangerousMod, withXcodeProject } = require('expo/config-plugins');

const FILE = 'ShubhShortcuts.swift';

module.exports = function withAppShortcuts(config) {
  config = withDangerousMod(config, ['ios', cfg => {
    const name = IOSConfig.XcodeUtils.getProjectName(cfg.modRequest.projectRoot);
    fs.copyFileSync(path.join(__dirname, FILE), path.join(cfg.modRequest.platformProjectRoot, name, FILE));
    return cfg;
  }]);
  return withXcodeProject(config, cfg => {
    const project = cfg.modResults;
    const name = IOSConfig.XcodeUtils.getProjectName(cfg.modRequest.projectRoot);
    const [targetUuid] = IOSConfig.Target.findNativeTargetByName(project, name);
    if (!project.hasFile(`${name}/${FILE}`)) {
      IOSConfig.XcodeUtils.addBuildSourceFileToGroup({ filepath: `${name}/${FILE}`, groupName: name, project, targetUuid });
    }
    return cfg;
  });
};
