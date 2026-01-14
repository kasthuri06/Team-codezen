#!/usr/bin/env node

/**
 * Helper script to add new outfit combinations
 * Usage: node add-outfit-combination.js
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const COMBINATIONS_FILE = './frontend/public/outfit-data/combinations.json';

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function addCombination() {
  console.log('🎨 Add New Outfit Combination\n');

  try {
    // Read existing combinations
    let combinations = { combinations: [] };
    if (fs.existsSync(COMBINATIONS_FILE)) {
      const data = fs.readFileSync(COMBINATIONS_FILE, 'utf8');
      combinations = JSON.parse(data);
    }

    // Get user input
    const id = await question('Enter combination ID (e.g., combo_005): ');
    const modelImage = await question('Enter model image filename (e.g., model_005.jpg): ');
    const outfitImage = await question('Enter outfit image filename (e.g., outfit_005.jpg): ');
    const resultImage = await question('Enter result image filename (e.g., result_005.jpg): ');
    const tagsInput = await question('Enter tags (comma-separated, e.g., casual,summer,male): ');
    
    const tags = tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);

    // Create new combination
    const newCombination = {
      id,
      modelImage: `models/${modelImage}`,
      outfitImage: `outfits/${outfitImage}`,
      resultImage: `results/${resultImage}`,
      tags
    };

    // Add to combinations
    combinations.combinations.push(newCombination);

    // Write back to file
    fs.writeFileSync(COMBINATIONS_FILE, JSON.stringify(combinations, null, 2));

    console.log('\n✅ Combination added successfully!');
    console.log('📁 Don\'t forget to add your image files to:');
    console.log(`   - frontend/public/outfit-data/models/${modelImage}`);
    console.log(`   - frontend/public/outfit-data/outfits/${outfitImage}`);
    console.log(`   - frontend/public/outfit-data/results/${resultImage}`);
    console.log('\n🔄 Refresh your browser to see the new combination!');

  } catch (error) {
    console.error('❌ Error adding combination:', error.message);
  }

  rl.close();
}

// Check if combinations file exists
if (!fs.existsSync('./frontend/public/outfit-data')) {
  console.error('❌ Error: outfit-data directory not found. Make sure you\'re running this from the project root.');
  process.exit(1);
}

addCombination();