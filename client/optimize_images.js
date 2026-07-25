const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function optimizeImages() {
  const images = [
    // Elevate section
    { src: 'public/Images/Elevate-section/great_1.png', dest: 'public/Images/Elevate-section/great_1.webp', width: 600 },
    { src: 'public/Images/Elevate-section/great_2.png', dest: 'public/Images/Elevate-section/great_2.webp', width: 600 },
    { src: 'public/Images/Elevate-section/great_3.png', dest: 'public/Images/Elevate-section/great_3.webp', width: 600 },
    { src: 'public/Images/Elevate-section/great_4.png', dest: 'public/Images/Elevate-section/great_4.webp', width: 900 },
    { src: 'public/Images/Elevate-section/great_5.png', dest: 'public/Images/Elevate-section/great_5.webp', width: 500 },
    // Signature section
    { src: 'public/Images/Signature-section/sig_prestige.png', dest: 'public/Images/Signature-section/sig_prestige.webp', width: 1200 },
    { src: 'public/Images/Signature-section/sig_sofa.png', dest: 'public/Images/Signature-section/sig_sofa.webp', width: 800 },
    { src: 'public/Images/Signature-section/sig_dining.png', dest: 'public/Images/Signature-section/sig_dining.webp', width: 800 },
    { src: 'public/Images/Signature-section/sig_bedroom.png', dest: 'public/Images/Signature-section/sig_bedroom.webp', width: 1200 },
  ];

  for (const img of images) {
    const srcPath = path.resolve(__dirname, img.src);
    const destPath = path.resolve(__dirname, img.dest);
    
    if (!fs.existsSync(srcPath)) {
      console.log(`SKIP: ${img.src} not found`);
      continue;
    }

    try {
      await sharp(srcPath)
        .resize(img.width, null, { withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(destPath);
      
      const origSize = (fs.statSync(srcPath).size / 1024 / 1024).toFixed(1);
      const newSize = (fs.statSync(destPath).size / 1024).toFixed(0);
      console.log(`OK: ${img.src} (${origSize}MB) -> ${img.dest} (${newSize}KB)`);
    } catch (e) {
      console.error(`ERROR: ${img.src}:`, e.message);
    }
  }
  console.log('\nDone! Now delete the old PNG files.');
}

optimizeImages();
