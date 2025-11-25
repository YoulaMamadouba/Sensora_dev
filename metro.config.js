const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Ajouter le support pour les fichiers GLB/GLTF, FBX et vidéos
config.resolver.assetExts.push('glb', 'gltf', 'fbx', 'mov', 'MOV', 'mp4', 'MP4');

module.exports = config;
