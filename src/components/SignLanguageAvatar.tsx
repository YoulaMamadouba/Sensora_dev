import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Text, Dimensions } from 'react-native';
import { GLView } from 'expo-gl';
import { Renderer } from 'expo-three';
import * as THREE from 'three';

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
    camera.position.z = 5;

    // Ajouter la lumière
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    scene.add(directionalLight);

    // Créer l'avatar 3D
    const avatarGroup = new THREE.Group();

    // Corps principal
    const bodyGeometry = new THREE.BoxGeometry(1.2, 2, 0.6);
    const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0x4A90E2 });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = -0.5;
    avatarGroup.add(body);

    // Tête
    const headGeometry = new THREE.SphereGeometry(0.6, 16, 16);
    const headMaterial = new THREE.MeshLambertMaterial({ color: 0xFFD700 });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 1.5;
    avatarGroup.add(head);

    // Yeux
    const eyeGeometry = new THREE.SphereGeometry(0.08, 8, 8);
    const eyeMaterial = new THREE.MeshLambertMaterial({ color: 0x000000 });
    
    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.2, 1.6, 0.5);
    avatarGroup.add(leftEye);
    
    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(0.2, 1.6, 0.5);
    avatarGroup.add(rightEye);

    // Bouche
    const mouthGeometry = new THREE.BoxGeometry(0.3, 0.05, 0.05);
    const mouthMaterial = new THREE.MeshLambertMaterial({ color: 0x000000 });
    const mouth = new THREE.Mesh(mouthGeometry, mouthMaterial);
    mouth.position.set(0, 1.3, 0.55);
    avatarGroup.add(mouth);

    // Bras gauche
    const leftArmGeometry = new THREE.BoxGeometry(0.4, 1.2, 0.4);
    const armMaterial = new THREE.MeshLambertMaterial({ color: 0x4A90E2 });
    const leftArm = new THREE.Mesh(leftArmGeometry, armMaterial);
    leftArm.position.set(-1.2, 0, 0);
    avatarGroup.add(leftArm);

    // Bras droit
    const rightArm = new THREE.Mesh(leftArmGeometry, armMaterial);
    rightArm.position.set(1.2, 0, 0);
    avatarGroup.add(rightArm);

    // Mains
    const handGeometry = new THREE.SphereGeometry(0.2, 8, 8);
    const handMaterial = new THREE.MeshLambertMaterial({ color: 0xFFE0B2 });
    
    const leftHand = new THREE.Mesh(handGeometry, handMaterial);
    leftHand.position.set(-1.2, -1.2, 0);
    avatarGroup.add(leftHand);
    
    const rightHand = new THREE.Mesh(handGeometry, handMaterial);
    rightHand.position.set(1.2, -1.2, 0);
    avatarGroup.add(rightHand);

    // Jambes
    const legGeometry = new THREE.BoxGeometry(0.4, 1.2, 0.4);
    const legMaterial = new THREE.MeshLambertMaterial({ color: 0x4A90E2 });
    
    const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
    leftLeg.position.set(-0.4, -2.2, 0);
    avatarGroup.add(leftLeg);
    
    const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
    rightLeg.position.set(0.4, -2.2, 0);
    avatarGroup.add(rightLeg);

    // Pieds
    const footGeometry = new THREE.BoxGeometry(0.6, 0.2, 0.8);
    const footMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
    
    const leftFoot = new THREE.Mesh(footGeometry, footMaterial);
    leftFoot.position.set(-0.4, -2.9, 0.2);
    avatarGroup.add(leftFoot);
    
    const rightFoot = new THREE.Mesh(footGeometry, footMaterial);
    rightFoot.position.set(0.4, -2.9, 0.2);
    avatarGroup.add(rightFoot);

    scene.add(avatarGroup);

    // Animation
    const animate = () => {
      requestAnimationFrame(animate);

      if (isSigning) {
        // Animation de la tête
        head.rotation.y = Math.sin(Date.now() * 0.002) * 0.1;
        head.rotation.x = Math.sin(Date.now() * 0.0015) * 0.05;

        // Animation des bras pour la langue des signes
        leftArm.rotation.z = Math.sin(Date.now() * 0.003) * 0.5;
        leftArm.rotation.x = Math.sin(Date.now() * 0.002) * 0.3;

        rightArm.rotation.z = Math.sin(Date.now() * 0.003 + Math.PI) * 0.5;
        rightArm.rotation.x = Math.sin(Date.now() * 0.002 + Math.PI) * 0.3;

        // Animation du corps
        body.rotation.y = Math.sin(Date.now() * 0.001) * 0.05;

        // Animation des mains
        leftHand.rotation.z = Math.sin(Date.now() * 0.003) * 0.3;
        rightHand.rotation.z = Math.sin(Date.now() * 0.003 + Math.PI) * 0.3;
      } else {
        // Reset animations
        head.rotation.set(0, 0, 0);
        leftArm.rotation.set(0, 0, 0);
        rightArm.rotation.set(0, 0, 0);
        body.rotation.set(0, 0, 0);
        leftHand.rotation.set(0, 0, 0);
        rightHand.rotation.set(0, 0, 0);
      }

      // Rotation générale de l'avatar
      avatarGroup.rotation.y += 0.01;

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
          <Text style={styles.avatarEmoji}>🤟</Text>
        </View>
      </View>
    );
  }

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
  avatar2D: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4A90E2',
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
    fontSize: 24,
  },
});

export default SignLanguageAvatar;
