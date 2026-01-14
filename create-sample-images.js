#!/usr/bin/env node

/**
 * Sample Images Creator
 * Creates placeholder images for testing the local try-on system
 * Note: Requires canvas package - install with: npm install canvas
 */

const fs = require('fs');
const path = require('path');

// Check if canvas is available
let { createCanvas } = {};
try {
  ({ createCanvas } = require('canvas'));
} catch (error) {
  console.log('📦 Canvas not found. Install it with: npm install canvas');
  console.log('This will create simple placeholder files instead.');
}

const OUTFIT_DATA_DIR = './frontend/public/outfit-data';

const sampleData = [
  {
    id: 'combo_001',
    model: { name: 'model_001.jpg', desc: 'Casual Male Model', color: '#4A90E2' },
    outfit: { name: 'outfit_001.jpg', desc: 'Blue Jeans & T-Shirt', color: '#7ED321' },
    result: { name: 'result_001.jpg', desc: 'Casual Look Result', color: '#F5A623' },
    tags: ['casual', 'jeans', 't-shirt', 'male', 'summer']
  },
  {
    id: 'combo_002',
    model: { name: 'model_002.jpg', desc: 'Elegant Female Model', color: '#D0021B' },
    outfit: { name: 'outfit_002.jpg', desc: 'Black Evening Dress', color: '#9013FE' },
    result: { name: 'result_002.jpg', desc: 'Elegant Look Result', color: '#50E3C2' },
    tags: ['formal', 'dress', 'female', 'elegant', 'party']
  },
  {
    id: 'combo_003',
    model: { name: 'model_003.jpg', desc: 'Business Male Model', color: '#B8E986' },
    outfit: { name: 'outfit_003.jpg', desc: 'Navy Business Suit', color: '#4A4A4A' },
    result: { name: 'result_003.jpg', desc: 'Business Look Result', color: '#BD10E0' },
    tags: ['business', 'suit', 'male', 'formal', 'office']
  },
  {
    id: 'combo_004',
    model: { name: 'model_004.jpg', desc: 'Casual Female Model', color: '#F8E71C' },
    outfit: { name: 'outfit_004.jpg', desc: 'Cozy Winter Hoodie', color: '#8B572A' },
    result: { name: 'result_004.jpg', desc: 'Cozy Look Result', color: '#417505' },
    tags: ['casual', 'hoodie', 'female', 'comfortable', 'winter']
  }
];

function createPlaceholderImage(width, height, color, text, filename) {
  if (createCanvas) {
    // Create actual image with canvas
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, width, height);

    // Text
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Split text into lines
    const lines = text.split('\n');
    const lineHeight = 30;
    const startY = height / 2 - ((lines.length - 1) * lineHeight) / 2;

    lines.forEach((line, index) => {
      ctx.fillText(line, width / 2, startY + index * lineHeight);
    });

    // Add border
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 4;
    ctx.strokeRect(2, 2, width - 4, height - 4);

    // Save image
    const buffer = canvas.toBuffer('image/jpeg');
    fs.writeFileSync(filename, buffer);
  } else {
    // Create simple text file as placeholder
    const content = `Placeholder for ${text}\nColor: ${color}\nSize: ${width}x${height}`;
    fs.writeFileSync(filename.replace('.jpg', '.txt'), content);
  }
}

async function createSampleImages() {
  console.log('🎨 Creating sample images for testing...\n');

  // Ensure directories exist
  const dirs = ['models', 'outfits', 'results'];
  dirs.forEach(dir => {
    const dirPath = path.join(OUTFIT_DATA_DIR, dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  });

  // Create sample images
  sampleData.forEach((sample, index) => {
    console.log(`📸 Creating images for ${sample.id}...`);

    // Model image
    const modelPath = path.join(OUTFIT_DATA_DIR, 'models', sample.model.name);
    createPlaceholderImage(400, 600, sample.model.color, `${sample.model.desc}\n${sample.id}`, modelPath);

    // Outfit image
    const outfitPath = path.join(OUTFIT_DATA_DIR, 'outfits', sample.outfit.name);
    createPlaceholderImage(400, 600, sample.outfit.color, `${sample.outfit.desc}\n${sample.id}`, outfitPath);

    // Result image
    const resultPath = path.join(OUTFIT_DATA_DIR, 'results', sample.result.name);
    createPlaceholderImage(400, 600, sample.result.color, `${sample.result.desc}\n${sample.id}`, resultPath);

    console.log(`   ✅ Created ${sample.model.name}, ${sample.outfit.name}, ${sample.result.name}`);
  });

  // Update combinations.json
  const combinationsPath = path.join(OUTFIT_DATA_DIR, 'combinations.json');
  const combinations = {
    combinations: sampleData.map(sample => ({
      id: sample.id,
      modelImage: `models/${sample.model.name}`,
      outfitImage: `outfits/${sample.outfit.name}`,
      resultImage: `results/${sample.result.name}`,
      tags: sample.tags
    }))
  };

  fs.writeFileSync(combinationsPath, JSON.stringify(combinations, null, 2));
  console.log(`\n📄 Updated combinations.json with ${sampleData.length} combinations`);

  console.log('\n🎉 Sample images created successfully!');
  console.log('\n💡 Next steps:');
  console.log('   1. Run: start-local-tryon.bat');
  console.log('   2. Open: http://localhost:3000');
  console.log('   3. Navigate to "Local Try-On"');
  console.log('   4. Test with the sample images!');
  
  if (!createCanvas) {
    console.log('\n📦 For actual images, install canvas: npm install canvas');
    console.log('   Then run this script again to create real placeholder images.');
  }
}

// Check if outfit-data directory exists
if (!fs.existsSync(OUTFIT_DATA_DIR)) {
  console.error('❌ Error: outfit-data directory not found.');
  console.log('Run setup-local-tryon.bat first to create the directory structure.');
  process.exit(1);
}

createSampleImages().catch(console.error);