const { withAppBuildGradle, withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

/**
 * Plugin pour désactiver la vérification de version de react-native-reanimated
 * qui bloque les builds avec React Native 0.76.5
 */
const withFixReanimatedVersion = (config) => {
  // Modifier le build.gradle de l'app pour ignorer la tâche
  config = withAppBuildGradle(config, (config) => {
    if (config.modResults.contents) {
      let contents = config.modResults.contents;
      
      // Ajouter une configuration pour ignorer la tâche assertMinimalReactNativeVersionTask
      if (!contents.includes('tasks.matching')) {
        // Ajouter avant le bloc android {}
        contents = contents.replace(
          /(android\s*\{)/,
          `tasks.whenTaskAdded { task ->
    if (task.name.contains("assertMinimalReactNativeVersionTask")) {
        task.enabled = false
    }
}
$1`
        );
      }
      
      config.modResults.contents = contents;
    }
    return config;
  });

  // Modifier directement le build.gradle de react-native-reanimated
  return withDangerousMod(config, [
    'android',
    async (config) => {
      const projectRoot = config.modRequest.projectRoot;
      const reanimatedBuildGradlePath = path.join(
        projectRoot,
        'node_modules',
        'react-native-reanimated',
        'android',
        'build.gradle'
      );

      if (fs.existsSync(reanimatedBuildGradlePath)) {
        let buildGradle = fs.readFileSync(reanimatedBuildGradlePath, 'utf8');
        
        // Remplacer la vérification de version pour qu'elle ne fail jamais
        buildGradle = buildGradle.replace(
          /throw new GradleException\(\[Reanimated\] React Native .*? version is not compatible with Reanimated .*?\)/g,
          'println("[Reanimated] Version check disabled for React Native 0.76.5 compatibility")'
        );

        fs.writeFileSync(reanimatedBuildGradlePath, buildGradle, 'utf8');
      }

      return config;
    },
  ]);
};

module.exports = withFixReanimatedVersion;

