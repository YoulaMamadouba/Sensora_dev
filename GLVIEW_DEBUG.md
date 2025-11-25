# Guide de Debugging - GLView Visibility

## 🎯 Le problème

Vous voyez dans les logs que tout fonctionne:
- ✅ Platform: WEB
- ✅ GLB Loaded (Stratégie 2 réussi)
- ✅ Model added to scene
- ✅ Animation loop started

**MAIS rien n'apparaît visuellement sur l'écran!**

## 🔍 Diagnostique rapide

### Vérifier 1: Le canvas s'affiche-t-il?

1. Ouvrez les **Dev Tools (F12)**
2. Allez dans **Elements/Inspector**
3. Cherchez un élément `<canvas>` dans le DOM
4. Si vous le trouvez:
   - Faites un clic-droit → "Inspect"
   - Vérifiez sa taille: `width` et `height` en pixels
   - Vérifiez sa position: n'est-il pas hors écran?

### Vérifier 2: Le container a-t-il des dimensions?

Dans l'Inspector, cherchez:
```jsx
<View style={{ width: 240, height: 240 }}>
  <GLView style={{ flex: 1, width: '100%', height: '100%' }}>
```

✅ Si vous voyez une hauteur/largeur définie → OK  
❌ Si height ou width sont 0 → **PROBLÈME!**

### Vérifier 3: Les logs de GLContext

Cherchez dans la console:
```
🎨 onContextCreate called - Setting up Three.js scene
GL Context: {
  drawingBufferWidth: ???,
  drawingBufferHeight: ???
}
```

- Si `drawingBufferWidth: 0` ou `drawingBufferHeight: 0` → **Le canvas n'a pas de taille!**
- Si les valeurs sont correctes (ex: 240, 240) → Le canvas devrait être visible

## 🛠️ Solutions possibles

### Solution 1: Dimensions du container

**VoiceToSignModule.tsx**
```javascript
styles.avatar3D = {
  width: 240,
  height: 240,
  position: 'relative',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'red', // Temporaire pour voir le container
  borderWidth: 2,
  borderColor: 'blue',
}
```

Le container **DOIT** avoir des dimensions explicites!

### Solution 2: S'assurer que SignLanguageAvatar rend le GLView

Vérifiez que vous voyez ces logs:
```
📱 Rendu MOBILE - Avatar 2D
```
ou
```
🌐 Rendu WEB - GLView 3D. isLoading: false glbLoaded: true
```

Si vous voyez "MOBILE" alors qu'on est sur web → **Problème de détection plateforme**

### Solution 3: Vérifier que le GLView est vraiment rendu

Dans le code:
```javascript
if (!isWeb) {
  return <View>...Avatar 2D...</View>;
}

return (
  <View style={[styles.container, style]}>
    {isLoading && <View><Text>Loading...</Text></View>}
    <GLView
      style={styles.glView}
      onContextCreate={onContextCreate}
    />
  </View>
);
```

Vérifiez:
- ✅ `isLoading` passe de `true` à `false` (oui, le log montre `isLoading: false`)
- ✅ `glbLoaded` passe de `false` à `true` (oui, le log montre `glbLoaded: true`)
- ✅ GLView devrait être visible après que loading se termine

## 📋 Logs à regarder

Cherchez dans l'ordre:

1. **Platform detection:**
   ```
   🔍 Détection plateforme:
   - Platform final: WEB ✅
   ```

2. **Component render:**
   ```
   🌐 Rendu WEB - GLView 3D. isLoading: false glbLoaded: true ✅
   ```

3. **GLContext setup:**
   ```
   🎨 onContextCreate called
   GL Context: { drawingBufferWidth: 240, drawingBufferHeight: 240 }
   ```

4. **Model loading:**
   ```
   ✨ Modèle GLB chargé avec succès ✅
   🎬 Modèle GLB ajouté à la scène ✅
   ```

5. **Animation:**
   ```
   🎥 Starting animation loop ✅
   ```

**Si tous ces logs apparaissent ✅ mais rien n'est visible, le problème vient de:**
- La taille du canvas (0x0)
- Le z-index/positionnement CSS
- Le parent container qui cache le GLView

## 🧪 Test simple

Modifiez temporairement le style du container:

```javascript
const styles = StyleSheet.create({
  container: {
    width: 240,
    height: 240,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFD700', // JAUNE = devrait être visible
    borderWidth: 3,
    borderColor: 'red',
  },
  glView: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#00FF00', // VERT = le GLView lui-même
  },
});
```

Si vous voyez:
- 🟨 Carré **jaune** avec bordure rouge → Le container est visible, GLView a peut-être 0x0
- 🟢 Carré **vert** → Le GLView rend, mais le canvas est peut-être noir/transparent

## 📞 Si toujours rien...

Envoyez-moi:
1. La sortie du log `GL Context: {...}`
2. Une capture d'écran de l'Inspector (éléments DOM)
3. Les dimensions exactes que vous voyez


