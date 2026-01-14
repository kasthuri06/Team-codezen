#!/usr/bin/env node

/**
 * Image Optimization Script
 * Helps optimize images for better performance
 * Note: Requires sharp package - install with: npm install sharp
 */

const fs = require('fs');
const path = require('path');

// Check if sharp is available
let sharp;
try {
  sharp = require('sharp');
} catch (error) {
  console.log('📦 Sharp not found. Install it with: npm install sharp');
  console.log('This script will show file information without optimization.');
}

const OUTFIT_DATA_DIR = './frontend/public/outfit-data';
const SUBDIRS = ['models', 'outfits', 'results'];

async function analyzeImages() {
  console.log('🔍 Analyzing images in outfit-data directory...\n');

  for (const subdir of SUBDIRS) {
    const dirPath = path.join(OUTFIT_DATA_DIR, subdir);
    
    if (!fs.existsSync(dirPath)) {
      console.log(`❌ Directory not found: ${subdir}`);
      continue;
    }

    const files = fs.readdirSync(dirPath)
      .filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file));

    console.log(`📁 ${subdir.toUpperCase()} (${files.length} files):`);
    console.log('─'.repeat(60));

    if (files.length === 0) {
      console.log('   No image files found\n');
      continue;
    }

    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stats = fs.statSync(filePath);
      const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);

      console.log(`   📄 ${file}`);
      console.log(`      Size: ${sizeInMB} MB`);

      if (sharp) {
        try {
          const metadata = await sharp(filePath).metadata();
          console.log(`      Dimensions: ${metadata.width}x${metadata.height}`);
          console.log(`      Format: ${metadata.format}`);
          
          // Recommendations
          if (stats.size > 5 * 1024 * 1024) {
            console.log(`      ⚠️  Large file - consider optimizing`);
          }
          if (metadata.width < 400 || metadata.height < 400) {
            console.log(`      ⚠️  Low resolution - consider higher quality`);
          }
        } catch (error) {
          console.log(`      ❌ Error reading metadata: ${error.message}`);
        }
      }
      console.log('');
    }
  }
}

async function optimizeImages() {
  if (!sharp) {
    console.log('❌ Sharp not available. Cannot optimize images.');
    return;
  }

  console.log('🎨 Optimizing images...\n');

  for (const subdir of SUBDIRS) {
    const dirPath = path.join(OUTFIT_DATA_DIR, subdir);
    const optimizedDir = path.join(dirPath, 'optimized');

    if (!fs.existsSync(dirPath)) continue;

    const files = fs.readdirSync(dirPath)
      .filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file));

    if (files.length === 0) continue;

    // Create optimized directory
    if (!fs.existsSync(optimizedDir)) {
      fs.mkdirSync(optimizedDir);
    }

    console.log(`📁 Optimizing ${subdir}...`);

    for (const file of files) {
      const inputPath = path.join(dirPath, file);
      const outputPath = path.join(optimizedDir, file.replace(/\.[^.]+$/, '.jpg'));

      try {
        await sharp(inputPath)
          .resize(800, 1200, { 
            fit: 'inside',
            withoutEnlargement: true 
          })
          .jpeg({ 
            quality: 85,
            progressive: true 
          })
          .toFile(outputPath);

        const originalSize = fs.statSync(inputPath).size;
        const optimizedSize = fs.statSync(outputPath).size;
        const savings = ((originalSize - optimizedSize) / originalSize * 100).toFixed(1);

        console.log(`   ✅ ${file} → ${path.basename(outputPath)} (${savings}% smaller)`);
      } catch (error) {
        console.log(`   ❌ Failed to optimize ${file}: ${error.message}`);
      }
    }
  }

  console.log('\n🎉 Optimization complete! Check the "optimized" folders.');
  console.log('💡 Replace original files with optimized versions if satisfied with quality.');
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--optimize')) {
    await optimizeImages();
  } else {
    await analyzeImages();
    console.log('\n💡 Tips:');
    console.log('   • Run with --optimize flag to create optimized versions');
    console.log('   • Install sharp for image processing: npm install sharp');
    console.log('   • Recommended size: 400x600px minimum, under 2MB');
  }
}

main().catch(console.error);