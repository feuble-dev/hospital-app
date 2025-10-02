#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Démarrage du build APK optimisé...');

try {
  // Vérifier si le dossier android existe
  if (!fs.existsSync('./android')) {
    console.log('📱 Génération du projet Android...');
    execSync('npx expo prebuild --platform android', { stdio: 'inherit' });
  }

  // Nettoyer le build précédent
  console.log('🧹 Nettoyage des builds précédents...');
  try {
    execSync('cd android && .\\gradlew.bat clean', { stdio: 'inherit' });
  } catch (e) {
    console.log('⚠️  Nettoyage ignoré (normal pour le premier build)');
  }

  // Construire l'APK
  console.log('🔨 Construction de l\'APK...');
  execSync('cd android && .\\gradlew.bat assembleRelease --no-daemon --max-workers=2', { 
    stdio: 'inherit',
    timeout: 600000 // 10 minutes timeout
  });

  // Vérifier si l'APK a été créé
  const apkPath = './android/app/build/outputs/apk/release/app-release.apk';
  if (fs.existsSync(apkPath)) {
    const stats = fs.statSync(apkPath);
    const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
    
    console.log('✅ APK créé avec succès !');
    console.log(`📦 Taille: ${fileSizeInMB} MB`);
    console.log(`📍 Emplacement: ${path.resolve(apkPath)}`);
    
    // Copier l'APK dans le dossier racine avec un nom plus clair
    const finalApkPath = './GestionPatients-v1.0.0.apk';
    fs.copyFileSync(apkPath, finalApkPath);
    console.log(`📋 APK copié vers: ${path.resolve(finalApkPath)}`);
    
  } else {
    console.error('❌ APK non trouvé après le build');
    process.exit(1);
  }

} catch (error) {
  console.error('❌ Erreur lors du build:', error.message);
  process.exit(1);
}
