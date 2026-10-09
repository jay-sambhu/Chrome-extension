import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

describe('Chrome Web Store Release Packaging', () => {
  const rootDir = path.resolve(__dirname, '..');
  const pkgPath = path.resolve(rootDir, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
  const version = pkg.version;
  const zipName = `nepal-test-filler-v${version}.zip`;
  const zipPath = path.resolve(rootDir, zipName);
  const scriptPath = path.resolve(rootDir, 'scripts/package-extension.js');

  it('defines the "package" script in package.json', () => {
    expect(pkg.scripts).toBeDefined();
    expect(pkg.scripts.package).toBe('node scripts/package-extension.js');
  });

  it('provides the packaging script at scripts/package-extension.js', () => {
    expect(fs.existsSync(scriptPath)).toBe(true);
    const scriptContent = fs.readFileSync(scriptPath, 'utf-8');
    expect(scriptContent).toContain('dist');
    expect(scriptContent).toContain('manifest.json');
    expect(scriptContent).toContain('zip');
  });

  it('executes npm run package successfully', () => {
    const output = execSync('npm run package', { cwd: rootDir, encoding: 'utf-8' });
    expect(output).toContain('Extension successfully packaged');
    expect(fs.existsSync(zipPath)).toBe(true);
  }, 25000);

  it('produces a non-empty zip archive within web store size limits (< 10 MB)', () => {
    const stats = fs.statSync(zipPath);
    expect(stats.size).toBeGreaterThan(10000); // At least 10 KB
    expect(stats.size).toBeLessThan(10 * 1024 * 1024); // Under 10 MB
  });

  it('contains manifest.json and required files at the root of the archive', () => {
    const zipListing = execSync(`unzip -l "${zipPath}"`, { encoding: 'utf-8' });

    // Ensure manifest.json is at the root
    expect(zipListing).toMatch(/\s+manifest\.json\b/);

    // Ensure icons exist
    expect(zipListing).toMatch(/icons\/icon-16\.png/);
    expect(zipListing).toMatch(/icons\/icon-48\.png/);
    expect(zipListing).toMatch(/icons\/icon-128\.png/);

    // Ensure popup and options pages exist
    expect(zipListing).toMatch(/src\/popup\/index\.html/);
    expect(zipListing).toMatch(/src\/options\/index\.html/);

    // Ensure service worker loader exists
    expect(zipListing).toMatch(/service-worker-loader\.js/);
  });

  it('ensures manifest.json inside dist has matching version and valid MV3 schema', () => {
    const manifestDistPath = path.resolve(rootDir, 'dist/manifest.json');
    expect(fs.existsSync(manifestDistPath)).toBe(true);
    const manifest = JSON.parse(fs.readFileSync(manifestDistPath, 'utf-8'));

    expect(manifest.manifest_version).toBe(3);
    expect(manifest.version).toBe(version);
    expect(manifest.name).toBe('Nepal Test Filler');
    expect(manifest.action).toBeDefined();
    expect(manifest.action.default_popup).toBe('src/popup/index.html');
  });
});
