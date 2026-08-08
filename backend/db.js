import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, 'data', 'db.json');
const SEED_PATH = path.join(__dirname, 'data', 'seed.json');

// In-memory cache for ultra-fast access
let dbCache = null;

// Initialize database
function initDb() {
  if (dbCache) return dbCache;

  // Create data directory if it doesn't exist
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Copy seed data if database file doesn't exist
  if (!fs.existsSync(DB_PATH)) {
    if (fs.existsSync(SEED_PATH)) {
      fs.copyFileSync(SEED_PATH, DB_PATH);
    } else {
      // Fallback fallback seed structure
      const defaultDb = { users: [], products: [], orders: [], tickets: [] };
      fs.writeFileSync(DB_PATH, JSON.stringify(defaultDb, null, 2));
    }
  }

  try {
    const rawData = fs.readFileSync(DB_PATH, 'utf8');
    dbCache = JSON.parse(rawData);
  } catch (error) {
    console.error('Error reading database file, resetting to seeds...', error);
    if (fs.existsSync(SEED_PATH)) {
      fs.copyFileSync(SEED_PATH, DB_PATH);
      const rawData = fs.readFileSync(DB_PATH, 'utf8');
      dbCache = JSON.parse(rawData);
    } else {
      dbCache = { users: [], products: [], orders: [], tickets: [] };
    }
  }

  return dbCache;
}

// Persist cache to disk
function saveDb() {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(dbCache, null, 2), 'utf8');
  } catch (error) {
    console.error('Error saving database to disk:', error);
  }
}

// Ensure database is loaded
initDb();

export const db = {
  // Get entire collection
  get: (collectionName) => {
    return dbCache[collectionName] || [];
  },

  // Set collection
  set: (collectionName, data) => {
    dbCache[collectionName] = data;
    saveDb();
    return data;
  },

  // Find single item
  findById: (collectionName, id) => {
    const list = dbCache[collectionName] || [];
    return list.find(item => item.id === id) || null;
  },

  // Insert item
  insert: (collectionName, item) => {
    const list = dbCache[collectionName] || [];
    // Generate simple ID if missing
    if (!item.id) {
      const prefix = collectionName.charAt(0);
      const existingIds = list.map(i => parseInt(i.id.replace(/^\D+/g, '')) || 0);
      const maxId = existingIds.length > 0 ? Math.max(...existingIds) : 0;
      item.id = `${prefix}${maxId + 1}`;
    }
    list.push(item);
    dbCache[collectionName] = list;
    saveDb();
    return item;
  },

  // Update item
  update: (collectionName, id, updates) => {
    const list = dbCache[collectionName] || [];
    const index = list.findIndex(item => item.id === id);
    if (index === -1) return null;

    list[index] = { ...list[index], ...updates };
    dbCache[collectionName] = list;
    saveDb();
    return list[index];
  },

  // Delete item
  delete: (collectionName, id) => {
    const list = dbCache[collectionName] || [];
    const index = list.findIndex(item => item.id === id);
    if (index === -1) return false;

    list.splice(index, 1);
    dbCache[collectionName] = list;
    saveDb();
    return true;
  }
};
