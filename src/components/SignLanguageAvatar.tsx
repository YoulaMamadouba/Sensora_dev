import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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
  const [headRotation] = useState(new Animated.Value(0));
  const [leftArmRotation] = useState(new Animated.Value(0));
  const [rightArmRotation] = useState(new Animated.Value(0));
  const [bodyRotation] = useState(new Animated.Value(0));
  const [scale] = useState(new Animated.Value(1));
  const [depth] = useState(new Animated.Value(0));

  useEffect(() => {
    if (!isSigning) {
      // Reset animations
      Animated.parallel([
        Animated.timing(headRotation, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(leftArmRotation, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(rightArmRotation, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(bodyRotation, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(depth, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
      return;
    }

    // Animations basées sur le texte
    let headAnim = Animated.timing(headRotation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    });

    let leftArmAnim = Animated.timing(leftArmRotation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    });

    let rightArmAnim = Animated.timing(rightArmRotation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    });

    if (signText.toLowerCase().includes('bonjour')) {
      // Signe "bonjour" - mouvement de la main droite
      rightArmAnim = Animated.sequence([
        Animated.timing(rightArmRotation, {
          toValue: 30,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(rightArmRotation, {
          toValue: -15,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(rightArmRotation, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]);
    } else if (signText.toLowerCase().includes('merci')) {
      // Signe "merci" - mouvement des deux mains
      leftArmAnim = Animated.sequence([
        Animated.timing(leftArmRotation, {
          toValue: 25,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(leftArmRotation, {
          toValue: -10,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(leftArmRotation, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]);
      rightArmAnim = Animated.sequence([
        Animated.timing(rightArmRotation, {
          toValue: -25,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(rightArmRotation, {
          toValue: 10,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(rightArmRotation, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]);
    } else if (signText.toLowerCase().includes('oui')) {
      // Signe "oui" - mouvement de tête vertical
      headAnim = Animated.sequence([
        Animated.timing(headRotation, {
          toValue: 15,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(headRotation, {
          toValue: -15,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(headRotation, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]);
    } else if (signText.toLowerCase().includes('non')) {
      // Signe "non" - mouvement de tête latéral
      headAnim = Animated.sequence([
        Animated.timing(headRotation, {
          toValue: 25,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(headRotation, {
          toValue: -25,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(headRotation, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]);
    } else {
      // Animation générique
      leftArmAnim = Animated.sequence([
        Animated.timing(leftArmRotation, {
          toValue: 20,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(leftArmRotation, {
          toValue: -20,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(leftArmRotation, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]);
      rightArmAnim = Animated.sequence([
        Animated.timing(rightArmRotation, {
          toValue: -20,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(rightArmRotation, {
          toValue: 20,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(rightArmRotation, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]);
    }

    // Animation de pulsation et profondeur
    const pulseAnim = Animated.sequence([
      Animated.timing(scale, {
        toValue: 1.1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]);

    const depthAnim = Animated.sequence([
      Animated.timing(depth, {
        toValue: 10,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(depth, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]);

    // Lancer toutes les animations
    Animated.parallel([
      Animated.loop(pulseAnim),
      Animated.loop(depthAnim),
      Animated.loop(headAnim),
      Animated.loop(leftArmAnim),
      Animated.loop(rightArmAnim),
    ]).start();
  }, [isSigning, signText]);

  const headAnimatedStyle = {
    transform: [
      { rotate: `${headRotation}deg` },
      { scale: scale },
      { translateZ: depth },
    ],
  };

  const leftArmAnimatedStyle = {
    transform: [
      { rotate: `${leftArmRotation}deg` },
      { scale: scale },
      { translateZ: depth },
    ],
  };

  const rightArmAnimatedStyle = {
    transform: [
      { rotate: `${rightArmRotation}deg` },
      { scale: scale },
      { translateZ: depth },
    ],
  };

  const bodyAnimatedStyle = {
    transform: [
      { scale: scale },
      { translateZ: depth },
    ],
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.avatar3DContainer}>
        {/* Tête avec effet 3D */}
        <Animated.View style={[styles.head, headAnimatedStyle]}>
          <View style={styles.head3D}>
            <View style={styles.headFront}>
              <View style={styles.eyes}>
                <View style={styles.eye} />
                <View style={styles.eye} />
              </View>
              <View style={styles.mouth} />
            </View>
            <View style={styles.headShadow} />
          </View>
        </Animated.View>

        {/* Corps avec effet 3D */}
        <Animated.View style={[styles.body, bodyAnimatedStyle]}>
          <View style={styles.body3D}>
            <View style={styles.bodyFront} />
            <View style={styles.bodyShadow} />
          </View>
        </Animated.View>

        {/* Bras gauche avec effet 3D */}
        <Animated.View style={[styles.leftArm, leftArmAnimatedStyle]}>
          <View style={styles.arm3D}>
            <View style={styles.armFront} />
            <View style={styles.armShadow} />
          </View>
          <View style={styles.leftHand}>
            <View style={styles.hand3D}>
              <View style={styles.handFront} />
              <View style={styles.handShadow} />
            </View>
          </View>
        </Animated.View>

        {/* Bras droit avec effet 3D */}
        <Animated.View style={[styles.rightArm, rightArmAnimatedStyle]}>
          <View style={styles.arm3D}>
            <View style={styles.armFront} />
            <View style={styles.armShadow} />
          </View>
          <View style={styles.rightHand}>
            <View style={styles.hand3D}>
              <View style={styles.handFront} />
              <View style={styles.handShadow} />
            </View>
          </View>
        </Animated.View>

        {/* Jambes avec effet 3D */}
        <View style={styles.legs}>
          <View style={styles.leg3D}>
            <View style={styles.legFront} />
            <View style={styles.legShadow} />
          </View>
          <View style={styles.leg3D}>
            <View style={styles.legFront} />
            <View style={styles.legShadow} />
          </View>
        </View>

        {/* Pieds */}
        <View style={styles.feet}>
          <View style={styles.foot} />
          <View style={styles.foot} />
        </View>
      </View>
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
  avatar3DContainer: {
    width: 180,
    height: 180,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  head: {
    position: 'absolute',
    top: 0,
    zIndex: 5,
  },
  head3D: {
    position: 'relative',
  },
  headFront: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFD700',
    borderWidth: 4,
    borderColor: '#FFA500',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headShadow: {
    position: 'absolute',
    top: 4,
    left: 4,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(0,0,0,0.3)',
    zIndex: -1,
  },
  eyes: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 2,
  },
  eye: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#000',
  },
  mouth: {
    width: 20,
    height: 4,
    backgroundColor: '#000',
    borderRadius: 2,
    marginTop: 4,
  },
  body: {
    position: 'absolute',
    top: 50,
    zIndex: 4,
  },
  body3D: {
    position: 'relative',
  },
  bodyFront: {
    width: 44,
    height: 66,
    backgroundColor: '#4A90E2',
    borderRadius: 22,
    borderWidth: 4,
    borderColor: '#357ABD',
  },
  bodyShadow: {
    position: 'absolute',
    top: 4,
    left: 4,
    width: 44,
    height: 66,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 22,
    zIndex: -1,
  },
  leftArm: {
    position: 'absolute',
    top: 55,
    left: -20,
    zIndex: 3,
    transformOrigin: 'top center',
  },
  rightArm: {
    position: 'absolute',
    top: 55,
    right: -20,
    zIndex: 3,
    transformOrigin: 'top center',
  },
  arm3D: {
    position: 'relative',
  },
  armFront: {
    width: 18,
    height: 44,
    backgroundColor: '#4A90E2',
    borderRadius: 9,
    borderWidth: 3,
    borderColor: '#357ABD',
  },
  armShadow: {
    position: 'absolute',
    top: 3,
    left: 3,
    width: 18,
    height: 44,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 9,
    zIndex: -1,
  },
  leftHand: {
    position: 'absolute',
    bottom: -8,
    left: -4,
  },
  rightHand: {
    position: 'absolute',
    bottom: -8,
    right: -4,
  },
  hand3D: {
    position: 'relative',
  },
  handFront: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFE0B2',
    borderWidth: 3,
    borderColor: '#FFCC80',
  },
  handShadow: {
    position: 'absolute',
    top: 3,
    left: 3,
    width: 20,
    height: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 10,
    zIndex: -1,
  },
  legs: {
    position: 'absolute',
    top: 110,
    flexDirection: 'row',
    gap: 8,
  },
  leg3D: {
    position: 'relative',
  },
  legFront: {
    width: 13,
    height: 32,
    backgroundColor: '#4A90E2',
    borderRadius: 6.5,
    borderWidth: 3,
    borderColor: '#357ABD',
  },
  legShadow: {
    position: 'absolute',
    top: 3,
    left: 3,
    width: 13,
    height: 32,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 6.5,
    zIndex: -1,
  },
  feet: {
    position: 'absolute',
    top: 138,
    flexDirection: 'row',
    gap: 16,
  },
  foot: {
    width: 20,
    height: 8,
    backgroundColor: '#333',
    borderRadius: 4,
  },
});

export default SignLanguageAvatar;
