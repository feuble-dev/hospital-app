// Script pour générer les icônes à partir du SVG
// Usage: node generate-icons.js

const fs = require('fs');
const path = require('path');

console.log('\n🎨 Générateur d\'Icônes - Hospital App\n');

// Vérifier si le fichier SVG existe
const svgPath = path.join(__dirname, 'icon-template.svg');

if (!fs.existsSync(svgPath)) {
  console.log('❌ Erreur: icon-template.svg n\'existe pas');
  console.log('\n📋 Étapes pour créer votre icône:\n');
  console.log('1. Allez sur https://icon.kitchen');
  console.log('2. Créez une icône avec un thème médical (croix, stéthoscope, etc.)');
  console.log('3. Couleur recommandée: #4A90E2 (bleu médical)');
  console.log('4. Téléchargez au format PNG 1024x1024');
  console.log('5. Placez le fichier dans le dossier assets/');
  console.log('6. Renommez en icon.png');
  console.log('\n🌐 Alternatives:');
  console.log('   - Canva: https://canva.com (créer un design 1024x1024)');
  console.log('   - Flaticon: https://flaticon.com (télécharger une icône médicale)');
  console.log('   - Figma: https://figma.com (design professionnel)\n');
  process.exit(1);
}

console.log('✅ Fichier SVG trouvé: icon-template.svg\n');

// Vérifier si sharp est installé
try {
  require.resolve('sharp');
} catch (e) {
  console.log('❌ Le package "sharp" n\'est pas installé\n');
  console.log('📦 Installation requise:');
  console.log('   npm install sharp\n');
  console.log('⚠️  Alternative sans sharp:');
  console.log('   1. Ouvrez icon-template.svg dans votre navigateur');
  console.log('   2. Faites un clic droit → Enregistrer l\'image sous PNG');
  console.log('   3. Ou utilisez un service en ligne comme:');
  console.log('      - https://convertio.co/fr/svg-png/');
  console.log('      - https://cloudconvert.com/svg-to-png\n');
  process.exit(1);
}

const sharp = require('sharp');

// Créer le dossier assets s'il n'existe pas
const assetsDir = path.join(__dirname, 'assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir);
  console.log('📁 Dossier assets/ créé');
}

// Fonction pour convertir SVG en PNG
async function generateIcons() {
  try {
    console.log('🔄 Conversion du SVG en PNG...\n');

    // Lire le fichier SVG
    const svgBuffer = fs.readFileSync(svgPath);

    // Générer icon.png (1024x1024)
    await sharp(svgBuffer)
      .resize(1024, 1024)
      .png()
      .toFile(path.join(assetsDir, 'icon.png'));
    console.log('✅ icon.png créé (1024x1024)');

    // Générer adaptive-icon.png (1024x1024)
    await sharp(svgBuffer)
      .resize(1024, 1024)
      .png()
      .toFile(path.join(assetsDir, 'adaptive-icon.png'));
    console.log('✅ adaptive-icon.png créé (1024x1024)');

    // Générer favicon.png (48x48)
    await sharp(svgBuffer)
      .resize(48, 48)
      .png()
      .toFile(path.join(assetsDir, 'favicon.png'));
    console.log('✅ favicon.png créé (48x48)');

    console.log('\n🎉 Toutes les icônes ont été générées avec succès!');
    console.log('\n📁 Fichiers créés:');
    console.log('   - assets/icon.png (1024x1024)');
    console.log('   - assets/adaptive-icon.png (1024x1024)');
    console.log('   - assets/favicon.png (48x48)');
    
    console.log('\n🚀 Prochaines étapes:');
    console.log('   1. Vérifiez les icônes dans le dossier assets/');
    console.log('   2. Testez avec: npm start');
    console.log('   3. Rebuild l\'APK: eas build -p android --profile preview\n');

  } catch (error) {
    console.error('❌ Erreur lors de la génération:', error.message);
    console.log('\n💡 Solution alternative:');
    console.log('   1. Allez sur https://icon.kitchen');
    console.log('   2. Créez votre icône');
    console.log('   3. Téléchargez tous les formats');
    console.log('   4. Placez les fichiers dans assets/\n');
  }
}

// Lancer la génération
generateIcons();
