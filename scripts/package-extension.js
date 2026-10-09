#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.resolve(rootDir, 'dist');
const pkgPath = path.resolve(rootDir, 'package.json');

const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
const version = pkg.version || '0.1.0';
const name = pkg.name || 'nepal-test-filler';
const outputZipName = `${name}-v${version}.zip`;
const outputZipPath = path.resolve(rootDir, outputZipName);

console.log(`📦 Packaging ${name} v${version} for Chrome Web Store...`);

// 1. Build if dist directory doesn't exist or is empty
if (!fs.existsSync(distDir) || fs.readdirSync(distDir).length === 0) {
  console.log('⚡ Dist folder missing or empty. Running npm run build...');
  execSync('npm run build', { cwd: rootDir, stdio: 'inherit' });
}

// 2. Validate essential files in dist
const manifestPath = path.resolve(distDir, 'manifest.json');
if (!fs.existsSync(manifestPath)) {
  console.error('❌ dist/manifest.json not found!');
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
if (manifest.version !== version) {
  console.warn(`⚠️ Warning: manifest.json version (${manifest.version}) does not match package.json (${version})`);
}

const requiredFiles = [
  'manifest.json',
  'icons/icon-16.png',
  'icons/icon-48.png',
  'icons/icon-128.png',
  'src/popup/index.html',
  'src/options/index.html'
];

for (const rel of requiredFiles) {
  const fullPath = path.resolve(distDir, rel);
  if (!fs.existsSync(fullPath)) {
    console.error(`❌ Required extension file missing in dist: ${rel}`);
    process.exit(1);
  }
}

// 3. Remove old zip if it exists
if (fs.existsSync(outputZipPath)) {
  fs.unlinkSync(outputZipPath);
}

// 4. Create ZIP archive with manifest.json at root level
try {
  execSync(`zip -r -9 "${outputZipPath}" .`, {
    cwd: distDir,
    stdio: 'pipe'
  });
} catch (err) {
  console.error('❌ Failed to run zip command:', err);
  process.exit(1);
}

if (!fs.existsSync(outputZipPath)) {
  console.error('❌ Zip file was not created!');
  process.exit(1);
}

const stats = fs.statSync(outputZipPath);
const sizeKB = (stats.size / 1024).toFixed(2);
console.log(`✅ Extension successfully packaged: ${outputZipName} (${sizeKB} KB)`);
console.log(`🚀 Ready for upload to the Chrome Web Store Developer Dashboard.`);
