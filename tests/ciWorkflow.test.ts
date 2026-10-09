import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('Phase 5.2 GitHub Actions CI Pipeline (.github/workflows/ci.yml)', () => {
  const ciFilePath = path.resolve(__dirname, '../.github/workflows/ci.yml');

  it('ensures CI workflow file exists', () => {
    expect(fs.existsSync(ciFilePath)).toBe(true);
  });

  it('triggers on push and pull_request to main branch', () => {
    const content = fs.readFileSync(ciFilePath, 'utf-8');

    expect(content).toMatch(/push:\s+branches:\s+\[\s*main\s*\]/);
    expect(content).toMatch(/pull_request:\s+branches:\s+\[\s*main\s*\]/);
    expect(content).toContain('workflow_dispatch:');
  });

  it('runs all required CI validation steps: typecheck, test, and build', () => {
    const content = fs.readFileSync(ciFilePath, 'utf-8');

    // Dependencies
    expect(content).toContain('npm ci');

    // Required commands from Phase 5.2 specification
    expect(content).toContain('npm run typecheck');
    expect(content).toContain('npm test');
    expect(content).toContain('npm run build');

    // Node matrix
    expect(content).toMatch(/node-version:\s+\[20\.x,\s*22\.x\]/);

    // Artifact archiving
    expect(content).toContain('actions/upload-artifact@v4');
    expect(content).toContain('path: dist/');
  });
});
