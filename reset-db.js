// Script pour réinitialiser la base de données
// Exécutez ce script si vous voulez effacer toutes les données

const fs = require('fs');
const path = require('path');

console.log('🗑️  Nettoyage de la base de données...');

// Ce script est un aide-mémoire
// Pour réellement réinitialiser la DB sur mobile :
// 1. Désinstallez l'application de votre appareil/émulateur
// 2. Relancez l'app avec: npm start
// 3. Réinstallez l'application

console.log(`
📱 Instructions pour réinitialiser la base de données :

1️⃣  Désinstallez l'application de votre appareil/émulateur
2️⃣  Relancez le serveur: npm start
3️⃣  Réinstallez l'application sur votre appareil

✨ La nouvelle structure de base de données sera créée automatiquement !

📋 Changements appliqués :
   - Table consultations : diagnostic + traitement (au lieu de notes)
   - Nouveau composant TypePicker pour sélection des types
   - Formulaires améliorés avec validation
`);
