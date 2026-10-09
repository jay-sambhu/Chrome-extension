import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

function readPngDimensions(filePath: string): { width: number; height: number } {
  const buf = fs.readFileSync(filePath);
  // PNG signature is 8 bytes, IHDR chunk length is 4 bytes, 'IHDR' is 4 bytes
  // Width is at offset 16 (4 bytes UInt32BE), Height is at offset 20 (4 bytes UInt32BE)
  const width = buf.readUInt32BE(16);
  const height = buf.readUInt32BE(20);
  return { width, height };
}

describe('Phase 5.3 Chrome Web Store Marketing Assets', () => {
  const storeAssetsDir = path.resolve(__dirname, '../store-assets');

  describe('Store Screenshots (1280x800)', () => {
    const screenshots = [
      'screenshot-1-popup-fill.png',
      'screenshot-2-loksewa-autofill.png',
      'screenshot-3-fintech-banking.png',
      'screenshot-4-domain-mapping.png',
      'screenshot-5-theme-toggle.png',
    ];

    it.each(screenshots)('ensures %s exists and is exactly 1280x800', (file) => {
      const fullPath = path.join(storeAssetsDir, file);
      expect(fs.existsSync(fullPath)).toBe(true);

      const stats = fs.statSync(fullPath);
      expect(stats.size).toBeGreaterThan(1000); // Non-empty image

      const { width, height } = readPngDimensions(fullPath);
      expect(width).toBe(1280);
      expect(height).toBe(800);
    });
  });

  describe('Promotional Banners', () => {
    it('ensures promo-small-440x280.png exists and is exactly 440x280', () => {
      const fullPath = path.join(storeAssetsDir, 'promo-small-440x280.png');
      expect(fs.existsSync(fullPath)).toBe(true);

      const { width, height } = readPngDimensions(fullPath);
      expect(width).toBe(440);
      expect(height).toBe(280);
    });

    it('ensures promo-marquee-920x680.png exists and is exactly 920x680', () => {
      const fullPath = path.join(storeAssetsDir, 'promo-marquee-920x680.png');
      expect(fs.existsSync(fullPath)).toBe(true);

      const { width, height } = readPngDimensions(fullPath);
      expect(width).toBe(920);
      expect(height).toBe(680);
    });
  });
});
