import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Text, Dimensions, Platform } from 'react-native';
import { GLView } from 'expo-gl';
import { Renderer } from 'expo-three';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';

// Global window type declaration
declare global {
  interface Window {
    ReactNativeWebView?: any;
  }
}

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
  const [modelReady, setModelReady] = useState(false);
  
  // Refs for FBX animation
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const animationActionRef = useRef<THREE.AnimationAction | null>(null);

  // Debug: Log des props
  useEffect(() => {
    console.log('🎬 SignLanguageAvatar Props:', { isSigning, signText, currentSign });
  }, [isSigning, signText, currentSign]);

  useEffect(() => {
    // Détecteur si on est sur le web - de manière plus robuste
    const detectPlatform = () => {
      try {
         // Vérifier si window existe
         const hasWindow = typeof globalThis !== 'undefined' && (globalThis as any).window;
         // Vérifier si on est sur un navigateur web
         const isWebPlatform = hasWindow && !(globalThis as any).window.ReactNativeWebView;
        
        console.log('🔍 Détection plateforme:');
        console.log('  - hasWindow:', hasWindow);
        console.log('  - isWebPlatform:', isWebPlatform);
        console.log('  - Platform final:', isWebPlatform ? 'WEB' : 'MOBILE');
        
        setIsWeb(isWebPlatform);
      } catch (error) {
        console.log('Platform detection error, assuming web');
        setIsWeb(true);
      }
    };
    
    detectPlatform();
  }, []);

  // 🎬 Avatar sort de l'écran de chargement SEULEMENT quand le texte "salut" arrive
  useEffect(() => {
    if (modelReady && signText && signText.trim()) {
      console.log('🎬 Texte reçu:', signText, '- Avatar prêt à afficher!');
      setIsLoading(false);
    }
  }, [signText, modelReady]);

  const onContextCreate = async (gl: any) => {
    console.log('🎨 onContextCreate called - Setting up Three.js scene');
    console.log('GL Context:', {
      drawingBufferWidth: gl.drawingBufferWidth,
      drawingBufferHeight: gl.drawingBufferHeight
    });

    // Créer le renderer Three.js
    const renderer = new Renderer({ gl });
    renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);
    renderer.setClearColor(0xFFFFFF, 1); // BLANC pour voir le modèle!
    renderer.setPixelRatio(1);

    // Créer la scène
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xFFFFFF); // Fond blanc

    // Créer la caméra
    const camera = new THREE.PerspectiveCamera(
      75,
      gl.drawingBufferWidth / gl.drawingBufferHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 3); // Position PLUS PROCHE

    // Ajouter BEAUCOUP de lumière
    const ambientLight = new THREE.AmbientLight(0xFFFFFF, 2.0); // Très lumineux
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 2.0); // Très lumineux
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Ajouter une lumière supplémentaire de l'autre côté
    const backLight = new THREE.DirectionalLight(0xFFFFFF, 1.0);
    backLight.position.set(-5, -5, 5);
    scene.add(backLight);

    let avatarModel: THREE.Group | null = null;

    try {
      console.log('🎬 Tentative de chargement du modèle...');
      
      let model: THREE.Group | null = null;
      let loadSuccessful = false;

      // Helper function to load model from ArrayBuffer
      const loadModelFromBuffer = async (arrayBuffer: ArrayBuffer, loaderType: 'fbx' | 'glb'): Promise<THREE.Group | null> => {
        try {
          if (loaderType === 'fbx') {
            const fbxLoader = new FBXLoader();
            const loadedModel = (fbxLoader as any).parse(arrayBuffer, '') as THREE.Group;
            console.log('✅ FBX loaded successfully');
            return loadedModel;
          } else {
            const gltfLoader = new GLTFLoader();
            const gltf = await gltfLoader.parseAsync(arrayBuffer, '');
            console.log('✅ GLB loaded successfully');
            return gltf.scene;
          }
        } catch (e) {
          console.log(`  ❌ Failed to parse ${loaderType}:`, e);
          return null;
        }
      };

      // ✅ Strategy 1: Load FBX first (priority) - using require for bundled assets
      if (!loadSuccessful && Platform.OS === 'web') {
        try {
          console.log('📍 Strategy 1: Loading FBX (priority)');
          // On web, we use require to get the bundled asset
          const fbxUrl = require('../../assets/avatar.fbx');
          const response = await fetch(fbxUrl);
          if (response.ok) {
            const arrayBuffer = await response.arrayBuffer();
            model = await loadModelFromBuffer(arrayBuffer, 'fbx');
            if (model) {
              loadSuccessful = true;
              console.log('✅ FBX loading successful');
            }
          }
        } catch (e) {
          console.log('❌ Strategy 1 (FBX) failed:', e);
        }
      }

      // ⏭️ Strategy 2: Fallback to GLB
      if (!loadSuccessful && Platform.OS === 'web') {
        try {
          console.log('📍 Strategy 2: Fallback to GLB');
          const glbUrl = require('../../assets/avatar1.glb');
          const response = await fetch(glbUrl);
          if (response.ok) {
            const arrayBuffer = await response.arrayBuffer();
            model = await loadModelFromBuffer(arrayBuffer, 'glb');
            if (model) {
              loadSuccessful = true;
              console.log('✅ GLB loading successful');
            }
          }
        } catch (e) {
          console.log('❌ Strategy 2 (GLB) failed:', e);
        }
      }

      if (!loadSuccessful) {
        throw new Error('Impossible de charger le modèle 3D (FBX ni GLB trouvés)');
      }
      
      if (!model) throw new Error('Le modèle est null');
      
      avatarModel = model;
      
      // 📏 Calcul des dimensions du modèle
      const box = new THREE.Box3().setFromObject(avatarModel);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      
      console.log('📐 Dimensions du modèle FBX:');
      console.log('  - Taille:', { x: size.x.toFixed(2), y: size.y.toFixed(2), z: size.z.toFixed(2) });
      console.log('  - Centre:', { x: center.x.toFixed(2), y: center.y.toFixed(2), z: center.z.toFixed(2) });
      
      // Vérifier les animations disponibles
      console.log('🎬 Animations disponibles:');
      if (avatarModel.animations && avatarModel.animations.length > 0) {
        avatarModel.animations.forEach((clip, index) => {
          console.log(`  [${index}] ${clip.name} (${clip.duration.toFixed(2)}s)`);
        });
      } else {
        console.log('  ⚠️ Aucune animation trouvée');
      }
      
      // Centrer et scaler le modèle
      avatarModel.position.sub(center);
      
      // SCALING pour rendre le modèle visible
      const maxDimension = Math.max(size.x, size.y, size.z);
      const baseScale = 1.5 / maxDimension;
      avatarModel.scale.multiplyScalar(baseScale);
      
      // Repositionner le modèle
      avatarModel.position.y = -center.y * baseScale;
      avatarModel.position.x = 0;
      avatarModel.position.z = 0;
      
      console.log('📍 Scaling appliqué:', baseScale.toFixed(4));
      console.log('  - Position finale:', { 
        x: avatarModel.position.x.toFixed(3),
        y: avatarModel.position.y.toFixed(3),
        z: avatarModel.position.z.toFixed(3)
      });
      
      scene.add(avatarModel);
      
      // 🎬 SETUP ANIMATION
      if (avatarModel.animations && avatarModel.animations.length > 0) {
        const mixer = new THREE.AnimationMixer(avatarModel);
        mixerRef.current = mixer;
        
        // Trouver l'animation "wave" ou utiliser la première animation
        let animationClip = avatarModel.animations.find(clip => 
          clip.name.toLowerCase().includes('wave')
        );
        
        if (!animationClip) {
          console.log('⚠️ Animation "wave" non trouvée, utilisation de la première animation');
          animationClip = avatarModel.animations[0];
        }
        
        console.log(`🎬 Animation lancée: ${animationClip?.name}`);
        if (animationClip) {
          const action = mixer.clipAction(animationClip);
          action.loop = THREE.LoopRepeat;
          action.clampWhenFinished = false;
          action.play();
          animationActionRef.current = action;
        }
      }
      
      // Ajuster caméra
      camera.position.set(0, 0, 2.5);
      camera.lookAt(0, 0, 0);
      
      setModel(avatarModel);
      setGlbLoaded(true);
      setModelReady(true); // Set modelReady to true when model is loaded
      console.log('✅ Modèle FBX prêt!');
    } catch (error) {
      console.error('❌ Erreur lors du chargement du modèle FBX:', error);
      setIsLoading(false);
      setGlbLoaded(false);
    }

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      // Update FBX animation mixer
      if (mixerRef.current) {
        const delta = 0.016; // ~60fps
        mixerRef.current.update(delta);
      }

      if (avatarModel) {
        // L'animation FBX est déjà gérée par le mixer
      }

      renderer.render(scene, camera);
      gl.endFrameEXP();
    };

    console.log('🎥 Starting FBX animation loop');
    animate();
  };

  if (!isWeb) {
    // Fallback pour mobile - avatar 2D simple
    console.log('📱 Rendu MOBILE - Avatar 2D');
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

  console.log('🌐 Rendu WEB - FBX 3D. isLoading:', isLoading, 'glbLoaded:', glbLoaded);

  return (
    <View style={[styles.container, style]}>
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
    backgroundColor: '#000000',
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