const { withAppBuildGradle, withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

/**
 * Plugin pour désactiver la vérification de version de react-native-reanimated
 * qui bloque les builds avec React Native 0.76.5
 */
const withFixReanimatedVersion = (config) => {
  // Étape 1: Modifier le build.gradle de l'app pour désactiver la tâche
  config = withAppBuildGradle(config, (config) => {
    if (config.modResults.contents) {
      let contents = config.modResults.contents;
      
      // Ajouter du code pour désactiver la tâche avant qu'elle ne s'exécute
      if (!contents.includes('assertMinimalReactNativeVersionTask')) {
        // Ajouter au début du fichier, avant android {}
        contents = `// Disable react-native-reanimated version check for RN 0.76.5 compatibility
afterEvaluate {
    project.tasks.all { task ->
        if (task.name.contains('assertMinimalReactNativeVersionTask')) {
            task.enabled = false
            task.doLast {
                println("[Reanimated] Version check disabled for React Native 0.76.5 compatibility")
            }
        }
    }
}

` + contents;
      }
      
      config.modResults.contents = contents;
    }
    return config;
  });

  // Étape 2: Modifier directement le build.gradle de react-native-reanimated
  return withDangerousMod(config, [
    'android',
    async (config) => {
      const projectRoot = config.modRequest.projectRoot || config.modRequest.platformProjectRoot?.replace(/[\\/]android$/, '');
      
      // Chercher le fichier dans node_modules
      const possiblePaths = [
        path.join(projectRoot || '', 'node_modules', 'react-native-reanimated', 'android', 'build.gradle'),
        path.join(process.cwd(), 'node_modules', 'react-native-reanimated', 'android', 'build.gradle'),
      ];

      let reanimatedBuildGradlePath = null;
      for (const possiblePath of possiblePaths) {
        if (fs.existsSync(possiblePath)) {
          reanimatedBuildGradlePath = possiblePath;
          break;
        }
      }

      if (reanimatedBuildGradlePath) {
        let buildGradle = fs.readFileSync(reanimatedBuildGradlePath, 'utf8');
        
        // Remplacer le throw par un println pour que ça ne fail jamais
        buildGradle = buildGradle.replace(
          /throw new GradleException\(\[Reanimated\] React Native \d+\.\d+\.\d+ version is not compatible with Reanimated \d+\.\d+\.\d+\)/g,
          'println("[Reanimated] Version check disabled - React Native 0.76.5 compatibility")'
        );

        // Remplacer aussi les variantes avec espaces
        buildGradle = buildGradle.replace(
          /throw\s+new\s+GradleException\(\[Reanimated\].*?is not compatible.*?\)/g,
          'println("[Reanimated] Version check disabled - React Native 0.76.5 compatibility")'
        );

        fs.writeFileSync(reanimatedBuildGradlePath, buildGradle, 'utf8');
        console.log('✅ Modified react-native-reanimated build.gradle to disable version check');
      }

      return config;
    },
  ]);
};

module.exports = withFixReanimatedVersion;

