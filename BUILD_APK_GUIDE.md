# 📱 Guide de Build APK - Hospital App

## ✅ Configuration Complète

Votre application est maintenant prête à être compilée en APK !

---

## 🏗️ Méthodes de Build

### **Méthode 1 : Build APK Preview (Recommandé pour Test)**

Cette méthode crée un APK de test que vous pouvez installer immédiatement sur votre téléphone.

```bash
eas build --platform android --profile preview
```

**Avantages** :
- ✅ Plus rapide (~5-10 minutes)
- ✅ APK directement installable
- ✅ Parfait pour les tests

**Résultat** :
- Un fichier `.apk` téléchargeable
- Taille : ~50-100 MB

---

### **Méthode 2 : Build Production (Pour Distribution)**

Cette méthode crée un APK signé pour la production.

```bash
eas build --platform android --profile production
```

**Avantages** :
- ✅ APK signé et optimisé
- ✅ Prêt pour distribution
- ✅ Version finale

**Résultat** :
- Un fichier `.apk` signé
- Taille optimisée

---

## 📋 Étapes du Build

### **1. Lancer le Build**

```bash
# Pour un APK de test
eas build --platform android --profile preview

# OU pour la production
eas build --platform android --profile production
```

### **2. Attendre la Compilation**

Le build se fait sur les serveurs Expo :
- ⏳ Durée : 5-15 minutes
- 🌐 En ligne (pas de ressources locales utilisées)
- 📊 Progression affichée en temps réel

### **3. Télécharger l'APK**

Une fois terminé, vous recevrez :
- 🔗 Un lien de téléchargement dans le terminal
- 📧 Un email avec le lien (si configuré)
- 🌐 Le lien est aussi disponible sur https://expo.dev

### **4. Installer l'APK**

Sur votre téléphone Android :
1. Téléchargez le fichier APK depuis le lien
2. Ouvrez le fichier
3. Autorisez l'installation depuis des sources inconnues (si demandé)
4. Installez ! 🎉

---

## 🎯 Profils de Build Configurés

Votre `eas.json` contient ces profils :

### **`preview`**
```json
{
  "android": {
    "buildType": "apk"
  }
}
```
→ APK non signé pour tests rapides

### **`production`**
```json
{
  "android": {
    "buildType": "apk",
    "gradleCommand": ":app:assembleRelease"
  }
}
```
→ APK signé pour distribution

### **`production-aab`**
```json
{
  "android": {
    "buildType": "app-bundle"
  }
}
```
→ AAB pour Google Play Store

---

## 🔐 Signature de l'APK

### **Première Build**
EAS créera automatiquement un keystore pour vous :
- 🔑 Keystore généré et stocké de manière sécurisée
- 📝 Credentials sauvegardées dans Expo
- ✅ Pas de configuration manuelle nécessaire

### **Builds Suivantes**
EAS réutilisera le même keystore automatiquement :
- ✅ Cohérence entre les versions
- ✅ Possibilité de mettre à jour l'app
- ✅ Pas besoin de re-signer

---

## 📦 Informations de l'Application

D'après votre `app.json` :

```json
{
  "name": "Gestion Patients",
  "slug": "hospital-app-fixed",
  "version": "1.0.0",
  "android": {
    "package": "com.hospitalapp.gestionpatients",
    "versionCode": 1
  }
}
```

**Identifiants** :
- 📱 Nom : Gestion Patients
- 📦 Package : com.hospitalapp.gestionpatients
- 🔢 Version : 1.0.0 (code 1)

---

## 🚀 Commandes Rapides

### **Build APK de Test**
```bash
eas build -p android --profile preview
```

### **Build APK Production**
```bash
eas build -p android --profile production
```

### **Vérifier le Statut du Build**
```bash
eas build:list
```

### **Voir les Détails d'un Build**
```bash
eas build:view [BUILD_ID]
```

---

## 📱 Installation sur Android

### **Méthode 1 : Direct Download**
1. Ouvrez le lien du build sur votre téléphone
2. Téléchargez l'APK
3. Tapez sur le fichier téléchargé
4. Acceptez les permissions
5. Installez !

### **Méthode 2 : Via Ordinateur**
1. Téléchargez l'APK sur votre PC
2. Connectez votre téléphone en USB
3. Copiez l'APK sur le téléphone
4. Ouvrez l'APK depuis le gestionnaire de fichiers
5. Installez !

### **Méthode 3 : Via ADB**
```bash
adb install chemin/vers/votre-app.apk
```

---

## ⚠️ Permissions Requises

Votre app demande ces permissions Android :

- 📸 **CAMERA** : Pour prendre des photos de documents
- 📁 **READ_EXTERNAL_STORAGE** : Pour lire les fichiers
- ✍️ **WRITE_EXTERNAL_STORAGE** : Pour sauvegarder les pièces jointes
- 🌐 **INTERNET** : Pour les mises à jour Expo (développement)

---

## 🎨 Assets Inclus

Selon votre configuration, ces assets sont inclus :
- `./assets/icon.png` (icône de l'app)
- `./assets/adaptive-icon.png` (icône Android adaptative)
- `./assets/favicon.png` (favicon web)

---

## 📊 Taille Estimée de l'APK

- **Preview Build** : ~50-80 MB
- **Production Build** : ~40-70 MB (optimisé)
- **Première Installation** : ~80-120 MB (avec dépendances)

---

## 🔄 Mettre à Jour l'App

Pour créer une nouvelle version :

### **1. Mettre à jour la version**

Éditez `app.json` :
```json
{
  "version": "1.0.1",
  "android": {
    "versionCode": 2
  }
}
```

### **2. Rebuild**
```bash
eas build -p android --profile production
```

### **3. Distribuer**
Envoyez le nouveau APK à vos utilisateurs

---

## 🐛 Dépannage

### **Erreur : "No credentials found"**
**Solution** : EAS créera automatiquement les credentials lors du premier build

### **Erreur : "Build failed"**
**Solutions** :
1. Vérifiez les logs du build
2. Assurez-vous que `package.json` est valide
3. Vérifiez que toutes les dépendances sont installées

### **APK trop gros**
**Solutions** :
1. Utilisez le profil `production` pour un APK optimisé
2. Retirez les assets inutilisés
3. Activez ProGuard dans `eas.json`

---

## 📚 Ressources Utiles

- 📖 [Documentation EAS Build](https://docs.expo.dev/build/introduction/)
- 🏗️ [Dashboard EAS](https://expo.dev)
- 💬 [Forum Expo](https://forums.expo.dev)

---

## ✅ Checklist Avant Build

- [x] Code fonctionnel testé sur Expo Go
- [x] `package.json` à jour
- [x] `app.json` configuré
- [x] `eas.json` créé
- [x] Compte Expo connecté
- [ ] **Lancer le build** : `eas build -p android --profile preview`

---

**Vous êtes prêt ! Lancez maintenant : `eas build -p android --profile preview`** 🚀
