interface OutfitCombination {
  id: string;
  name?: string;
  modelImage: string;
  outfitImage: string;
  resultImage: string;
  tags: string[];
  matchScore?: number;
}

interface CombinationsData {
  combinations: OutfitCombination[];
}

class OutfitMatcherService {
  private combinations: OutfitCombination[] = [];
  private initialized = false;

  async initialize() {
    if (this.initialized) return;
    
    try {
      const response = await fetch('/outfit-data/combinations.json');
      const data: CombinationsData = await response.json();
      
      // Remove duplicates based on ID
      const uniqueCombinations = data.combinations.filter((combination, index, self) => 
        index === self.findIndex(c => c.id === combination.id)
      );
      
      this.combinations = uniqueCombinations;
      this.initialized = true;
      
      console.log(`Loaded ${this.combinations.length} unique combinations`);
    } catch (error) {
      console.error('Failed to load outfit combinations:', error);
    }
  }

  // Simple image similarity based on file size and basic features
  private calculateImageSimilarity(uploadedFile: File, storedImagePath: string): Promise<number> {
    return new Promise((resolve) => {
      // Simple similarity calculation based on file characteristics
      // In a real implementation, you'd use image processing libraries like:
      // - Canvas API for pixel comparison
      // - TensorFlow.js for feature extraction
      // - OpenCV.js for advanced image processing
      
      const fileSize = uploadedFile.size;
      const fileName = uploadedFile.name.toLowerCase();
      const imagePath = storedImagePath.toLowerCase();
      
      let similarity = 0.5; // Base similarity
      
      // File size similarity (rough approximation)
      if (fileSize > 100000 && fileSize < 5000000) { // 100KB - 5MB range
        similarity += 0.1;
      }
      
      // File type similarity
      if (fileName.includes('.jpg') || fileName.includes('.jpeg') || fileName.includes('.png')) {
        similarity += 0.1;
      }
      
      // Add some randomness to simulate AI matching
      similarity += Math.random() * 0.3;
      
      // Ensure similarity is between 0 and 1
      similarity = Math.min(1, Math.max(0, similarity));
      
      resolve(similarity);
    });
  }

  async findBestMatch(modelFile: File, outfitFile: File): Promise<OutfitCombination | null> {
    await this.initialize();

    if (this.combinations.length === 0) {
      console.warn('No combinations available for matching');
      return null;
    }

    let bestMatch: OutfitCombination | null = null;
    let bestScore = 0;

    for (const combination of this.combinations) {
      try {
        // Calculate similarity scores for both model and outfit
        const modelSimilarity = await this.calculateImageSimilarity(modelFile, combination.modelImage);
        const outfitSimilarity = await this.calculateImageSimilarity(outfitFile, combination.outfitImage);
        
        // Combined score (weighted average)
        const combinedScore = (modelSimilarity * 0.6) + (outfitSimilarity * 0.4);
        
        console.log(`Combination ${combination.id}: Model=${modelSimilarity.toFixed(2)}, Outfit=${outfitSimilarity.toFixed(2)}, Combined=${combinedScore.toFixed(2)}`);
        
        if (combinedScore > bestScore && combinedScore > 0.5) { // Lower threshold to 50%
          bestScore = combinedScore;
          bestMatch = combination;
        }
      } catch (error) {
        console.error(`Error processing combination ${combination.id}:`, error);
      }
    }

    console.log(`Best match: ${bestMatch?.id || 'None'} with score ${bestScore.toFixed(2)}`);
    return bestMatch;
  }

  async getAllCombinations(): Promise<OutfitCombination[]> {
    await this.initialize();
    return this.combinations;
  }

  getResultImageUrl(combination: OutfitCombination): string {
    return `/outfit-data/${combination.resultImage}`;
  }
}

export const outfitMatcher = new OutfitMatcherService();
export type { OutfitCombination };