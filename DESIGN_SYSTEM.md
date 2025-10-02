# 🎨 Hospital Manager - Design System

## 📐 Système de Design Complet

Ce document décrit le système de design cohérent utilisé dans toute l'application.

---

## 🌈 Palette de Couleurs

### **Light Theme** (Thème Clair)
```css
/* Backgrounds */
--bg-primary: #f0f4f8;      /* Fond principal */
--bg-surface: #ffffff;       /* Surface des cartes */

/* Colors */
--color-primary: #6366f1;    /* Indigo vibrant */
--color-secondary: #8b5cf6;  /* Violet élégant */
--color-success: #10b981;    /* Vert émeraude */
--color-warning: #f59e0b;    /* Orange ambré */
--color-error: #ef4444;      /* Rouge vif */

/* Text */
--text-primary: #0f172a;     /* Noir-bleu profond */
--text-secondary: #64748b;   /* Gris moyen */

/* Borders */
--border-light: #e2e8f0;     /* Gris très clair */
--border-medium: #cbd5e1;    /* Gris clair */

/* Shadows */
--shadow-color: #000000;     /* Noir pour shadows */
```

### **Dark Theme** (Thème Sombre)
```css
/* Backgrounds */
--bg-primary: #0f172a;       /* Bleu marine profond */
--bg-surface: #1e293b;       /* Ardoise foncée */

/* Colors */
--color-primary: #818cf8;    /* Indigo clair */
--color-secondary: #a78bfa;  /* Violet clair */
--color-success: #34d399;    /* Vert clair */
--color-warning: #fbbf24;    /* Orange clair */
--color-error: #f87171;      /* Rouge clair */

/* Text */
--text-primary: #f1f5f9;     /* Blanc cassé */
--text-secondary: #94a3b8;   /* Gris clair */

/* Borders */
--border-light: #334155;     /* Gris-bleu foncé */
--border-medium: #475569;    /* Gris-bleu moyen */
```

---

## 📏 Spacing System

### **Scale de Spacing**
```javascript
const spacing = {
  xs: 4,      // Micro-spacing
  sm: 8,      // Petit
  md: 12,     // Moyen
  base: 16,   // Base standard
  lg: 20,     // Large
  xl: 24,     // Extra-large
  '2xl': 32,  // 2x large
  '3xl': 48,  // 3x large
  '4xl': 64,  // 4x large
};
```

### **Application**
- **Padding cards** : 20-24px (lg-xl)
- **Margins** : 16px (base)
- **Gaps** : 12-14px (md)
- **Button padding** : 14-16px vertical, 20-32px horizontal

---

## 🔤 Typography

### **Font Sizes**
```javascript
const fontSize = {
  xs: 12,     // Labels uppercase
  sm: 13,     // Petits textes
  base: 14,   // Texte standard
  md: 15,     // Texte moyen
  lg: 16,     // Inputs, paragraphes
  xl: 17,     // Sous-titres
  '2xl': 18,  // Titres secondaires
  '3xl': 20,  /* Titres sections */
  '4xl': 22,  // Titres importants
  '5xl': 24,  // Titres principaux
  '6xl': 28,  // Titres hero
  '7xl': 32,  // Titres très larges
};
```

### **Font Weights**
```javascript
const fontWeight = {
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
  black: '900',
};
```

### **Application**
- **Titres principaux** : 28-32px / 900 (black)
- **Titres sections** : 20-22px / 800 (extrabold)
- **Sous-titres** : 16-18px / 700 (bold)
- **Texte standard** : 14-16px / 500-600
- **Labels** : 12-13px / 600-700

### **Letter Spacing**
```javascript
const letterSpacing = {
  tight: -0.5,    // Titres larges
  normal: -0.3,   // Titres moyens
  wide: 0.5,      // Labels uppercase
};
```

---

## 🔲 Border Radius

### **Scale de Border Radius**
```javascript
const borderRadius = {
  xs: 8,      // Petits éléments
  sm: 12,     // Inputs, badges
  base: 14,   // Boutons standards
  md: 16,     // Cartes moyennes
  lg: 20,     // Cartes principales
  xl: 24,     // En-têtes, hero
  '2xl': 28,  // Boutons circulaires
  full: 9999, // Complètement rond
};
```

### **Application**
- **Cartes principales** : 20-24px
- **Cartes secondaires** : 16px
- **Inputs** : 12-14px
- **Boutons** : 12-24px (selon taille)
- **Badges** : 20px
- **Pills** : 24px

---

## 🌟 Shadows & Elevations

### **Shadow Presets**
```javascript
const shadows = {
  none: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  
  xs: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  
  base: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 6,
  },
  
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
};
```

### **Colored Shadows**
```javascript
// Pour boutons et éléments interactifs
const coloredShadows = {
  primary: {
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  
  success: {
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  
  warning: {
    shadowColor: '#f59e0b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  
  error: {
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
};
```

---

## 🎯 Components

### **Button Sizes**
```javascript
const buttonSizes = {
  sm: {
    width: 32,
    height: 32,
    borderRadius: 16,
    fontSize: 14,
  },
  
  md: {
    width: 40,
    height: 40,
    borderRadius: 20,
    fontSize: 16,
  },
  
  lg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    fontSize: 18,
  },
  
  xl: {
    width: 56,
    height: 56,
    borderRadius: 28,
    fontSize: 24,
  },
};
```

### **Card Styles**
```javascript
const cardStyles = {
  // Carte standard
  base: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  
  // Carte premium (hero)
  hero: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  
  // Carte subtle
  subtle: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
};
```

### **Input Styles**
```javascript
const inputStyles = {
  base: {
    backgroundColor: '#f8fafc',
    borderColor: '#e2e8f0',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#0f172a',
  },
  
  focused: {
    borderColor: '#6366f1',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  
  error: {
    borderColor: '#ef4444',
  },
};
```

---

## 📱 Screen Layouts

### **Container Styles**
```javascript
const containerStyles = {
  // Écran principal
  screen: {
    flex: 1,
    backgroundColor: '#f0f4f8',
  },
  
  // Section avec padding
  section: {
    padding: 16,
  },
  
  // Header
  header: {
    backgroundColor: '#ffffff',
    padding: 24,
    borderRadius: 24,
    margin: 16,
    marginTop: 8,
  },
};
```

### **List Styles**
```javascript
const listStyles = {
  container: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  
  item: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 14,
  },
  
  separator: {
    height: 14,
  },
};
```

---

## 🎨 Color Usage Guidelines

### **Quand utiliser chaque couleur**

#### **Primary (#6366f1)**
- Boutons d'action principaux
- Navigation active
- Liens importants
- Badges de statut actif

#### **Success (#10b981)**
- Messages de succès
- Validations
- Statuts positifs
- Indicateurs de santé

#### **Warning (#f59e0b)**
- Alertes d'attention
- Actions de modification
- Statuts en attente
- Informations importantes

#### **Error (#ef4444)**
- Messages d'erreur
- Actions de suppression
- Validations échouées
- Alertes critiques

#### **Text Primary (#0f172a)**
- Titres principaux
- Texte important
- Labels de formulaires
- Noms et identités

#### **Text Secondary (#64748b)**
- Descriptions
- Métadonnées
- Labels secondaires
- Texte d'aide

---

## ✨ Animations & Transitions

### **Durées**
```javascript
const duration = {
  fast: 150,      // Micro-interactions
  base: 200,      // Transitions standards
  slow: 300,      // Animations complexes
  slower: 500,    // Entrées/sorties
};
```

### **Easing**
```javascript
const easing = {
  easeIn: 'ease-in',
  easeOut: 'ease-out',
  easeInOut: 'ease-in-out',
  spring: 'spring',
};
```

---

## 📊 Iconography

### **Icon Sizes**
```javascript
const iconSizes = {
  xs: 16,     // Inline text
  sm: 20,     // Small buttons
  base: 24,   // Standard
  lg: 28,     // Large buttons
  xl: 32,     // Headers
  '2xl': 48,  // Hero icons
};
```

### **Emoji Usage**
- 🏥 Hospital/Medical
- 👥 Patients
- 📊 Statistics/Data
- 🩺 Consultations
- 🔬 Examens
- ⚙️ Settings
- ✏️ Edit
- 🗑️ Delete
- ➕ Add
- ✅ Success
- ❌ Error
- 📅 Date
- 📞 Phone
- 📍 Address
- 👤 Patient info

---

## 🎯 Accessibility

### **Contraste Minimum**
- **Texte normal** : 4.5:1 (WCAG AA)
- **Texte large** : 3:1 (WCAG AA)
- **UI Components** : 3:1

### **Touch Targets**
- **Minimum** : 44x44px
- **Recommandé** : 48x48px
- **Confortable** : 56x56px

### **States Visuels**
- **Default** : Style normal
- **Hover** : Légère élévation (web)
- **Pressed** : Légère réduction
- **Disabled** : Opacité 0.5
- **Focus** : Border colorée

---

## 📐 Grid System

### **Breakpoints** (Futur responsive)
```javascript
const breakpoints = {
  mobile: 375,    // iPhone SE
  tablet: 768,    // iPad Mini
  desktop: 1024,  // iPad Pro
};
```

### **Container Max-Width**
- **Mobile** : 100%
- **Tablet** : 728px
- **Desktop** : 1200px

---

## 🎨 Best Practices

### **DO** ✅
- Utiliser les couleurs de la palette
- Respecter les espacements du système
- Appliquer les shadows appropriées
- Maintenir la cohérence typographique
- Tester en mode clair ET sombre

### **DON'T** ❌
- Inventer de nouvelles couleurs
- Utiliser des spacings arbitraires
- Mélanger différents styles de shadows
- Utiliser trop de font weights différents
- Oublier l'accessibilité

---

## 📚 Ressources

### **Outils de Design**
- **Figma** : Pour les maquettes
- **Coolors** : Générateur de palettes
- **Google Fonts** : Typographie
- **IconFinder** : Icônes

### **Références**
- Material Design
- iOS Human Interface Guidelines
- Tailwind CSS Design System
- Ant Design

---

**Ce design system assure la cohérence et la qualité sur toute l'application ! 🎨✨**

*Document créé le 2 octobre 2025*
*Version: 2.0.0*
