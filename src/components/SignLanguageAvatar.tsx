import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Text, Dimensions, Platform } from 'react-native';
import { GLView } from 'expo-gl';
import { Renderer } from 'expo-three';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';

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
  const [glbLoaded, setGlbLoaded] = useState(false);
  
  // Refs for FBX animation
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const animationActionRef = useRef<THREE.AnimationAction | null>(null);

  // Debug: Log des props
  useEffect(() => {
    console.log('🎬 SignLanguageAvatar Props:', { isSigning, signText, currentSign });
  }, [isSigning, signText, currentSign]);

  useEffect(() => {
    // Détecteur si on est sur le web
    const detectPlatform = () => {
      try {
         const hasWindow = typeof globalThis !== 'undefined' && (globalThis as any).window;
         const isWebPlatform = hasWindow && !(globalThis as any).window.ReactNativeWebView;
        
        console.log('🔍 Détection plateforme:', isWebPlatform ? 'WEB' : 'MOBILE');
        setIsWeb(isWebPlatform);
      } catch (error) {
        console.log('Platform detection error, assuming web');
        setIsWeb(true);
      }
    };
    
    detectPlatform();
  }, []);

  const onContextCreate = async (gl: any) => {
    console.log('🎨 onContextCreate called - Setting up Three.js scene');

    // Créer le renderer Three.js
    const renderer = new Renderer({ gl });
    renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);
    renderer.setClearColor(0xFFFFFF, 1);
    renderer.setPixelRatio(1);

    // Créer la scène
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xFFFFFF);

    // Créer la caméra
    const camera = new THREE.PerspectiveCamera(
      75,
      gl.drawingBufferWidth / gl.drawingBufferHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 3);

    // Ajouter la lumière
    const ambientLight = new THREE.AmbientLight(0xFFFFFF, 2.0);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 2.0);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    const backLight = new THREE.DirectionalLight(0xFFFFFF, 1.0);
    backLight.position.set(-5, -5, 5);
    scene.add(backLight);

    let avatarModel: THREE.Group | null = null;

    try {
      console.log('🎬 Tentative de chargement du modèle FBX...');
      
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

      // Strategy 1: Load FBX first (priority)
      if (!loadSuccessful && Platform.OS === 'web') {
        try {
          console.log('📍 Strategy 1: Loading FBX');
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

      // Strategy 2: Fallback to GLB
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
        throw new Error('Impossible de charger le modèle 3D');
      }
      
      if (!model) throw new Error('Le modèle est null');
      
      avatarModel = model;
      
      // Calcul des dimensions
      const box = new THREE.Box3().setFromObject(avatarModel);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      
      console.log('📐 Dimensions du modèle:', { 
        width: size.x.toFixed(2), 
        height: size.y.toFixed(2), 
        depth: size.z.toFixed(2) 
      });
      
      // Centrer et scaler le modèle
      avatarModel.position.sub(center);
      const maxDimension = Math.max(size.x, size.y, size.z);
      const baseScale = 1.5 / maxDimension;
      avatarModel.scale.multiplyScalar(baseScale);
      avatarModel.position.y = -center.y * baseScale;
      
      scene.add(avatarModel);
      
      // SETUP ANIMATION
      if (avatarModel.animations && avatarModel.animations.length > 0) {
        const mixer = new THREE.AnimationMixer(avatarModel);
        mixerRef.current = mixer;
        
        let animationClip = avatarModel.animations.find(clip => 
          clip.name.toLowerCase().includes('wave')
        );
        
        if (!animationClip) {
          animationClip = avatarModel.animations[0];
        }
        
        console.log(`🎬 Animation: ${animationClip?.name}`);
        if (animationClip) {
          const action = mixer.clipAction(animationClip);
          action.loop = THREE.LoopRepeat;
          action.clampWhenFinished = false;
          action.play();
          animationActionRef.current = action;
        }
      }
      
      camera.position.set(0, 0, 2.5);
      camera.lookAt(0, 0, 0);
      
      setModel(avatarModel);
      setGlbLoaded(true);
      console.log('✅ Modèle prêt!');
    } catch (error) {
      console.error('❌ Erreur lors du chargement:', error);
      setGlbLoaded(false);
    }

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      if (mixerRef.current) {
        const delta = 0.016;
        mixerRef.current.update(delta);
      }

      renderer.render(scene, camera);
      gl.endFrameEXP();
    };

    console.log('🎥 Animation loop started');
    animate();
  };

  // Si pas sur web ou pas de signText, ne rien afficher
  if (!isWeb || !signText || !signText.trim()) {
    console.log('⏭️ Avatar caché - signText vide ou pas web');
    return <View style={[styles.container, style]} />;
  }

  console.log('🌐 Rendu WEB - Avatar 3D avec FBX');

  return (
    <View style={[styles.container, style]}>
      {/* White overlay pendant que le modèle charge */}
      {!glbLoaded && (
        <View style={styles.loadingOverlay} />
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
    backgroundColor: '#FFFFFF',
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
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'white',
    zIndex: 1,
  },
});

export default SignLanguageAvatar;