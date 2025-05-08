// This file is used to mark certain modules as server-only
// to prevent them from being included in client bundles

export const serverOnlyModules = {
  '@libsql/client': true,
  'libsql': true,
  '@mastra/libsql': true,
};

// This function can be used to dynamically import server-only modules
export const loadServerOnlyModule = async (moduleName) => {
  if (typeof window !== 'undefined') {
    throw new Error(`Cannot load server-only module "${moduleName}" in client-side code`);
  }
  
  return import(moduleName);
}; 