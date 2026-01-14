import React, { useState, useEffect } from 'react';
import { ArrowPathIcon, CheckCircleIcon, PhotoIcon, HeartIcon, ShareIcon, ArrowDownTrayIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import Layout from '../components/Layout';
import ImageUpload from '../components/ImageUpload';
import LoadingSpinner from '../components/LoadingSpinner';
import { outfitMatcher, OutfitCombination } from '../services/outfitMatcher';
import { downloadService } from '../services/downloadService';
import toast from 'react-hot-toast';

const LocalTryOn: React.FC = () => {
  const [modelImage, setModelImage] = useState<string>('');
  const [outfitImage, setOutfitImage] = useState<string>('');
  const [resultImage, setResultImage] = useState<string>('');
  const [matchedCombination, setMatchedCombination] = useState<OutfitCombination | null>(null);
  const [isMatching, setIsMatching] = useState(false);
  const [modelFile, setModelFile] = useState<File | null>(null);
  const [outfitFile, setOutfitFile] = useState<File | null>(null);
  const [allCombinations, setAllCombinations] = useState<OutfitCombination[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isDownloading, setIsDownloading] = useState(false);
  
  // Combo management states
  const [showAddComboModal, setShowAddComboModal] = useState(false);
  const [newComboName, setNewComboName] = useState('');
  const [newComboTags, setNewComboTags] = useState('');
  const [newComboModel, setNewComboModel] = useState('');
  const [newComboOutfit, setNewComboOutfit] = useState('');
  const [newComboResult, setNewComboResult] = useState('');
  const [combinations, setCombinations] = useState<OutfitCombination[]>([]);

  useEffect(() => {
    loadAllCombinations();
    loadFavorites();
  }, []);

  const loadAllCombinations = async () => {
    try {
      // Load folder-based combinations
      const folderCombos = await outfitMatcher.getAllCombinations();
      
      // Load custom combinations from localStorage
      const saved = localStorage.getItem('sitfit-local-combos');
      const customCombos = saved ? JSON.parse(saved) : [];
      
      // Merge both sources
      const mergedCombos = [...folderCombos, ...customCombos];
      
      setAllCombinations(mergedCombos);
      setCombinations(customCombos);
    } catch (error) {
      console.error('Failed to load combinations:', error);
    }
  };

  const loadFavorites = () => {
    try {
      const savedFavorites = localStorage.getItem('sitfit-favorites');
      if (savedFavorites) {
        setFavorites(JSON.parse(savedFavorites));
      }
    } catch (error) {
      console.error('Failed to load favorites:', error);
    }
  };

  // Combo management functions
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'model' | 'outfit' | 'result') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        if (type === 'model') setNewComboModel(base64);
        else if (type === 'outfit') setNewComboOutfit(base64);
        else setNewComboResult(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent, type: 'model' | 'outfit' | 'result') => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        if (type === 'model') setNewComboModel(base64);
        else if (type === 'outfit') setNewComboOutfit(base64);
        else setNewComboResult(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleSaveCombo = () => {
    if (!newComboName || !newComboModel || !newComboOutfit || !newComboResult) {
      toast.error('Please fill all fields and upload all images');
      return;
    }

    const newCombo: OutfitCombination = {
      id: newComboName, // Use the combo name directly as ID (e.g., "combo_005")
      name: newComboName,
      modelImage: newComboModel,
      outfitImage: newComboOutfit,
      resultImage: newComboResult,
      tags: newComboTags.split(',').map(tag => tag.trim()).filter(tag => tag),
      matchScore: 100
    };

    const updatedCombos = [...combinations, newCombo];
    setCombinations(updatedCombos);
    
    // Merge with folder-based combos
    const folderCombos = allCombinations.filter(combo => !combo.id.startsWith('combo'));
    setAllCombinations([...folderCombos, ...updatedCombos]);
    
    // Save to localStorage
    localStorage.setItem('sitfit-local-combos', JSON.stringify(updatedCombos));
    
    // Reset form
    setNewComboName('');
    setNewComboTags('');
    setNewComboModel('');
    setNewComboOutfit('');
    setNewComboResult('');
    setShowAddComboModal(false);
    
    toast.success('Combination added successfully!');
  };

  const handleDeleteCombo = (id: string) => {
    if (window.confirm('Are you sure you want to delete this combination?')) {
      const updatedCombos = combinations.filter(combo => combo.id !== id);
      setCombinations(updatedCombos);
      
      // Update allCombinations by removing the deleted combo
      const updatedAllCombos = allCombinations.filter(combo => combo.id !== id);
      setAllCombinations(updatedAllCombos);
      
      localStorage.setItem('sitfit-local-combos', JSON.stringify(updatedCombos));
      toast.success('Combination deleted');
    }
  };

  const handleModelImageSelect = (base64: string, file: File) => {
    setModelImage(base64);
    setModelFile(file);
    setResultImage('');
    setMatchedCombination(null);
  };

  const handleOutfitImageSelect = (base64: string, file: File) => {
    setOutfitImage(base64);
    setOutfitFile(file);
    setResultImage('');
    setMatchedCombination(null);
  };

  const handleModelImageRemove = () => {
    setModelImage('');
    setModelFile(null);
    setResultImage('');
    setMatchedCombination(null);
  };

  const handleOutfitImageRemove = () => {
    setOutfitImage('');
    setOutfitFile(null);
    setResultImage('');
    setMatchedCombination(null);
  };

  const handleFindMatch = async () => {
    if (!modelFile || !outfitFile) {
      toast.error('Please upload both model and outfit images');
      return;
    }

    setIsMatching(true);

    try {
      const match = await outfitMatcher.findBestMatch(modelFile, outfitFile);
      
      if (match) {
        setMatchedCombination(match);
        setResultImage(outfitMatcher.getResultImageUrl(match));
        
        // Save to try-on history
        const historyItem = {
          id: `local-${match.id}-${Date.now()}`,
          type: 'local',
          modelImage,
          outfitImage,
          resultImage: outfitMatcher.getResultImageUrl(match),
          createdAt: new Date(),
          status: 'completed',
          tags: match.tags || ['local-match'],
          combinationId: match.id
        };
        
        const existingHistory = JSON.parse(localStorage.getItem('sitfit-tryon-history') || '[]');
        existingHistory.unshift(historyItem); // Add to beginning (newest first)
        
        // Keep only last 50 items to prevent storage bloat
        if (existingHistory.length > 50) {
          existingHistory.splice(50);
        }
        
        localStorage.setItem('sitfit-tryon-history', JSON.stringify(existingHistory));
        
        toast.success('Perfect match found!');
      } else {
        toast.error('No matching outfit combination found. Try different images or add more combinations.');
      }
    } catch (error) {
      console.error('Matching error:', error);
      toast.error('Failed to find matching outfit. Please try again.');
    } finally {
      setIsMatching(false);
    }
  };

  const handleReset = () => {
    setModelImage('');
    setOutfitImage('');
    setResultImage('');
    setMatchedCombination(null);
    setModelFile(null);
    setOutfitFile(null);
  };

  const handleUseCombination = (combination: OutfitCombination) => {
    setMatchedCombination(combination);
    
    // Check if it's a custom combo or folder-based
    const isCustomCombo = combination.id.startsWith('combo-');
    const resultImageUrl = isCustomCombo ? combination.resultImage : outfitMatcher.getResultImageUrl(combination);
    
    setResultImage(resultImageUrl);
    
    // Save to try-on history
    const historyItem = {
      id: `local-manual-${combination.id}-${Date.now()}`,
      type: 'local',
      modelImage: modelImage || (isCustomCombo ? combination.modelImage : `outfit-data/${combination.modelImage}`),
      outfitImage: outfitImage || (isCustomCombo ? combination.outfitImage : `outfit-data/${combination.outfitImage}`),
      resultImage: resultImageUrl,
      createdAt: new Date(),
      status: 'completed',
      tags: combination.tags || ['local-match', 'manual-selection'],
      combinationId: combination.id
    };
    
    const existingHistory = JSON.parse(localStorage.getItem('sitfit-tryon-history') || '[]');
    existingHistory.unshift(historyItem); // Add to beginning (newest first)
    
    // Keep only last 50 items to prevent storage bloat
    if (existingHistory.length > 50) {
      existingHistory.splice(50);
    }
    
    localStorage.setItem('sitfit-tryon-history', JSON.stringify(existingHistory));
    
    toast.success('Combination selected!');
  };

  const handleSaveToFavorites = () => {
    if (!matchedCombination) return;

    const newFavorites = favorites.includes(matchedCombination.id)
      ? favorites.filter(id => id !== matchedCombination.id)
      : [...favorites, matchedCombination.id];

    setFavorites(newFavorites);
    localStorage.setItem('sitfit-favorites', JSON.stringify(newFavorites));

    if (newFavorites.includes(matchedCombination.id)) {
      toast.success('Added to favorites! ❤️');
    } else {
      toast.success('Removed from favorites');
    }
  };

  const handleShareResult = async () => {
    if (!matchedCombination || !resultImage) return;

    try {
      const shareData = {
        title: 'My Virtual Try-On Result - SitFit',
        text: `Check out my virtual try-on result! Combination: ${matchedCombination.id}, Tags: ${matchedCombination.tags.join(', ')}`,
        url: window.location.href
      };

      await downloadService.shareContent(shareData);
      
      if (downloadService.canShare()) {
        toast.success('Shared successfully!');
      } else {
        toast.success('Share link copied to clipboard!');
      }
    } catch (error) {
      console.error('Share failed:', error);
      toast.error('Failed to share. Please try again.');
    }
  };

  const handleDownloadImage = async () => {
    if (!resultImage || !matchedCombination) return;

    setIsDownloading(true);
    try {
      const filename = `sitfit-tryon-${matchedCombination.id}-${Date.now()}.jpg`;
      await downloadService.downloadImage(resultImage, { filename });
      toast.success('Image downloaded successfully!');
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Failed to download image. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadComposite = async () => {
    if (!matchedCombination || !modelImage || !outfitImage || !resultImage) return;

    setIsDownloading(true);
    try {
      const filename = `sitfit-composite-${matchedCombination.id}-${Date.now()}.jpg`;
      await downloadService.createCompositeImage(
        modelImage,
        outfitImage,
        resultImage,
        filename
      );
      toast.success('Composite image downloaded successfully!');
    } catch (error) {
      console.error('Composite download failed:', error);
      toast.error('Failed to create composite image. Downloading result only...');
      // Fallback to single image download
      try {
        await handleDownloadImage();
      } catch (fallbackError) {
        toast.error('Download failed completely. Please try again.');
      }
    } finally {
      setIsDownloading(false);
    }
  };

  const canMatch = modelImage && outfitImage && !isMatching;

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Local Virtual Try-On</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Upload your photos to find matching outfit combinations from our local database
          </p>
        </div>

        {/* Upload Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Model Image Upload */}
          <div className="space-y-4">
            <ImageUpload
              onImageSelect={handleModelImageSelect}
              onImageRemove={handleModelImageRemove}
              currentImage={modelImage}
              label="Upload Your Photo"
              className="h-full"
            />
            {modelFile && (
              <div className="text-sm text-gray-500 text-center">
                {modelFile.name} ({(modelFile.size / 1024 / 1024).toFixed(2)} MB)
              </div>
            )}
          </div>

          {/* Outfit Image Upload */}
          <div className="space-y-4">
            <ImageUpload
              onImageSelect={handleOutfitImageSelect}
              onImageRemove={handleOutfitImageRemove}
              currentImage={outfitImage}
              label="Upload Outfit Photo"
              className="h-full"
            />
            {outfitFile && (
              <div className="text-sm text-gray-500 text-center">
                {outfitFile.name} ({(outfitFile.size / 1024 / 1024).toFixed(2)} MB)
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4">
          <button
            onClick={handleFindMatch}
            disabled={!canMatch}
            className="btn-primary px-8 py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isMatching ? (
              <>
                <LoadingSpinner size="sm" />
                <span>Finding Match...</span>
              </>
            ) : (
              <>
                <CheckCircleIcon className="h-5 w-5" />
                <span>Find Match</span>
              </>
            )}
          </button>

          {(modelImage || outfitImage || resultImage) && (
            <button
              onClick={handleReset}
              disabled={isMatching}
              className="btn-secondary px-8 py-3 text-lg flex items-center space-x-2"
            >
              <ArrowPathIcon className="h-5 w-5" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Result Section */}
        {matchedCombination && resultImage && (
          <div className="card">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Matched Outfit Combination
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Your Model Photo */}
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">Your Photo</h3>
                <img
                  src={modelImage}
                  alt="Your photo"
                  className="w-full h-64 object-cover rounded-lg border border-gray-200"
                />
              </div>

              {/* Your Outfit */}
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">Your Outfit</h3>
                <img
                  src={outfitImage}
                  alt="Your outfit"
                  className="w-full h-64 object-cover rounded-lg border border-gray-200"
                />
              </div>

              {/* Matched Result */}
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">Matched Result</h3>
                <img
                  src={resultImage}
                  alt="Matched result"
                  className="w-full h-64 object-cover rounded-lg border border-gray-200 shadow-lg"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://via.placeholder.com/400x600/4ECDC4/ffffff?text=Result+Not+Found';
                  }}
                />
              </div>
            </div>

            {/* Match Info */}
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2">Match Details:</h4>
              <p className="text-green-700">
                <strong>Combination ID:</strong> {matchedCombination.id}
              </p>
              <p className="text-green-700">
                <strong>Tags:</strong> {matchedCombination.tags.join(', ')}
              </p>
            </div>

            {/* Action Buttons for Result */}
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <button 
                onClick={handleSaveToFavorites}
                className={`btn-primary flex items-center space-x-2 ${
                  favorites.includes(matchedCombination.id) ? 'bg-red-500 hover:bg-red-600' : ''
                }`}
              >
                {favorites.includes(matchedCombination.id) ? (
                  <HeartIconSolid className="h-5 w-5" />
                ) : (
                  <HeartIcon className="h-5 w-5" />
                )}
                <span>
                  {favorites.includes(matchedCombination.id) ? 'Remove from Favorites' : 'Save to Favorites'}
                </span>
              </button>
              
              <button 
                onClick={handleShareResult}
                className="btn-outline flex items-center space-x-2"
              >
                <ShareIcon className="h-5 w-5" />
                <span>Share Result</span>
              </button>
              
              <div className="flex space-x-2">
                <button 
                  onClick={handleDownloadImage}
                  disabled={isDownloading}
                  className="btn-secondary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDownloading ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <ArrowDownTrayIcon className="h-5 w-5" />
                  )}
                  <span>{isDownloading ? 'Downloading...' : 'Download Result'}</span>
                </button>
                
                <button 
                  onClick={handleDownloadComposite}
                  disabled={isDownloading}
                  className="btn-outline flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {isDownloading ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <ArrowDownTrayIcon className="h-4 w-4" />
                  )}
                  <span>Download All</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Favorites Section */}
        {favorites.length > 0 && (
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <HeartIconSolid className="h-6 w-6 mr-2 text-red-500" />
              Your Favorites ({favorites.length})
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allCombinations
                .filter(combo => favorites.includes(combo.id))
                .map((combination) => {
                  // Check if it's a custom combo (starts with 'combo-') or folder-based
                  const isCustomCombo = combination.id.startsWith('combo-');
                  const modelSrc = isCustomCombo ? combination.modelImage : `/outfit-data/${combination.modelImage}`;
                  const outfitSrc = isCustomCombo ? combination.outfitImage : `/outfit-data/${combination.outfitImage}`;
                  const resultSrc = isCustomCombo ? combination.resultImage : `/outfit-data/${combination.resultImage}`;
                  
                  return (
                    <div key={combination.id} className="border border-red-200 rounded-lg p-4 bg-red-50 hover:shadow-md transition-shadow">
                      <div className="grid grid-cols-3 gap-2 mb-3">
                        <div className="text-center">
                          <p className="text-xs text-gray-500 mb-1">Model</p>
                          <img
                            src={modelSrc}
                            alt="Model"
                            className="w-full h-16 object-cover rounded border"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = 'https://via.placeholder.com/100x100/cccccc/ffffff?text=Model';
                            }}
                          />
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-500 mb-1">Outfit</p>
                          <img
                            src={outfitSrc}
                            alt="Outfit"
                            className="w-full h-16 object-cover rounded border"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = 'https://via.placeholder.com/100x100/cccccc/ffffff?text=Outfit';
                            }}
                          />
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-500 mb-1">Result</p>
                          <img
                            src={resultSrc}
                            alt="Result"
                            className="w-full h-16 object-cover rounded border"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = 'https://via.placeholder.com/100x100/cccccc/ffffff?text=Result';
                            }}
                          />
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-700 mb-1">{combination.name || combination.id}</p>
                        <p className="text-xs text-gray-500 mb-3">{combination.tags.join(', ')}</p>
                        <div className="flex justify-center space-x-2">
                          <button
                            onClick={() => handleUseCombination(combination)}
                            className="btn-outline text-xs px-3 py-1"
                          >
                            Use This
                          </button>
                          <button
                            onClick={() => {
                              const newFavorites = favorites.filter(id => id !== combination.id);
                              setFavorites(newFavorites);
                              localStorage.setItem('sitfit-favorites', JSON.stringify(newFavorites));
                              toast.success('Removed from favorites');
                            }}
                            className="text-red-500 hover:text-red-700 text-xs px-2 py-1"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* Available Combinations Gallery */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <PhotoIcon className="h-6 w-6 mr-2" />
            Available Outfit Combinations ({allCombinations.length})
          </h2>
          
          {allCombinations.length === 0 ? (
            <div className="text-center py-12">
              <PhotoIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No outfit combinations available yet.</p>
              <p className="text-sm text-gray-400 mt-2">
                Add images to the outfit-data folder or use the "Add Combo" button above.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Show ALL combinations (both folder-based and custom) */}
              {allCombinations
                .filter((combination, index, self) => 
                  index === self.findIndex(c => c.id === combination.id)
                )
                .map((combination) => {
                  // Check if it's a custom combo (starts with 'combo-') or folder-based
                  const isCustomCombo = combination.id.startsWith('combo-');
                  const modelSrc = isCustomCombo ? combination.modelImage : `/outfit-data/${combination.modelImage}`;
                  const outfitSrc = isCustomCombo ? combination.outfitImage : `/outfit-data/${combination.outfitImage}`;
                  const resultSrc = isCustomCombo ? combination.resultImage : `/outfit-data/${combination.resultImage}`;
                  
                  return (
                    <div key={combination.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="grid grid-cols-3 gap-2 mb-3">
                        <div className="text-center">
                          <p className="text-xs text-gray-500 mb-1">Model</p>
                          <img
                            src={modelSrc}
                            alt="Model"
                            className="w-full h-16 object-cover rounded border"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = 'https://via.placeholder.com/100x100/cccccc/ffffff?text=Model';
                            }}
                          />
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-500 mb-1">Outfit</p>
                          <img
                            src={outfitSrc}
                            alt="Outfit"
                            className="w-full h-16 object-cover rounded border"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = 'https://via.placeholder.com/100x100/cccccc/ffffff?text=Outfit';
                            }}
                          />
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-500 mb-1">Result</p>
                          <img
                            src={resultSrc}
                            alt="Result"
                            className="w-full h-16 object-cover rounded border"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = 'https://via.placeholder.com/100x100/cccccc/ffffff?text=Result';
                            }}
                          />
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-700 mb-1 flex items-center justify-center">
                          {combination.name || combination.id}
                          {favorites.includes(combination.id) && (
                            <HeartIconSolid className="h-4 w-4 ml-1 text-red-500" />
                          )}
                        </p>
                        <p className="text-xs text-gray-500 mb-3">{combination.tags.join(', ')}</p>
                        <div className="flex justify-center space-x-2">
                          <button
                            onClick={() => handleUseCombination(combination)}
                            className="btn-outline text-xs px-3 py-1"
                          >
                            Use This
                          </button>
                          <button
                            onClick={() => {
                              const newFavorites = favorites.includes(combination.id)
                                ? favorites.filter(id => id !== combination.id)
                                : [...favorites, combination.id];
                              setFavorites(newFavorites);
                              localStorage.setItem('sitfit-favorites', JSON.stringify(newFavorites));
                              toast.success(newFavorites.includes(combination.id) ? 'Added to favorites!' : 'Removed from favorites');
                            }}
                            className={`text-xs px-2 py-1 ${
                              favorites.includes(combination.id) 
                                ? 'text-red-500 hover:text-red-700' 
                                : 'text-gray-500 hover:text-red-500'
                            }`}
                          >
                            {favorites.includes(combination.id) ? '❤️' : '🤍'}
                          </button>
                          {isCustomCombo && (
                            <button
                              onClick={() => handleDeleteCombo(combination.id)}
                              className="text-xs px-2 py-1 text-red-500 hover:text-red-700"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        {/* Combo Management */}
        <div className="bg-black border border-purple-300 rounded-xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">✨ Manage Your Combinations</h2>
            <button
              onClick={() => {
                console.log('Add Combo button clicked');
                setShowAddComboModal(true);
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <PlusIcon className="h-5 w-5" />
              <span className="font-semibold">Add Combo</span>
            </button>
          </div>
          
          <p className="text-white">
            Upload and manage your outfit combinations directly in the app. Add model photos, outfit images, and result pictures.
          </p>
        </div>

        {/* Add Combo Modal */}
        {showAddComboModal && (
          <div className="fixed inset-0 z-[9999] overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4">
              <div 
                className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm transition-opacity"
                onClick={() => setShowAddComboModal(false)}
              />
              
              <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-8 transform transition-all">
                <button
                  onClick={() => setShowAddComboModal(false)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>

                <h2 className="text-2xl font-bold text-gray-900 mb-6">Add New Combination</h2>

                <div className="space-y-6">
                  {/* Combo Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Combo *
                    </label>
                    <input
                      type="text"
                      value={newComboName}
                      onChange={(e) => setNewComboName(e.target.value)}
                      placeholder="e.g., combo_005, summer_001"
                      className="w-full px-4 py-2 bg-black text-white border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-400"
                    />
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tags (comma separated)
                    </label>
                    <input
                      type="text"
                      value={newComboTags}
                      onChange={(e) => setNewComboTags(e.target.value)}
                      placeholder="e.g., casual, summer, outdoor"
                      className="w-full px-4 py-2 bg-black text-white border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-400"
                    />
                  </div>

                  {/* Image Uploads */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Model Image */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Model Photo
                      </label>
                      <div
                        onDrop={(e) => handleDrop(e, 'model')}
                        onDragOver={handleDragOver}
                        className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-purple-500 transition-colors cursor-pointer"
                      >
                        {newComboModel ? (
                          <div className="relative">
                            <img src={newComboModel} alt="Model" className="w-full h-40 object-cover rounded" />
                            <button
                              onClick={() => setNewComboModel('')}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                            >
                              <XMarkIcon className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <div>
                            <PhotoIcon className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                            <p className="text-sm text-gray-600">Drop image or</p>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleFileSelect(e, 'model')}
                              className="hidden"
                              id="model-upload"
                            />
                            <label htmlFor="model-upload" className="text-purple-600 hover:text-purple-700 cursor-pointer font-medium">
                              Browse
                            </label>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Outfit Image */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Outfit Photo
                      </label>
                      <div
                        onDrop={(e) => handleDrop(e, 'outfit')}
                        onDragOver={handleDragOver}
                        className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-purple-500 transition-colors cursor-pointer"
                      >
                        {newComboOutfit ? (
                          <div className="relative">
                            <img src={newComboOutfit} alt="Outfit" className="w-full h-40 object-cover rounded" />
                            <button
                              onClick={() => setNewComboOutfit('')}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                            >
                              <XMarkIcon className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <div>
                            <PhotoIcon className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                            <p className="text-sm text-gray-600">Drop image or</p>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleFileSelect(e, 'outfit')}
                              className="hidden"
                              id="outfit-upload"
                            />
                            <label htmlFor="outfit-upload" className="text-purple-600 hover:text-purple-700 cursor-pointer font-medium">
                              Browse
                            </label>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Result Image */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Result Photo
                      </label>
                      <div
                        onDrop={(e) => handleDrop(e, 'result')}
                        onDragOver={handleDragOver}
                        className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-purple-500 transition-colors cursor-pointer"
                      >
                        {newComboResult ? (
                          <div className="relative">
                            <img src={newComboResult} alt="Result" className="w-full h-40 object-cover rounded" />
                            <button
                              onClick={() => setNewComboResult('')}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                            >
                              <XMarkIcon className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <div>
                            <PhotoIcon className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                            <p className="text-sm text-gray-600">Drop image or</p>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleFileSelect(e, 'result')}
                              className="hidden"
                              id="result-upload"
                            />
                            <label htmlFor="result-upload" className="text-purple-600 hover:text-purple-700 cursor-pointer font-medium">
                              Browse
                            </label>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-4">
                    <button
                      onClick={handleSaveCombo}
                      disabled={!newComboName || !newComboModel || !newComboOutfit || !newComboResult}
                      className="flex-1 py-3 px-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                    >
                      Save Combination
                    </button>
                    <button
                      onClick={() => setShowAddComboModal(false)}
                      className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default LocalTryOn;