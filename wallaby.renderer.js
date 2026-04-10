/* eslint-env node */
module.exports = function () {
  return {
    files: [
      "src/renderer/**/*.ts",
      "src/renderer/**/*.js", 
      "src/renderer/**/*.vue",
      "src/renderer/**/*.json",
      "src/__tests__/unit/renderer/utils/**/*.ts",
      "!src/__tests__/**/*.test.*",
      "tsconfig.renderer.json"
    ],
    
    tests: [
      "src/__tests__/unit/renderer/**/*.test.ts"
    ],

    env: {
      type: "browser"
    },

    // Use automatic configuration for Jest compatibility
    autoDetect: ['jest']
  };
};