import { Platform } from 'react-native';
import * as schema from './schema';

// On web, expo-sqlite's openDatabaseSync times out even with COOP/COEP headers.
// We use a lightweight mock that returns empty results for selects and no-ops for writes.
// Zustand state handles everything in-memory during the session; mmkv/localStorage handles persistence.

function createWebMockDb() {
  // Chainable builder that resolves to an empty array for selects, undefined for mutations
  const thenEmpty = {
    then: (resolve: any) => resolve([]),
    catch: () => thenEmpty,
  };
  const thenVoid = {
    then: (resolve: any) => resolve(undefined),
    catch: () => thenVoid,
  };

  const selectChain: any = {
    from: () => ({
      ...thenEmpty,
      where: () => thenEmpty,
      limit: () => thenEmpty,
      orderBy: () => thenEmpty,
    }),
  };

  const insertChain: any = {
    values: () => ({
      ...thenVoid,
      onConflictDoUpdate: () => thenVoid,
      onConflictDoNothing: () => thenVoid,
    }),
  };

  const updateChain: any = {
    set: () => ({
      ...thenVoid,
      where: () => thenVoid,
    }),
  };

  const deleteChain: any = {
    where: () => thenVoid,
    ...thenVoid,
  };

  return {
    select: () => selectChain,
    insert: () => insertChain,
    update: () => updateChain,
    delete: () => deleteChain,
    run: () => Promise.resolve(),
  };
}

let db: any;

if (Platform.OS === 'web') {
  db = createWebMockDb();
} else {
  const { drizzle } = require('drizzle-orm/expo-sqlite');
  const { openDatabaseSync } = require('expo-sqlite');
  const expoDb = openDatabaseSync('mumvest.db', { enableChangeListener: true });
  db = drizzle(expoDb, { schema });
}

export { db, schema };
