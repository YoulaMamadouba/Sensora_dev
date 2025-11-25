const { withAppBuildGradle } = require('@expo/config-plugins');

/**
 * Plugin pour supprimer la propriété enableBundleCompression qui n'est plus supportée dans React Native 0.76+
 */
const withFixBundleCompression = (config) => {
  return withAppBuildGradle(config, (config) => {
    if (config.modResults.contents) {
      let contents = config.modResults.contents;
      
      // Supprimer la ligne enableBundleCompression dans le bloc react { }
      // Pattern: enableBundleCompression = true/false (avec ou sans espaces)
      contents = contents.replace(
        /(\s*)enableBundleCompression\s*=\s*[^\n]*\n/g,
        ''
      );
      
      // Supprimer aussi les variantes avec des commentaires
      contents = contents.replace(
        /(\s*)enableBundleCompression\s*=\s*[^\n]*\/\/.*\n/g,
        ''
      );
      
      // Nettoyer les lignes vides multiples (max 2 lignes vides consécutives)
      contents = contents.replace(/\n\s*\n\s*\n+/g, '\n\n');
      
      config.modResults.contents = contents;
    }
    return config;
  });
};

module.exports = withFixBundleCompression;

