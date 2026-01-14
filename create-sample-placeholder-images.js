#!/usr/bin/env node

/**
 * Create Sample Placeholder Images for Testing
 * This script creates simple HTML files that generate placeholder images
 */

const fs = require('fs');
const path = require('path');

const OUTFIT_DATA_DIR = './frontend/public/outfit-data';

// Sample image data with better placeholder URLs
const sampleImages = [
  {
    id: 'combo_001',
    modelImage: 'https://picsum.photos/400/600?random=1',
    outfitImage: 'https://picsum.photos/400/600?random=2',
    resultImage: 'https://picsum.photos/400/600?random=3',
    tags: ['casual', 'jeans', 't-shirt', 'male', 'summer']
  },
  {
    id: 'combo_002',
    modelImage: 'https://picsum.photos/400/600?random=4',
    outfitImage: 'https://picsum.photos/400/600?random=5',
    resultImage: 'https://picsum.photos/400/600?random=6',
    tags: ['formal', 'dress', 'female', 'elegant', 'party']
  },
  {
    id: 'combo_003',
    modelImage: 'https://picsum.photos/400/600?random=7',
    outfitImage: 'https://picsum.photos/400/600?random=8',
    resultImage: 'https://picsum.photos/400/600?random=9',
    tags: ['business', 'suit', 'male', 'formal', 'office']
  },
  {
    id: 'combo_004',
    modelImage: 'https://picsum.photos/400/600?random=10',
    outfitImage: 'https://picsum.photos/400/600?random=11',
    resultImage: 'https://picsum.photos/400/600?random=12',
    tags: ['casual', 'hoodie', 'female', 'comfortable', 'winter']
  }
];

function createImagePlaceholders() {
  console.log('🖼️  Creating sample placeholder images...\n');

  // Create directories if they don't exist
  const dirs = ['models', 'outfits', 'results'];
  dirs.forEach(dir => {
    const dirPath = path.join(OUTFIT_DATA_DIR, dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  });

  // Create HTML files that redirect to placeholder images
  sampleImages.forEach((sample, index) => {
    console.log(`📸 Creating placeholders for ${sample.id}...`);

    // Create simple HTML files that show placeholder images
    const modelHtml = `<!DOCTYPE html>
<html><head><title>Model ${index + 1}</title></head>
<body style="margin:0;display:flex;align-items:center;justify-content:center;height:100vh;background:linear-gradient(45deg,#4ECDC4,#44A08D);">
<div style="text-align:center;color:white;font-family:Arial,sans-serif;">
<h1>Model ${index + 1}</h1>
<p>Sample Model Image</p>
<p style="font-size:12px;">Replace with actual image</p>
</div></body></html>`;

    const outfitHtml = `<!DOCTYPE html>
<html><head><title>Outfit ${index + 1}</title></head>
<body style="margin:0;display:flex;align-items:center;justify-content:center;height:100vh;background:linear-gradient(45deg,#7ED321,#8BC34A);">
<div style="text-align:center;color:white;font-family:Arial,sans-serif;">
<h1>Outfit ${index + 1}</h1>
<p>Sample Outfit Image</p>
<p style="font-size:12px;">Replace with actual image</p>
</div></body></html>`;

    const resultHtml = `<!DOCTYPE html>
<html><head><title>Result ${index + 1}</title></head>
<body style="margin:0;display:flex;align-items:center;justify-content:center;height:100vh;background:linear-gradient(45deg,#F5A623,#F7931E);">
<div style="text-align:center;color:white;font-family:Arial,sans-serif;">
<h1>Result ${index + 1}</h1>
<p>Sample Try-On Result</p>
<p style="font-size:12px;">Replace with actual image</p>
</div></body></html>`;

    // Write HTML files (for demonstration)
    fs.writeFileSync(path.join(OUTFIT_DATA_DIR, 'models', `model_${String(index + 1).padStart(3, '0')}.html`), modelHtml);
    fs.writeFileSync(path.join(OUTFIT_DATA_DIR, 'outfits', `outfit_${String(index + 1).padStart(3, '0')}.html`), outfitHtml);
    fs.writeFileSync(path.join(OUTFIT_DATA_DIR, 'results', `result_${String(index + 1).padStart(3, '0')}.html`), resultHtml);

    console.log(`   ✅ Created HTML placeholders for ${sample.id}`);
  });

  // Update combinations.json with better placeholder URLs
  const combinations = {
    combinations: sampleImages.map((sample, index) => ({
      id: sample.id,
      modelImage: `https://dummyimage.com/400x600/4ECDC4/ffffff&text=Model+${index + 1}`,
      outfitImage: `https://dummyimage.com/400x600/7ED321/ffffff&text=Outfit+${index + 1}`,
      resultImage: `https://dummyimage.com/400x600/F5A623/ffffff&text=Result+${index + 1}`,
      tags: sample.tags
    }))
  };

  const combinationsPath = path.join(OUTFIT_DATA_DIR, 'combinations.json');
  fs.writeFileSync(combinationsPath, JSON.stringify(combinations, null, 2));
  console.log(`\n📄 Updated combinations.json with working placeholder URLs`);

  console.log('\n🎉 Sample placeholders created successfully!');
  console.log('\n💡 Next steps:');
  console.log('   1. Replace HTML files with actual JPG/PNG images');
  console.log('   2. Update combinations.json with local image paths');
  console.log('   3. Test the Local Try-On functionality');
  console.log('\n📝 Image naming convention:');
  console.log('   • models/model_001.jpg, model_002.jpg, etc.');
  console.log('   • outfits/outfit_001.jpg, outfit_002.jpg, etc.');
  console.log('   • results/result_001.jpg, result_002.jpg, etc.');
}

// Check if outfit-data directory exists
if (!fs.existsSync(OUTFIT_DATA_DIR)) {
  console.error('❌ Error: outfit-data directory not found.');
  console.log('Run setup-local-tryon.bat first to create the directory structure.');
  process.exit(1);
}

createImagePlaceholders();