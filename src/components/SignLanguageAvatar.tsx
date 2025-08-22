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
    camera.position.set(0, 0, 3);

    // Ajouter la lumière
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.9);
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
      
      // Ajuster la taille et la position du modèle
      avatarModel.scale.set(1, 1, 1);
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
      // Fallback vers un avatar simple si le chargement échoue
      createSimpleAvatar(scene);
    }

    // Fonction de fallback pour créer un avatar simple
    function createSimpleAvatar(scene: THREE.Scene) {
      console.log('Création de l\'avatar géométrique de fallback');
      const avatarGroup = new THREE.Group();

      // Corps principal
      const bodyGeometry = new THREE.CylinderGeometry(0.4, 0.5, 1.6, 8);
      const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0x2196F3 });
      const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
      body.position.y = 0;
      avatarGroup.add(body);

      // Tête
      const headGeometry = new THREE.SphereGeometry(0.35, 12, 12);
      const headMaterial = new THREE.MeshLambertMaterial({ color: 0xFFE0B2 });
      const head = new THREE.Mesh(headGeometry, headMaterial);
      head.position.y = 1.2;
      avatarGroup.add(head);

      // Yeux
      const eyeGeometry = new THREE.SphereGeometry(0.04, 6, 6);
      const eyeMaterial = new THREE.MeshLambertMaterial({ color: 0x000000 });
      
      const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
      leftEye.position.set(-0.12, 1.3, 0.31);
      avatarGroup.add(leftEye);
      
      const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
      rightEye.position.set(0.12, 1.3, 0.31);
      avatarGroup.add(rightEye);

      // Bouche
      const mouthGeometry = new THREE.BoxGeometry(0.16, 0.03, 0.03);
      const mouthMaterial = new THREE.MeshLambertMaterial({ color: 0x000000 });
      const mouth = new THREE.Mesh(mouthGeometry, mouthMaterial);
      mouth.position.set(0, 1.15, 0.34);
      avatarGroup.add(mouth);

      // Bras
      const leftArmGeometry = new THREE.CylinderGeometry(0.12, 0.15, 0.8, 6);
      const armMaterial = new THREE.MeshLambertMaterial({ color: 0xFFE0B2 });
      const leftArm = new THREE.Mesh(leftArmGeometry, armMaterial);
      leftArm.position.set(-0.5, 0.3, 0);
      leftArm.rotation.z = 0.1;
      avatarGroup.add(leftArm);

      const rightArm = new THREE.Mesh(leftArmGeometry, armMaterial);
      rightArm.position.set(0.5, 0.3, 0);
      rightArm.rotation.z = -0.1;
      avatarGroup.add(rightArm);

      // Mains
      const handGeometry = new THREE.SphereGeometry(0.15, 8, 8);
      const handMaterial = new THREE.MeshLambertMaterial({ color: 0xFFE0B2 });
      
      const leftHand = new THREE.Mesh(handGeometry, handMaterial);
      leftHand.position.set(-0.5, -0.2, 0);
      avatarGroup.add(leftHand);
      
      const rightHand = new THREE.Mesh(handGeometry, handMaterial);
      rightHand.position.set(0.5, -0.2, 0);
      avatarGroup.add(rightHand);

      // Jambes
      const legGeometry = new THREE.CylinderGeometry(0.15, 0.18, 1.0, 6);
      const legMaterial = new THREE.MeshLambertMaterial({ color: 0x2196F3 });
      
      const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
      leftLeg.position.set(-0.2, -1.2, 0);
      avatarGroup.add(leftLeg);
      
      const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
      rightLeg.position.set(0.2, -1.2, 0);
      avatarGroup.add(rightLeg);

      // Pieds
      const footGeometry = new THREE.BoxGeometry(0.3, 0.12, 0.4);
      const footMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
      
      const leftFoot = new THREE.Mesh(footGeometry, footMaterial);
      leftFoot.position.set(-0.2, -1.8, 0.06);
      avatarGroup.add(leftFoot);
      
      const rightFoot = new THREE.Mesh(footGeometry, footMaterial);
      rightFoot.position.set(0.2, -1.8, 0.06);
      avatarGroup.add(rightFoot);

      scene.add(avatarGroup);
      setModel(avatarGroup);
      console.log('Avatar géométrique créé et ajouté à la scène');
    }

    // Animation
    const animate = () => {
      requestAnimationFrame(animate);

      if (model) {
        if (isSigning) {
          // Animation pour la langue des signes
          model.rotation.y = Math.sin(Date.now() * 0.001) * 0.1;
          
          // Animation des bras si le modèle a des bras
          model.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              if (child.name.toLowerCase().includes('arm') || child.name.toLowerCase().includes('hand')) {
                child.rotation.z = Math.sin(Date.now() * 0.002) * 0.3;
              }
            }
          });
        } else {
          // Reset animations
          model.rotation.y = 0;
          model.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              if (child.name.toLowerCase().includes('arm') || child.name.toLowerCase().includes('hand')) {
                child.rotation.z = 0;
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
    // Fallback pour mobile - avatar 2D simple
    return (
      <View style={[styles.container, style]}>
        <View style={[styles.avatar2D, isSigning && styles.avatarSigning]}>
          <Text style={styles.avatarEmoji}>👤</Text>
        </View>
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
    width: 200,
    height: 200,
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
});

export default SignLanguageAvatar;
