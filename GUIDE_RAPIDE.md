# 🚀 Guide Rapide - Hospital Manager

## Installation et Démarrage

### 1. **Installer les Dépendances**
```bash
npm install
```

### 2. **Lancer l'Application**
```bash
npm start
```

### 3. **Tester sur un Appareil**
- **Option A** : Scannez le QR code avec l'app **Expo Go**
- **Option B** : Appuyez sur `a` pour Android
- **Option C** : Appuyez sur `i` pour iOS (macOS uniquement)

---

## 🎨 Nouvelles Fonctionnalités Visuelles

### **Écran d'Accueil Amélioré**
- 📊 Graphiques modernes avec statistiques en temps réel
- 🎯 Design épuré avec shadows professionnelles
- 🔄 Pull-to-refresh pour actualiser les données
- 🌟 Cartes colorées et animations fluides

### **Liste des Patients**
- 🔍 Recherche en temps réel (nom, prénom, téléphone)
- ➕ Bouton d'ajout flottant avec shadow colorée
- 📝 Formulaire d'ajout moderne avec validation
- 🗑️ Suppression avec confirmation

### **Dossier Patient**
- 👤 En-tête avec badge d'âge et bouton d'édition
- 📊 Statistiques du dossier (données, consultations, examens)
- 🔖 Onglets dynamiques avec compteurs
- ✏️ Édition en place des éléments
- 📎 Gestion des pièces jointes

### **Paramètres**
- 🎨 Changement de thème (clair/sombre)
- ➕ Gestion des types (données, consultations, examens)
- ⚙️ Configuration complète de l'application

---

## 💡 Conseils d'Utilisation

### **Navigation**
- **Tab bar en bas** : Accueil, Patients, Paramètres
- **Retour** : Utilisez les boutons de retour dans les écrans de détail
- **Gestes** : Swipe pour naviguer (selon la plateforme)

### **Ajout Rapide**
1. Cliquez sur le bouton **+** (grand bouton rond)
2. Remplissez le formulaire
3. **Validez** pour enregistrer

### **Recherche**
- Tapez dans la barre de recherche
- La liste filtre automatiquement
- Recherche par nom, prénom ou téléphone

### **Modification**
- Cliquez sur l'icône **✏️** pour éditer
- Modifiez les champs
- **Sauvegardez** les changements

### **Suppression**
- Cliquez sur l'icône **×** (rouge)
- Confirmez la suppression
- L'élément est supprimé définitivement

---

## 🎯 Fonctionnalités Principales

### **Gestion des Patients**
- ✅ Ajouter un nouveau patient
- ✅ Modifier les informations
- ✅ Supprimer un patient
- ✅ Rechercher rapidement

### **Données Sanitaires**
- ✅ Enregistrer des mesures (poids, taille, tension, etc.)
- ✅ Historique daté
- ✅ Types personnalisables
- ✅ Pièces jointes

### **Consultations**
- ✅ Enregistrer les visites médicales
- ✅ Notes détaillées
- ✅ Types de consultation configurables
- ✅ Date et heure

### **Examens Médicaux**
- ✅ Résultats d'examens
- ✅ Notes complémentaires
- ✅ Types d'examens personnalisables
- ✅ Suivi chronologique

---

## 🌓 Thèmes

### **Mode Clair** (par défaut)
- Fond blanc et gris clair
- Texte noir/gris foncé
- Parfait pour une utilisation en journée

### **Mode Sombre**
- Fond bleu marine profond
- Texte blanc/gris clair
- Réduit la fatigue oculaire
- Économie de batterie sur OLED

**Changement** : Aller dans **Paramètres** → **Apparence** → Toggle "Mode sombre"

---

## 🎨 Personnalisation

### **Types de Données**
1. Paramètres → Types de données
2. Cliquez sur **+**
3. Nom : "Glycémie"
4. Description : "Taux de sucre dans le sang"
5. **Ajouter**

### **Types de Consultations**
1. Paramètres → Types de consultations
2. Ajoutez vos types personnalisés
3. Ex: "Urgence", "Suivi", "Contrôle"

### **Types d'Examens**
1. Paramètres → Types d'examens
2. Créez vos types
3. Ex: "IRM", "Scanner", "Échographie"

---

## 📱 Écrans Disponibles

### **🏠 Accueil**
- Vue d'ensemble des statistiques
- Graphiques interactifs
- Informations générales

### **👥 Patients**
- Liste de tous les patients
- Recherche et filtrage
- Ajout/Modification/Suppression

### **📋 Dossier Patient**
- Informations du patient
- Données sanitaires
- Consultations
- Examens

### **🔍 Détails**
- Donnée sanitaire détaillée
- Consultation détaillée
- Examen détaillé
- Pièces jointes

### **⚙️ Paramètres**
- Thème de l'application
- Types configurables
- À propos

---

## 🐛 Résolution de Problèmes

### **L'app ne démarre pas**
```bash
# Nettoyer le cache
npm start -- --clear

# Ou réinstaller les dépendances
rm -rf node_modules
npm install
npm start
```

### **Problème de base de données**
- Désinstallez l'app
- Réinstallez-la
- La base sera recréée automatiquement

### **Erreur de compilation**
```bash
# Vérifier les versions
npm ls expo
npm ls react-native

# Mettre à jour si nécessaire
npm update
```

---

## 📊 Données d'Exemple

Au premier lancement, l'application crée :
- **3 patients** avec informations complètes
- **Types prédéfinis** pour données, consultations et examens
- **Exemples de données** pour chaque patient

Vous pouvez **supprimer** ou **modifier** ces données à tout moment.

---

## 🎯 Bonnes Pratiques

1. **Sauvegardez régulièrement** vos données importantes
2. **Utilisez des types cohérents** pour faciliter les recherches
3. **Ajoutez des pièces jointes** aux éléments importants
4. **Remplissez les notes** pour un suivi détaillé
5. **Vérifiez les dates** avant validation

---

## 🌟 Astuces

- **Swipe** sur une carte pour révéler plus d'options (selon l'implémentation)
- **Long press** sur un élément pour des actions rapides
- **Pull down** sur l'écran d'accueil pour rafraîchir
- **Utilisez la recherche** pour trouver rapidement un patient

---

## 📞 Support

Pour toute question ou problème :
- Consultez le **README.md** pour plus de détails
- Vérifiez le **TROUBLESHOOTING.md** pour les erreurs courantes
- Lisez le **IMPROVEMENTS.md** pour connaître les nouveautés

---

**Bon usage de Hospital Manager ! 🏥✨**

*Guide créé le 2 octobre 2025*
*Version: 2.0.0*
