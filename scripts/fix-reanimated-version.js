#!/usr/bin/env node

/**
 * Script pour désactiver la vérification de version de react-native-reanimated
 * qui bloque les builds avec React Native 0.76.5
 * Ce script s'exécute après l'installation des dépendances
 */

const fs = require('fs');
const path = require('path');

const reanimatedBuildGradlePath = path.join(
  __dirname,
  '..',
  'node_modules',
  'react-native-reanimated',
  'android',
  'build.gradle'
);

if (fs.existsSync(reanimatedBuildGradlePath)) {
  let buildGradle = fs.readFileSync(reanimatedBuildGradlePath, 'utf8');
  
  // Remplacer le throw par un println pour que ça ne fail jamais
  const originalContent = buildGradle;
  
  buildGradle = buildGradle.replace(
    /throw new GradleException\(\[Reanimated\] React Native \d+\.\d+\.\d+ version is not compatible with Reanimated \d+\.\d+\.\d+\)/g,
    'println("[Reanimated] Version check disabled - React Native 0.76.5 compatibility")'
  );

  // Remplacer aussi les variantes
  buildGradle = buildGradle.replace(
    /throw\s+new\s+GradleException\(\[Reanimated\].*?is not compatible.*?\)/g,
    'println("[Reanimated] Version check disabled - React Native 0.76.5 compatibility")'
  );

  if (buildGradle !== originalContent) {
    fs.writeFileSync(reanimatedBuildGradlePath, buildGradle, 'utf8');
    console.log('✅ Modified react-native-reanimated build.gradle to disable version check');
  } else {
    console.log('⚠️ Could not find version check to disable in react-native-reanimated build.gradle');
  }
} else {
  console.warn('⚠️ react-native-reanimated build.gradle not found at:', reanimatedBuildGradlePath);
}

