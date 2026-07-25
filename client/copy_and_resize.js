const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const sources = [
  "D:\\Talukder Furniture\\Documents\\Product Images\\Living Set\\Final Image\\Set-101\\TFL-SOF-101 WD.png",
  "D:\\Talukder Furniture\\Documents\\Product Images\\Bedroom Set\\Final Image\\109 LB\\TFL-BED-109 LB.png",
  "D:\\Talukder Furniture\\Documents\\Product Images\\Bedroom Set\\Final Image\\109 LB\\TFL-CBD-109 LB-3D.png",
  "D:\\Talukder Furniture\\Documents\\Product Images\\Living Set\\Final Image\\Set-101\\TFL-STD-101 WD.png",
  "D:\\Talukder Furniture\\Documents\\Product Images\\Bedroom Set\\Final Image\\109 LB\\TFL-DST-109 LB.png"
];

const targetDir = "D:\\Talukder Furniture\\client\\public\\Images\\Elevate-section";

async function processImages() {
  for (let i = 0; i < sources.length; i++) {
    const src = sources[i];
    const dest = path.join(targetDir, `great_${i + 1}.webp`);
    
    console.log(`Processing ${src}...`);
    try {
      await sharp(src)
        .resize(800, null, { withoutEnlargement: true }) // Resize to max width 800
        .webp({ quality: 85 })
        .toFile(dest);
      console.log(`Saved to ${dest}`);
    } catch (e) {
      console.error(`Error processing ${src}:`, e);
    }
  }
}

processImages();
