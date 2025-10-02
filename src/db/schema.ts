export const createTablesSQL = `
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS patients (
  patient_id INTEGER PRIMARY KEY AUTOINCREMENT,
  nom TEXT NOT NULL,
  prenom TEXT NOT NULL,
  date_naissance TEXT,
  sexe TEXT,
  adresse TEXT,
  telephone TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS types_donnees (
  type_donnee_id INTEGER PRIMARY KEY AUTOINCREMENT,
  nom_type TEXT NOT NULL,
  description TEXT
);

CREATE TABLE IF NOT EXISTS donnees_sanitaires (
  donnee_id INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id INTEGER NOT NULL,
  type_donnee_id INTEGER NOT NULL,
  valeur TEXT NOT NULL,
  date_enregistrement TEXT DEFAULT (date('now')),
  FOREIGN KEY(patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE,
  FOREIGN KEY(type_donnee_id) REFERENCES types_donnees(type_donnee_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS types_consultations (
  type_consultation_id INTEGER PRIMARY KEY AUTOINCREMENT,
  nom_type TEXT NOT NULL,
  description TEXT
);

CREATE TABLE IF NOT EXISTS consultations (
  consultation_id INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id INTEGER NOT NULL,
  type_consultation_id INTEGER NOT NULL,
  date_consultation TEXT DEFAULT (date('now')),
  notes TEXT,
  FOREIGN KEY(patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE,
  FOREIGN KEY(type_consultation_id) REFERENCES types_consultations(type_consultation_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS types_examens (
  type_examen_id INTEGER PRIMARY KEY AUTOINCREMENT,
  nom_type TEXT NOT NULL,
  description TEXT
);

CREATE TABLE IF NOT EXISTS examens (
  examen_id INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id INTEGER NOT NULL,
  type_examen_id INTEGER NOT NULL,
  objet_examen TEXT,
  date_examen TEXT DEFAULT (date('now')),
  resultat TEXT,
  notes TEXT,
  FOREIGN KEY(patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE,
  FOREIGN KEY(type_examen_id) REFERENCES types_examens(type_examen_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS pieces_jointes (
  piece_id INTEGER PRIMARY KEY AUTOINCREMENT,
  cible_type TEXT NOT NULL CHECK (cible_type IN ('donnee','consultation','examen')),
  cible_id INTEGER NOT NULL,
  fichier_url TEXT NOT NULL,
  description TEXT,
  date_ajout TEXT DEFAULT (datetime('now'))
);
`;
