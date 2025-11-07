/**
 * Script to generate foundation.css from TypeScript
 * This runs after TypeScript compilation
 */

const fs = require('fs');
const path = require('path');

// Import the compiled module
const { generateFoundationCSS } = require('../dist/foundation.js');

const css = generateFoundationCSS();
const outputPath = path.join(__dirname, '../dist/foundation.css');

fs.writeFileSync(outputPath, css, 'utf-8');
console.log(`Generated foundation.css at ${outputPath}`);

