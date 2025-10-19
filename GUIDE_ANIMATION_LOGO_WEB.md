# 🎨 Guide d'intégration de l'animation du logo Sensora/Zalama pour le Web

## 📋 Vue d'ensemble
Cette documentation explique **exactement** comment reproduire l'animation "crazy" du logo avec rotation qui est utilisée dans l'application mobile, adaptée pour un site web (Header avant la Navbar).

---

## 🔧 Technologies utilisées dans l'app mobile

### React Native (App mobile)
- **React Native Reanimated** : Pour les animations fluides
- **Expo Linear Gradient** : Pour les effets de dégradé
- **Expo Blur** : Pour l'effet de flou

### Équivalents Web recommandés
- **Framer Motion** : Pour les animations React (équivalent de Reanimated)
- **CSS Animations** : Alternative pure CSS
- **GSAP** : Pour animations complexes (optionnel)

---

## 🎬 Séquence d'animation du logo (Durée totale: ~3 secondes)

### **Étape 1 : État initial (0ms)**
```javascript
logoScale: 0           // Logo invisible
logoRotation: -180deg  // Rotation initiale négative
logoOpacity: 0         // Transparent
```

### **Étape 2 : Apparition avec rotation (0-800ms)**
```javascript
// Opacité
logoOpacity: 0 → 1 (durée: 800ms)

// Scale avec rebond
logoScale: 0 → 0.3 → 1.3 → 1
  - 0 → 0.3 (200ms, timing linéaire)
  - 0.3 → 1.3 (avec spring, damping: 8, stiffness: 100)
  - 1.3 → 1 (avec spring, damping: 12, stiffness: 150)

// Rotation "crazy"
logoRotation: -180deg → 360deg → 720deg → 0deg
  - -180 → 360 (1200ms, timing linéaire) = 1.5 tours
  - 360 → 720 (800ms, timing linéaire) = 1 tour
  - 720 → 0 (avec spring, damping: 15) = retour progressif
```

### **Étape 3 : Effet Glow (démarre à 1000ms)**
```javascript
// Pulsation d'opacité
glowOpacity: 0 → 1 → 0.4 → 1 → 0.6
  - 0 → 1 (600ms)
  - 1 → 0.4 (400ms)
  - 0.4 → 1 (600ms)
  - 1 → 0.6 (400ms)

// Scale du glow
glowScale: 0 → 1.5 → 1.2 → 1.8 → 1
  - Avec spring à chaque étape
```

### **Étape 4 : Particules (démarre à 1800ms)**
```javascript
particleOpacity: 0 → 1 (800ms)
```

---

## 💻 Implémentation Web avec React + Framer Motion

### **1. Installation des dépendances**

```bash
npm install framer-motion
```

### **2. Composant LogoAnimation.tsx/jsx**

```typescript
import { motion, useAnimation } from 'framer-motion';
import { useEffect } from 'react';
import './LogoAnimation.css'; // Voir plus bas

const LogoAnimation = () => {
  const logoControls = useAnimation();
  const glowControls = useAnimation();

  useEffect(() => {
    // Séquence d'animation au montage
    const startAnimation = async () => {
      // Animation du logo avec rotation
      await logoControls.start({
        opacity: [0, 1],
        scale: [0, 0.3, 1.3, 1],
        rotate: [-180, 360, 720, 0],
        transition: {
          duration: 2.8,
          times: [0, 0.29, 0.71, 1],
          ease: ['linear', 'easeOut', 'easeOut', 'spring'],
          spring: {
            damping: 15,
            stiffness: 100
          }
        }
      });

      // Animation du glow (démarre à 1s)
      setTimeout(() => {
        glowControls.start({
          opacity: [0, 1, 0.4, 1, 0.6],
          scale: [0, 1.5, 1.2, 1.8, 1],
          transition: {
            duration: 2.0,
            times: [0, 0.3, 0.5, 0.8, 1],
            ease: 'easeInOut'
          }
        });
      }, 1000);
    };

    startAnimation();
  }, [logoControls, glowControls]);

  return (
    <div className="logo-animation-container">
      {/* Background avec gradient */}
      <div className="logo-background">
        <div className="gradient-bg"></div>
      </div>

      {/* Effet Glow */}
      <motion.div
        className="logo-glow"
        animate={glowControls}
        initial={{ opacity: 0, scale: 0 }}
      >
        <div className="glow-circle"></div>
      </motion.div>

      {/* Logo principal */}
      <motion.div
        className="logo-wrapper"
        animate={logoControls}
        initial={{ opacity: 0, scale: 0, rotate: -180 }}
      >
        <img 
          src="/assets/logo.png" 
          alt="Sensora Logo" 
          className="logo-image"
        />
      </motion.div>

      {/* Cercles décoratifs */}
      <motion.div
        className="decorative-circles"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8, duration: 0.8 }}
      >
        <div className="circle circle-1"></div>
        <div className="circle circle-2"></div>
        <div className="circle circle-3"></div>
      </motion.div>

      {/* Particules flottantes */}
      <motion.div
        className="particles-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8, duration: 0.8 }}
      >
        {[...Array(20)].map((_, index) => (
          <div
            key={index}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`
            }}
          />
        ))}
      </motion.div>
    </div>
  );
};

export default LogoAnimation;
```

### **3. Fichier CSS - LogoAnimation.css**

```css
/* === Container principal === */
.logo-animation-container {
  position: relative;
  width: 100%;
  height: 200px; /* Ajuster selon vos besoins */
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  background: linear-gradient(135deg, #FFFFFF, #F3FAF8, #E8F6F9);
}

/* === Background === */
.logo-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.gradient-bg {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #FFFFFF 0%, #F3FAF8 50%, #E8F6F9 100%);
}

/* === Effet Glow === */
.logo-glow {
  position: absolute;
  width: 400px;
  height: 400px;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2;
}

.glow-circle {
  width: 350px;
  height: 350px;
  border-radius: 50%;
  background: linear-gradient(135deg, #146454, rgba(20, 100, 84, 0.3), transparent);
  filter: blur(40px);
}

/* === Logo principal === */
.logo-wrapper {
  position: relative;
  width: 250px; /* Ajuster selon vos besoins */
  height: 140px;
  z-index: 10;
  display: flex;
  justify-content: center;
  align-items: center;
}

.logo-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

/* === Cercles décoratifs === */
.decorative-circles {
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 3;
  pointer-events: none;
}

.circle {
  position: absolute;
  border: 1px solid rgba(2, 158, 214, 0.2);
  border-radius: 50%;
}

.circle-1 {
  width: 200px;
  height: 200px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: pulse-circle 3s ease-in-out infinite;
}

.circle-2 {
  width: 300px;
  height: 300px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: pulse-circle 4s ease-in-out infinite;
  animation-delay: 0.5s;
}

.circle-3 {
  width: 100px;
  height: 100px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: pulse-circle 2.5s ease-in-out infinite;
  animation-delay: 1s;
}

@keyframes pulse-circle {
  0%, 100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.2;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.1);
    opacity: 0.4;
  }
}

/* === Particules === */
.particles-container {
  position: absolute;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 4;
}

.particle {
  position: absolute;
  width: 4px;
  height: 4px;
  background-color: #029ED6;
  border-radius: 50%;
  opacity: 0.6;
  animation: float-particle 4s ease-in-out infinite;
}

@keyframes float-particle {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
}

/* === Responsive === */
@media (max-width: 768px) {
  .logo-animation-container {
    height: 150px;
  }

  .logo-wrapper {
    width: 180px;
    height: 100px;
  }

  .logo-glow {
    width: 300px;
    height: 300px;
  }

  .glow-circle {
    width: 250px;
    height: 250px;
  }
}
```

---

## 🌐 Alternative : Pure CSS (Sans Framework)

### **HTML + CSS uniquement**

```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Logo Animation Sensora</title>
  <style>
    /* Container */
    .header-logo-section {
      position: relative;
      width: 100%;
      height: 200px;
      display: flex;
      justify-content: center;
      align-items: center;
      overflow: hidden;
      background: linear-gradient(135deg, #FFFFFF, #F3FAF8, #E8F6F9);
    }

    /* Glow effect */
    .logo-glow-effect {
      position: absolute;
      width: 350px;
      height: 350px;
      border-radius: 50%;
      background: linear-gradient(135deg, #146454, rgba(20, 100, 84, 0.3), transparent);
      filter: blur(40px);
      animation: glow-pulse 2s ease-in-out infinite;
      animation-delay: 1s;
    }

    @keyframes glow-pulse {
      0%, 100% {
        opacity: 0.4;
        transform: scale(1);
      }
      50% {
        opacity: 0.8;
        transform: scale(1.2);
      }
    }

    /* Logo wrapper */
    .logo-animated {
      position: relative;
      width: 250px;
      height: 140px;
      z-index: 10;
      animation: logo-entrance 2.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    }

    @keyframes logo-entrance {
      0% {
        opacity: 0;
        transform: scale(0) rotate(-180deg);
      }
      28.5% {
        opacity: 1;
        transform: scale(0.3) rotate(-180deg);
      }
      50% {
        transform: scale(1.3) rotate(360deg);
      }
      71% {
        transform: scale(1.3) rotate(720deg);
      }
      100% {
        opacity: 1;
        transform: scale(1) rotate(0deg);
      }
    }

    .logo-animated img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }

    /* Cercles décoratifs */
    .decorative-circles {
      position: absolute;
      width: 100%;
      height: 100%;
      pointer-events: none;
      animation: fade-in 0.8s ease-in-out forwards;
      animation-delay: 1.8s;
      opacity: 0;
    }

    @keyframes fade-in {
      to {
        opacity: 1;
      }
    }

    .circle {
      position: absolute;
      border: 1px solid rgba(2, 158, 214, 0.2);
      border-radius: 50%;
      top: 50%;
      left: 50%;
    }

    .circle-1 {
      width: 200px;
      height: 200px;
      transform: translate(-50%, -50%);
      animation: pulse-circle 3s ease-in-out infinite;
    }

    .circle-2 {
      width: 300px;
      height: 300px;
      transform: translate(-50%, -50%);
      animation: pulse-circle 4s ease-in-out infinite;
      animation-delay: 0.5s;
    }

    .circle-3 {
      width: 100px;
      height: 100px;
      transform: translate(-50%, -50%);
      animation: pulse-circle 2.5s ease-in-out infinite;
      animation-delay: 1s;
    }

    @keyframes pulse-circle {
      0%, 100% {
        transform: translate(-50%, -50%) scale(1);
        opacity: 0.2;
      }
      50% {
        transform: translate(-50%, -50%) scale(1.1);
        opacity: 0.4;
      }
    }

    /* Particules */
    .particle {
      position: absolute;
      width: 4px;
      height: 4px;
      background-color: #029ED6;
      border-radius: 50%;
      opacity: 0;
      animation: particle-float 4s ease-in-out infinite, particle-fade 0.8s ease-in-out forwards;
      animation-delay: 1.8s;
    }

    @keyframes particle-float {
      0%, 100% {
        transform: translateY(0px);
      }
      50% {
        transform: translateY(-20px);
      }
    }

    @keyframes particle-fade {
      to {
        opacity: 0.6;
      }
    }
  </style>
</head>
<body>
  <header>
    <!-- Section logo animé AVANT la navbar -->
    <div class="header-logo-section">
      <!-- Glow -->
      <div class="logo-glow-effect"></div>

      <!-- Logo -->
      <div class="logo-animated">
        <img src="/assets/logo.png" alt="Sensora Logo">
      </div>

      <!-- Cercles décoratifs -->
      <div class="decorative-circles">
        <div class="circle circle-1"></div>
        <div class="circle circle-2"></div>
        <div class="circle circle-3"></div>
      </div>

      <!-- Particules (générées avec JS) -->
      <div id="particles"></div>
    </div>

    <!-- NAVBAR ICI -->
    <nav>
      <!-- Votre navbar normale -->
    </nav>
  </header>

  <script>
    // Générer les particules dynamiquement
    const particlesContainer = document.getElementById('particles');
    for (let i = 0; i < 20; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.top = `${Math.random() * 100}%`;
      particle.style.animationDelay = `${1.8 + Math.random() * 2}s`;
      particlesContainer.appendChild(particle);
    }
  </script>
</body>
</html>
```

---

## 📊 Tableau récapitulatif des paramètres

| Paramètre | Valeur initiale | Valeur finale | Durée | Type |
|-----------|----------------|---------------|-------|------|
| **logoOpacity** | 0 | 1 | 800ms | Linear |
| **logoScale** | 0 → 0.3 → 1.3 | 1 | 2800ms | Spring |
| **logoRotation** | -180° → 360° → 720° | 0° | 2800ms | Spring |
| **glowOpacity** | 0 → 1 → 0.4 → 1 | 0.6 | 2000ms | EaseInOut |
| **glowScale** | 0 → 1.5 → 1.2 → 1.8 | 1 | 2000ms | Spring |
| **particleOpacity** | 0 | 1 | 800ms | Linear |

---

## 🎯 Points clés de l'animation

1. **Double rotation** : Le logo fait 2 tours complets (720°) avant de revenir à 0°
2. **Effet de rebond** : Le scale fait 0 → 0.3 → 1.3 → 1 avec spring
3. **Glow pulsant** : Commence à 1000ms avec pulsations d'opacité
4. **Timing précis** : Tout se synchronise pour un effet "wow"
5. **Durée totale** : ~3 secondes pour l'animation complète

---

## 🎨 Couleurs utilisées

- **Primaire (Vert)** : `#146454`
- **Secondaire (Bleu)** : `#029ED6`
- **Background** : Linear gradient `#FFFFFF → #F3FAF8 → #E8F6F9`

---

## ✅ Recommandations

- **Performance** : Utilisez `transform` et `opacity` pour de meilleures performances
- **Mobile** : Réduire la taille du logo sur mobile (voir media queries)
- **Accessibilité** : Ajouter `prefers-reduced-motion` pour désactiver l'animation
- **One-time animation** : L'animation ne se joue qu'au chargement de la page

---

## 🔄 Option : Animation au scroll

Si vous voulez que l'animation se rejoue au scroll :

```javascript
// Avec Intersection Observer
useEffect(() => {
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        // Relancer l'animation
        startAnimation();
      }
    },
    { threshold: 0.5 }
  );

  observer.observe(logoRef.current);

  return () => observer.disconnect();
}, []);
```

---

Cette documentation vous donne **exactement** tout ce qu'il faut pour reproduire l'animation du splash screen sur votre site web ! 🚀



