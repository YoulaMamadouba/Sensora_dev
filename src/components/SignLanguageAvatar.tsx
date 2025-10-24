import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, Dimensions, Platform } from 'react-native';
import { GLView } from 'expo-gl';
import { Renderer } from 'expo-three';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const { width } = Dimensions.get('window');

interface SignLanguageAvatarProps {
  isSigning: boolean;
  signText: string;
  currentSign?: string;
  style?: any;
}

const SignLanguageAvatar: React.FC<SignLanguageAvatarProps> = ({ 
  isSigning, 
  signText, 
  currentSign = "",
  style 
}) => {
  const [model, setModel] = useState<THREE.Group | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const onContextCreate = async (gl: any) => {
    console.log('🎯 CRÉATION DU CONTEXTE GL...');
    
    // Créer le renderer Three.js
    const renderer = new Renderer({ gl });
    renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);
    renderer.setClearColor(0x000000, 0); // Fond transparent

    // Créer la scène
    const scene = new THREE.Scene();

    // Créer la caméra
    const camera = new THREE.PerspectiveCamera(
      75,
      gl.drawingBufferWidth / gl.drawingBufferHeight,
      0.1,
      1000
    );
    camera.position.set(0, -0.5, 4);

    // Ajouter la lumière
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // Charger le modèle GLB
    const loader = new GLTFLoader();
    let avatarModel: THREE.Group | null = null;

    try {
      console.log('📁 Chargement du modèle avatar.glb...');
      
      // Essayer de charger le fichier
      let gltf;
      try {
        console.log('📁 Tentative 1: require(../../assets/avatar.glb)');
        gltf = await loader.loadAsync(require('../../assets/avatar.glb'));
      } catch (error1) {
        console.log('❌ Tentative 1 échouée, essai 2...');
        try {
          console.log('📁 Tentative 2: require(../../../assets/avatar.glb)');
          gltf = await loader.loadAsync(require('../../../assets/avatar.glb'));
        } catch (error2) {
          console.log('❌ Tentative 2 échouée, essai 3...');
          console.log('📁 Tentative 3: /assets/avatar.glb');
          gltf = await loader.loadAsync('/assets/avatar.glb');
        }
      }
      
      avatarModel = gltf.scene;
      console.log('✅ Modèle GLB chargé avec succès !');
      console.log('🎨 Nombre d\'enfants:', avatarModel.children.length);
      
      // Ajuster la taille et la position
      avatarModel.scale.set(1.8, 1.8, 1.8);
      avatarModel.position.set(0, 0, 0);
      
      // Centrer le modèle
      const box = new THREE.Box3().setFromObject(avatarModel);
      const center = box.getCenter(new THREE.Vector3());
      avatarModel.position.sub(center);
      
      scene.add(avatarModel);
      setModel(avatarModel);
      setIsLoading(false);
      
      console.log('✅ Modèle ajouté à la scène avec succès !');
      
    } catch (error) {
      console.error('❌ Erreur chargement GLB:', error);
      setIsLoading(false);
      
      // Créer un cube de fallback pour tester
      console.log('🔄 Création d\'un cube de fallback...');
      const geometry = new THREE.BoxGeometry(1, 1, 1);
      const material = new THREE.MeshLambertMaterial({ color: 0x00FF00 });
      const cube = new THREE.Mesh(geometry, material);
      scene.add(cube);
      setModel(cube);
    }

    // Animation
    const animate = () => {
      requestAnimationFrame(animate);

      if (model) {
        if (isSigning) {
          const time = Date.now() * 0.001;
          
          // Animation pour la langue des signes
          model.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              const name = child.name.toLowerCase();
              
              if (name.includes('arm') || name.includes('bras')) {
                if (name.includes('left') || name.includes('gauche')) {
                  child.rotation.z = Math.sin(time * 2) * 0.4;
                  child.rotation.x = Math.sin(time * 1.5) * 0.3;
                  child.rotation.y = Math.sin(time * 0.8) * 0.2;
                } else if (name.includes('right') || name.includes('droite')) {
                  child.rotation.z = Math.sin(time * 2 + Math.PI) * 0.3;
                  child.rotation.x = Math.sin(time * 1.5 + Math.PI) * 0.2;
                  child.rotation.y = Math.sin(time * 0.8 + Math.PI) * 0.15;
                }
              }
              
              if (name.includes('hand') || name.includes('main')) {
                if (name.includes('left') || name.includes('gauche')) {
                  child.rotation.z = Math.sin(time * 3) * 0.5;
                  child.rotation.x = Math.sin(time * 2.5) * 0.4;
                  child.rotation.y = Math.sin(time * 1.8) * 0.3;
                } else if (name.includes('right') || name.includes('droite')) {
                  child.rotation.z = Math.sin(time * 3 + Math.PI) * 0.4;
                  child.rotation.x = Math.sin(time * 2.5 + Math.PI) * 0.3;
                  child.rotation.y = Math.sin(time * 1.8 + Math.PI) * 0.2;
                }
              }
            }
          });
          
          model.rotation.y = Math.sin(time * 0.2) * 0.1;
          
        } else {
          // Reset animations
          model.rotation.set(0, 0, 0);
          model.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              child.rotation.set(0, 0, 0);
            }
          });
        }
      }

      renderer.render(scene, camera);
      gl.endFrameEXP();
    };

    animate();
  };

  return (
    <View style={[styles.container, style]}>
      {isLoading && (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Chargement du modèle GLB...</Text>
        </View>
      )}
      <GLView
        style={styles.glView}
        onContextCreate={onContextCreate}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 240,
    height: 240,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  glView: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.1)',
    zIndex: 1,
  },
  loadingText: {
    color: '#666',
    fontSize: 14,
  },
});

export default SignLanguageAvatar;