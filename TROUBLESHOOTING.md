# 🔧 Guide de Dépannage - Gestion Patients

## 📱 Problèmes d'Installation APK

### ❌ "Installation bloquée"
**Solutions :**
1. **Activez les sources inconnues** :
   - Paramètres → Sécurité → Sources inconnues ✅
   - Ou : Paramètres → Biométrie et sécurité → Installer des apps inconnues

2. **Autorisez votre navigateur** :
   - Paramètres → Apps → Chrome/Firefox → Installer des apps inconnues ✅

3. **Désactivez temporairement** :
   - Antivirus pendant l'installation
   - Google Play Protect (temporairement)

### ❌ "App non installée"
**Solutions :**
1. **Libérez de l'espace** (minimum 50 MB)
2. **Redémarrez** le téléphone
3. **Téléchargez à nouveau** l'APK

## 💾 Problèmes "Impossible d'ajouter"

### ❌ "Impossible d'ajouter un patient"
**Causes possibles :**
- Base de données non initialisée
- Champs obligatoires manquants
- Erreur de validation

**Solutions :**
1. **Vérifiez les champs obligatoires** :
   - Nom ✅ (requis)
   - Prénom ✅ (requis)
   - Date de naissance (automatique)

2. **Redémarrez l'application** complètement

3. **Effacez les données** si nécessaire :
   - Paramètres Android → Apps → Gestion Patients → Stockage → Effacer les données

### ❌ "Impossible d'ajouter des données sanitaires"
**Solutions :**
1. **Sélectionnez d'abord un patient**
2. **Vérifiez les champs** :
   - Type de donnée ✅
   - Valeur ✅
   - Date (automatique)

### ❌ "Impossible d'ajouter des pièces jointes"
**Solutions :**
1. **Autorisez les permissions** :
   - Caméra ✅
   - Stockage ✅

2. **Vérifiez l'espace disponible** (minimum 10 MB)

## 🔄 Réinitialisation Complète

Si tous les problèmes persistent :

1. **Désinstallez** l'application
2. **Redémarrez** le téléphone  
3. **Réinstallez** l'APK
4. **Accordez toutes les permissions** demandées

## 📞 Support

Si le problème persiste :
- Vérifiez les logs dans l'application
- Notez le message d'erreur exact
- Redémarrez l'application

## ✅ Version Corrigée

Une version améliorée avec de meilleurs messages d'erreur et une gestion robuste de la base de données est disponible.
