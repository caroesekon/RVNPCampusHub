import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const ICONS_DIR = path.join(PUBLIC_DIR, 'icons');

// Create icons directory
if (!fs.existsSync(ICONS_DIR)) {
  fs.mkdirSync(ICONS_DIR, { recursive: true });
}

// Generate a simple SVG icon with RV text
const svgIcon = `
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1B5E20"/>
      <stop offset="100%" style="stop-color:#388E3C"/>
    </linearGradient>
  </defs>
  <circle cx="256" cy="256" r="240" fill="url(#grad)"/>
  <text x="256" y="220" text-anchor="middle" fill="white" font-size="100" font-weight="800" font-family="system-ui, sans-serif">RV</text>
  <text x="256" y="310" text-anchor="middle" fill="rgba(255,255,255,0.8)" font-size="50" font-weight="600" font-family="system-ui, sans-serif">HDM</text>
</svg>`;

const svgBuffer = Buffer.from(svgIcon);

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

async function generateIcons() {
  for (const size of sizes) {
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(path.join(ICONS_DIR, `icon-${size}x${size}.png`));
    console.log(`Generated ${size}x${size}`);
  }

  // Generate apple touch icon
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.join(PUBLIC_DIR, 'apple-touch-icon.png'));
  console.log('Generated apple-touch-icon.png');

  // Generate favicon
  await sharp(svgBuffer)
    .resize(48, 48)
    .png()
    .toFile(path.join(PUBLIC_DIR, 'favicon.png'));
  console.log('Generated favicon.png');

  console.log('All PWA assets generated!');
}

generateIcons().catch(console.error);