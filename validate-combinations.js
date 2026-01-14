#!/usr/bin/env node

/**
 * Combination Validation Script
 * Checks if all referenced images exist and combinations are valid
 */

const fs = require('fs');
const path = require('path');

const COMBINATIONS_FILE = './frontend/public/outfit-data/combinations.json';
const OUTFIT_DATA_DIR = './frontend/public/outfit-data';

function validateCombinations() {
  console.log('🔍 Validating outfit combinations...\n');

  // Check if combinations.json exists
  if (!fs.existsSync(COMBINATIONS_FILE)) {
    console.log('❌ combinations.json not found!');
    return;
  }

  let combinations;
  try {
    const data = fs.readFileSync(COMBINATIONS_FILE, 'utf8');
    combinations = JSON.parse(data);
  } catch (error) {
    console.log('❌ Error reading combinations.json:', error.message);
    return;
  }

  if (!combinations.combinations || !Array.isArray(combinations.combinations)) {
    console.log('❌ Invalid combinations.json structure');
    return;
  }

  console.log(`📊 Found ${combinations.combinations.length} combinations to validate\n`);

  let validCount = 0;
  let errorCount = 0;

  combinations.combinations.forEach((combo, index) => {
    console.log(`🔍 Validating ${combo.id || `combination ${index + 1}`}:`);
    
    let hasErrors = false;

    // Check required fields
    const requiredFields = ['id', 'modelImage', 'outfitImage', 'resultImage', 'tags'];
    requiredFields.forEach(field => {
      if (!combo[field]) {
        console.log(`   ❌ Missing field: ${field}`);
        hasErrors = true;
      }
    });

    // Check if image files exist
    const imageFields = ['modelImage', 'outfitImage', 'resultImage'];
    imageFields.forEach(field => {
      if (combo[field]) {
        const imagePath = path.join(OUTFIT_DATA_DIR, combo[field]);
        if (!fs.existsSync(imagePath)) {
          console.log(`   ❌ Image not found: ${combo[field]}`);
          hasErrors = true;
        } else {
          console.log(`   ✅ ${field}: ${combo[field]}`);
        }
      }
    });

    // Check tags
    if (combo.tags) {
      if (Array.isArray(combo.tags)) {
        console.log(`   ✅ Tags: ${combo.tags.join(', ')}`);
      } else {
        console.log(`   ❌ Tags should be an array`);
        hasErrors = true;
      }
    }

    if (hasErrors) {
      errorCount++;
      console.log(`   ❌ Combination has errors\n`);
    } else {
      validCount++;
      console.log(`   ✅ Combination is valid\n`);
    }
  });

  // Summary
  console.log('📊 Validation Summary:');
  console.log(`   ✅ Valid combinations: ${validCount}`);
  console.log(`   ❌ Invalid combinations: ${errorCount}`);
  console.log(`   📊 Total combinations: ${combinations.combinations.length}`);

  if (errorCount === 0) {
    console.log('\n🎉 All combinations are valid!');
  } else {
    console.log('\n⚠️  Please fix the errors above before using the system.');
  }
}

function findOrphanedImages() {
  console.log('\n🔍 Checking for orphaned images...\n');

  const combinations = JSON.parse(fs.readFileSync(COMBINATIONS_FILE, 'utf8'));
  const usedImages = new Set();

  // Collect all used images
  combinations.combinations.forEach(combo => {
    if (combo.modelImage) usedImages.add(combo.modelImage);
    if (combo.outfitImage) usedImages.add(combo.outfitImage);
    if (combo.resultImage) usedImages.add(combo.resultImage);
  });

  // Check each directory for orphaned files
  const subdirs = ['models', 'outfits', 'results'];
  let orphanedCount = 0;

  subdirs.forEach(subdir => {
    const dirPath = path.join(OUTFIT_DATA_DIR, subdir);
    if (!fs.existsSync(dirPath)) return;

    const files = fs.readdirSync(dirPath)
      .filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file));

    console.log(`📁 ${subdir}:`);
    
    files.forEach(file => {
      const relativePath = `${subdir}/${file}`;
      if (!usedImages.has(relativePath)) {
        console.log(`   🗑️  Orphaned: ${file}`);
        orphanedCount++;
      }
    });
  });

  if (orphanedCount === 0) {
    console.log('✅ No orphaned images found');
  } else {
    console.log(`\n⚠️  Found ${orphanedCount} orphaned images`);
    console.log('💡 Consider removing unused images or adding them to combinations');
  }
}

// Main execution
if (!fs.existsSync(OUTFIT_DATA_DIR)) {
  console.error('❌ Error: outfit-data directory not found.');
  process.exit(1);
}

validateCombinations();
findOrphanedImages();