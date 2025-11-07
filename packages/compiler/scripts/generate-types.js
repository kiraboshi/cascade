/**
 * Script to generate TypeScript type definitions
 */

const fs = require('fs');
const path = require('path');

// Import the compiled module
const { generateTypes } = require('../dist/type-generator.js');

const types = generateTypes({
  generateTokenTypes: true,
  generateComponentTypes: true,
  generateMotionTypes: true,
});

const outputPath = path.join(__dirname, '../dist/cascade.d.ts');

fs.writeFileSync(outputPath, types, 'utf-8');
console.log(`Generated type definitions at ${outputPath}`);


