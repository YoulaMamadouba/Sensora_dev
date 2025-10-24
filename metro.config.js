const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Ajouter le support pour les fichiers GLB/GLTF et FBX
config.resolver.assetExts.push('glb', 'gltf', 'fbx');

module.exports = config;
