const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Ajouter le support pour les fichiers GLB/GLTF
config.resolver.assetExts.push('glb', 'gltf');

module.exports = config;
