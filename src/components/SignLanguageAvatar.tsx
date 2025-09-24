import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Text, Dimensions } from 'react-native';
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
  const [isWeb, setIsWeb] = useState(false);
  const [model, setModel] = useState<THREE.Group | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [glbLoaded, setGlbLoaded] = useState(false);

  useEffect(() => {
    // Détecter si on est sur le web
    setIsWeb(typeof window !== 'undefined');
  }, []);

  const onContextCreate = async (gl: any) => {
    // Créer le renderer Three.js
    const renderer = new Renderer({ gl });
    renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);
    renderer.setClearColor('#00000000', 0); // Fond transparent

    // Créer la scène
    const scene = new THREE.Scene();

    // Créer la caméra
    const camera = new THREE.PerspectiveCamera(
      75,
      gl.drawingBufferWidth / gl.drawingBufferHeight,
      0.1,
      1000
    );
    camera.position.set(0, -0.5, 4); // Plus loin et légèrement vers le bas pour voir tout l'avatar

    // Ajouter la lumière
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8); // Plus de lumière
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0); // Plus de lumière
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // Charger le modèle GLB
    const loader = new GLTFLoader();
    let avatarModel: THREE.Group | null = null;

    try {
      console.log('Tentative de chargement du modèle GLB...');
      // Charger le modèle depuis les assets - essayer plusieurs chemins
      let gltf;
      try {
        gltf = await loader.loadAsync(require('../../assets/avatar.glb'));
      } catch (pathError) {
        console.log('Erreur avec require, essai avec chemin absolu...');
        gltf = await loader.loadAsync('/assets/avatar.glb');
      }
      
      avatarModel = gltf.scene;
      
      console.log('Modèle GLB chargé avec succès:', avatarModel);
      
      // Ajuster la taille et la position du modèle - TAILLE OPTIMISÉE
      avatarModel.scale.set(1.8, 1.8, 1.8); // Taille optimisée pour voir tout l'avatar
      avatarModel.position.set(0, 0, 0);
      
      // Centrer le modèle
      const box = new THREE.Box3().setFromObject(avatarModel);
      const center = box.getCenter(new THREE.Vector3());
      avatarModel.position.sub(center);
      
      scene.add(avatarModel);
      setModel(avatarModel);
      setGlbLoaded(true);
      setIsLoading(false);
      
      console.log('Modèle GLB ajouté à la scène');
    } catch (error) {
      console.error('Erreur lors du chargement du modèle GLB:', error);
      setIsLoading(false);
      setGlbLoaded(false);
      // Pas de fallback géométrique - on utilise seulement l'avatar 2D
      console.log('Utilisation de l\'avatar 2D de fallback');
    }

    // Animation
    const animate = () => {
      requestAnimationFrame(animate);

      if (model) {
        if (isSigning) {
          // Animation pour la langue des signes - GESTES SPÉCIFIQUES
          const time = Date.now() * 0.001;
          
          // Animation de la tête - regard attentif
          model.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              const name = child.name.toLowerCase();
              
              // Animation de la tête
              if (name.includes('head') || name.includes('tete') || name.includes('visage')) {
                child.rotation.y = Math.sin(time * 0.5) * 0.1;
                child.rotation.x = Math.sin(time * 0.3) * 0.05;
              }
              
              // Animation des bras - gestes de langue des signes
              if (name.includes('arm') || name.includes('bras')) {
                if (name.includes('left') || name.includes('gauche')) {
                  // Bras gauche - gestes principaux
                  child.rotation.z = Math.sin(time * 2) * 0.4;
                  child.rotation.x = Math.sin(time * 1.5) * 0.3;
                  child.rotation.y = Math.sin(time * 0.8) * 0.2;
                } else if (name.includes('right') || name.includes('droite')) {
                  // Bras droit - gestes de support
                  child.rotation.z = Math.sin(time * 2 + Math.PI) * 0.3;
                  child.rotation.x = Math.sin(time * 1.5 + Math.PI) * 0.2;
                  child.rotation.y = Math.sin(time * 0.8 + Math.PI) * 0.15;
                }
              }
              
              // Animation des mains - gestes précis
              if (name.includes('hand') || name.includes('main')) {
                if (name.includes('left') || name.includes('gauche')) {
                  // Main gauche - gestes de signes
                  child.rotation.z = Math.sin(time * 3) * 0.5;
                  child.rotation.x = Math.sin(time * 2.5) * 0.4;
                  child.rotation.y = Math.sin(time * 1.8) * 0.3;
                } else if (name.includes('right') || name.includes('droite')) {
                  // Main droite - gestes de support
                  child.rotation.z = Math.sin(time * 3 + Math.PI) * 0.4;
                  child.rotation.x = Math.sin(time * 2.5 + Math.PI) * 0.3;
                  child.rotation.y = Math.sin(time * 1.8 + Math.PI) * 0.2;
                }
              }
              
              // Animation des doigts si présents
              if (name.includes('finger') || name.includes('doigt')) {
                child.rotation.z = Math.sin(time * 4) * 0.6;
              }
              
              // Animation du corps - légère oscillation
              if (name.includes('body') || name.includes('corps') || name.includes('torso')) {
                child.rotation.y = Math.sin(time * 0.3) * 0.05;
              }
            }
          });
          
          // Animation générale de l'avatar - rotation subtile
          model.rotation.y = Math.sin(time * 0.2) * 0.1;
          
        } else {
          // Reset animations - position neutre
          model.rotation.set(0, 0, 0);
          model.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              const name = child.name.toLowerCase();
              
              // Reset des bras
              if (name.includes('arm') || name.includes('bras')) {
                child.rotation.set(0, 0, 0);
              }
              
              // Reset des mains
              if (name.includes('hand') || name.includes('main')) {
                child.rotation.set(0, 0, 0);
              }
              
              // Reset de la tête
              if (name.includes('head') || name.includes('tete') || name.includes('visage')) {
                child.rotation.set(0, 0, 0);
              }
              
              // Reset du corps
              if (name.includes('body') || name.includes('corps') || name.includes('torso')) {
                child.rotation.set(0, 0, 0);
              }
            }
          });
        }
      }

      renderer.render(scene, camera);
      gl.endFrameEXP();
    };

    animate();
  };

  if (!isWeb) {
    // Fallback pour mobile - avatar 2D simple avec animations
    return (
      <View style={[styles.container, style]}>
        <View style={[styles.avatar2D, isSigning && styles.avatarSigning]}>
          <Text style={styles.avatarEmoji}>
            {isSigning ? "🤟" : "👤"}
          </Text>
        </View>
        {isSigning && (
          <Text style={styles.signingText}>Signe en cours...</Text>
        )}
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      {isLoading && (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>
            {glbLoaded ? 'Chargement de l\'avatar...' : 'Chargement du modèle GLB...'}
          </Text>
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
  avatar2D: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#2196F3',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#146454',
  },
  avatarSigning: {
    backgroundColor: '#FFD700',
    transform: [{ scale: 1.1 }],
  },
  avatarEmoji: {
    fontSize: 28,
  },
  signingText: {
    position: 'absolute',
    bottom: 10,
    color: '#666',
    fontSize: 12,
  },
});

export default SignLanguageAvatar;
