import * as SQLite from 'expo-sqlite';
import { createTablesSQL } from './schema';

let db: SQLite.SQLiteDatabase | null = null;
let isInitialized = false;
let initPromise: Promise<void> | null = null;

export async function getDB(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    try {
      db = await SQLite.openDatabaseAsync('hospital.db');
    } catch (error) {
      console.error('Erreur ouverture DB:', error);
      throw error;
    }
  }
  return db;
}

export async function ensureInitialized() {
  if (isInitialized) return;
  
  if (initPromise) {
    await initPromise;
    return;
  }
  
  initPromise = initDatabase();
  await initPromise;
  isInitialized = true;
  initPromise = null;
}

export async function query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  try {
    await ensureInitialized();
    const database = await getDB();
    
    // Avec expo-sqlite v16, utiliser getAllAsync directement
    if (params && params.length > 0) {
      const result = await database.getAllAsync<T>(sql, ...params);
      return result;
    } else {
      const result = await database.getAllAsync<T>(sql);
      return result;
    }
  } catch (error) {
    console.error('Erreur query:', sql, error);
    throw error;
  }
}

export async function run(sql: string, params: any[] = []): Promise<void> {
  try {
    await ensureInitialized();
    const database = await getDB();
    
    if (params && params.length > 0) {
      await database.runAsync(sql, ...params);
    } else {
      await database.runAsync(sql);
    }
  } catch (error) {
    console.error('Erreur run SQL:', sql, 'Params:', params, 'Error:', error);
    throw error;
  }
}

export async function initDatabase() {
  const database = await getDB();
  
  try {
    // Exécuter le SQL de création des tables
    const statements = createTablesSQL.split(';').filter(s => s.trim());
    for (const statement of statements) {
      if (statement.trim()) {
        await database.execAsync(statement.trim());
      }
    }
    
    // Initialiser les données de base
    await seedDatabase();
  } catch (error) {
    console.error('Erreur création tables:', error);
    throw error;
  }
}

// Fonction de seed intégrée pour éviter le cycle de dépendance
async function seedDatabase() {
  try {
    const database = await getDB();
    
    // Fonction de conversion sécurisée
    const safeParseInt = (value: any): number => {
      const parsed = parseInt(String(value || '0'), 10);
      return isNaN(parsed) ? 0 : parsed;
    };

    // Vérifier si les données existent déjà (sans utiliser query pour éviter la récursion)
    const [pc] = await database.getAllAsync('SELECT COUNT(*) as c FROM patients') as Array<{c: number}>;
    const [tdc] = await database.getAllAsync('SELECT COUNT(*) as c FROM types_donnees') as Array<{c: number}>;
    const [tcc] = await database.getAllAsync('SELECT COUNT(*) as c FROM types_consultations') as Array<{c: number}>;
    const [tec] = await database.getAllAsync('SELECT COUNT(*) as c FROM types_examens') as Array<{c: number}>;

    if (safeParseInt(pc?.c) === 0) {
      await database.runAsync(`INSERT INTO patients (nom, prenom, date_naissance, sexe, adresse, telephone) VALUES
        ('Dupont','Marie','1990-06-15','F','12 Rue des Fleurs, Paris','0600000001'),
        ('Martin','Jean','1985-03-22','M','8 Avenue Victor Hugo, Lyon','0600000002'),
        ('Bernard','Luc','1978-11-02','M','5 Boulevard Saint-Michel, Paris','0600000003')
      `);
    }

    if (safeParseInt(tdc?.c) === 0) {
      await database.runAsync(`INSERT INTO types_donnees (nom_type, description) VALUES
        ('Groupe sanguin','ABO et Rhésus'),
        ('Poids','Poids en kilogrammes'),
        ('Taille','Taille en centimètres')
      `);
    }

    if (safeParseInt(tcc?.c) === 0) {
      await database.runAsync(`INSERT INTO types_consultations (nom_type, description) VALUES
        ('Généraliste','Consultation de médecine générale'),
        ('Cardiologie','Consultation de cardiologie')
      `);
    }

    if (safeParseInt(tec?.c) === 0) {
      await database.runAsync(`INSERT INTO types_examens (nom_type, description) VALUES
        ('Sanguin','Bilan sanguin'),
        ('Radiographie','Imagerie médicale')
      `);
    }

    // Données d'exemple seulement si pas déjà présentes
    const [dc] = await database.getAllAsync('SELECT COUNT(*) as c FROM donnees_sanitaires') as Array<{c: number}>;
    if (safeParseInt(dc?.c) === 0) {
      await database.runAsync(`INSERT INTO donnees_sanitaires (patient_id, type_donnee_id, valeur) VALUES
        (1, 1, 'A+'),
        (1, 2, '62'),
        (1, 3, '170'),
        (2, 1, 'O-'),
        (2, 2, '80')
      `);

      await database.runAsync(`INSERT INTO consultations (patient_id, type_consultation_id, diagnostic, traitement) VALUES
        (1, 1, 'État de santé général satisfaisant', 'Aucun traitement nécessaire'),
        (2, 2, 'Hypertension artérielle légère', 'Ramipril 5mg 1x/jour, suivi dans 3 mois')
      `);

      await database.runAsync(`INSERT INTO examens (patient_id, type_examen_id, resultat, notes) VALUES
        (2, 1, 'Cholestérol total 2.1 g/L', 'Suivi conseillé'),
        (1, 2, 'Radio thoracique normale', 'Aucun signe inquiétant')
      `);
    }
  } catch (error) {
    console.log('Erreur lors du seeding:', error);
  }
}
