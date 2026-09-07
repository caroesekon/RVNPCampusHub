import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PUBLIC_DIR = path.resolve(__dirname, '../public');
const FAVICON_PATH = path.join(PUBLIC_DIR, 'favicon.svg');

const OUTPUT_SIZES = [
  { size: 192, name: 'logo-192.png' },
  { size: 512, name: 'logo-512.png' },
  { size: 180, name: 'apple-touch-icon.png' },
  { size: 32, name: 'favicon-32.png' },
  { size: 16, name: 'favicon-16.png' },
];

const generateAssets = async () => {
  try {
    if (!fs.existsSync(FAVICON_PATH)) {
      console.error(`Favicon not found at: ${FAVICON_PATH}`);
      console.log('Creating placeholder favicon...');

      const placeholderSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path fill="#006400" d="M32 2L6 11v18c0 16.6 11.1 31.5 26 35 14.9-3.5 26-18.4 26-35V11L32 2z"/><text x="32" y="44" font-family="Arial" font-size="28" font-weight="bold" fill="#FFFFFF" text-anchor="middle">R</text></svg>`;

      fs.writeFileSync(FAVICON_PATH, placeholderSvg);
      console.log('Placeholder favicon created.');
    }

    for (const { size, name } of OUTPUT_SIZES) {
      const outputPath = path.join(PUBLIC_DIR, name);

      await sharp(FAVICON_PATH)
        .resize(size, size)
        .png()
        .toFile(outputPath);

      console.log(`✅ Generated ${name} (${size}x${size})`);
    }

    console.log('\nPWA assets generated successfully!');
  } catch (error) {
    console.error('Failed to generate PWA assets:', error.message);
    process.exit(1);
  }
};

generateAssets();