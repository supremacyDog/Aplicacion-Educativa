/** @type {import('jest').Config} */
const config = {
  testEnvironment: "node",

  // Rutas de los archivos de prueba
  testMatch: [
    "**/__tests__/**/*.js",
    "**/?(*.)+(spec|test).js"
  ],

  // Evita problemas con node_modules
  testPathIgnorePatterns: ["/node_modules/"],

  // No usamos Babel ni transformadores
  transform: {},

  transformIgnorePatterns: [
    "/node_modules/(?!@babel/preset-env)"
  ],

  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1"
  },

  cacheDirectory: "<rootDir>/.jest_cache"
};

export default config;