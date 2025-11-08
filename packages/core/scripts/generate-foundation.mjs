/**
 * Script to generate foundation.css from TypeScript
 * This runs after TypeScript compilation
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateFoundationCSS } from '../dist/foundation.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const css = generateFoundationCSS();
// Write to src/foundation.css since that's what package.json exports
const outputPath = path.join(__dirname, '../src/foundation.css');

fs.writeFileSync(outputPath, css, 'utf-8');
console.log(`Generated foundation.css at ${outputPath}`);

