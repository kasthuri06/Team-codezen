#!/usr/bin/env node

/**
 * Batch Image Processing Script
 * Helps you add multiple outfit combinations quickly
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const COMBINATIONS_FILE = './frontend/public/outfit-data/combinations.json';
const MODELS_DIR = './frontend/public/outfit-data/models';
const OUTFITS_DIR = './frontend/public/outfit-data/outfits';
const RESULTS_DIR = './frontend/public/outfit-data/results';

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

function getImageFiles(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory)
    .filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file))
    .sort();
}

function displayFiles(files, type) {
  console.log(`\n📁 Available ${type} files:`);
  files.forEach((file, index) => {
    console.log(`  ${index + 1}. ${file}`);
  });
}

async function batchAddCombinations() {
  console.log('🎨 Batch Add Outfit Combinations\n');

  try {
    // Read existing combinations
    let combinations = { combinations: [] };
    if (fs.existsSync(COMBINATIONS_FILE)) {
      const data = fs.readFileSync(COMBINATIONS_FILE, 'utf8');
      combinations = JSON.parse(data);
    }

    // Get available files
    const modelFiles = getImageFiles(MODELS_DIR);
    const outfitFiles = getImageFiles(OUTFITS_DIR);
    const resultFiles = getImageFiles(RESULTS_DIR);

    if (modelFiles.length === 0 || outfitFiles.length === 0 || resultFiles.length === 0) {
      console.log('❌ Error: Make sure you have images in all three directories:');
      console.log(`   - Models: ${modelFiles.length} files`);
      console.log(`   - Outfits: ${outfitFiles.length} files`);
      console.log(`   - Results: ${resultFiles.length} files`);
      rl.close();
      return;
    }

    console.log(`Found ${modelFiles.length} model(s), ${outfitFiles.length} outfit(s), ${resultFiles.length} result(s)`);

    const mode = await question('\nChoose mode:\n1. Auto-match by filename\n2. Manual selection\nEnter choice (1 or 2): ');

    if (mode === '1') {
      await autoMatchByFilename(combinations, modelFiles, outfitFiles, resultFiles);
    } else {
      await manualSelection(combinations, modelFiles, outfitFiles, resultFiles);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  rl.close();
}

async function autoMatchByFilename(combinations, modelFiles, outfitFiles, resultFiles) {
  console.log('\n🤖 Auto-matching by filename patterns...');
  
  let addedCount = 0;
  const basePattern = /^(\w+)_(\d+)\./; // Matches pattern like "model_001.jpg"

  for (const modelFile of modelFiles) {
    const modelMatch = modelFile.match(basePattern);
    if (!modelMatch) continue;

    const [, , number] = modelMatch;
    const outfitFile = outfitFiles.find(f => f.includes(number));
    const resultFile = resultFiles.find(f => f.includes(number));

    if (outfitFile && resultFile) {
      const id = `combo_${number.padStart(3, '0')}`;
      
      // Check if combination already exists
      if (combinations.combinations.find(c => c.id === id)) {
        console.log(`⚠️  Skipping ${id} - already exists`);
        continue;
      }

      const tags = await question(`Enter tags for ${id} (${modelFile} + ${outfitFile}): `);
      const tagArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);

      combinations.combinations.push({
        id,
        modelImage: `models/${modelFile}`,
        outfitImage: `outfits/${outfitFile}`,
        resultImage: `results/${resultFile}`,
        tags: tagArray
      });

      console.log(`✅ Added ${id}`);
      addedCount++;
    }
  }

  if (addedCount > 0) {
    fs.writeFileSync(COMBINATIONS_FILE, JSON.stringify(combinations, null, 2));
    console.log(`\n🎉 Successfully added ${addedCount} combinations!`);
  } else {
    console.log('\n⚠️  No new combinations were added.');
  }
}

async function manualSelection(combinations, modelFiles, outfitFiles, resultFiles) {
  console.log('\n👤 Manual selection mode');
  
  let continueAdding = true;
  let addedCount = 0;

  while (continueAdding) {
    console.log('\n' + '='.repeat(50));
    
    // Show available files
    displayFiles(modelFiles, 'model');
    const modelChoice = await question('\nSelect model file (number): ');
    const modelFile = modelFiles[parseInt(modelChoice) - 1];
    
    if (!modelFile) {
      console.log('❌ Invalid selection');
      continue;
    }

    displayFiles(outfitFiles, 'outfit');
    const outfitChoice = await question('\nSelect outfit file (number): ');
    const outfitFile = outfitFiles[parseInt(outfitChoice) - 1];
    
    if (!outfitFile) {
      console.log('❌ Invalid selection');
      continue;
    }

    displayFiles(resultFiles, 'result');
    const resultChoice = await question('\nSelect result file (number): ');
    const resultFile = resultFiles[parseInt(resultChoice) - 1];
    
    if (!resultFile) {
      console.log('❌ Invalid selection');
      continue;
    }

    // Get combination details
    const id = await question('\nEnter combination ID (e.g., combo_005): ');
    const tags = await question('Enter tags (comma-separated): ');
    const tagArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);

    // Check if combination already exists
    if (combinations.combinations.find(c => c.id === id)) {
      console.log(`❌ Combination ${id} already exists!`);
      continue;
    }

    combinations.combinations.push({
      id,
      modelImage: `models/${modelFile}`,
      outfitImage: `outfits/${outfitFile}`,
      resultImage: `results/${resultFile}`,
      tags: tagArray
    });

    console.log(`✅ Added combination: ${id}`);
    addedCount++;

    const continueChoice = await question('\nAdd another combination? (y/n): ');
    continueAdding = continueChoice.toLowerCase() === 'y';
  }

  if (addedCount > 0) {
    fs.writeFileSync(COMBINATIONS_FILE, JSON.stringify(combinations, null, 2));
    console.log(`\n🎉 Successfully added ${addedCount} combinations!`);
  }
}

// Check if directories exist
if (!fs.existsSync('./frontend/public/outfit-data')) {
  console.error('❌ Error: outfit-data directory not found. Make sure you\'re running this from the project root.');
  process.exit(1);
}

batchAddCombinations();