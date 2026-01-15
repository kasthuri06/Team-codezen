import React, { useState } from 'react';
import { ArrowPathIcon, CheckCircleIcon, Cog6ToothIcon, HeartIcon, ShareIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import Layout from '../components/Layout';
import ImageUpload from '../components/ImageUpload';
import LoadingSpinner from '../components/LoadingSpinner';
import UpgradeModal from '../components/UpgradeModal';
import api from '../config/api';
import { downloadService } from '../services/downloadService';
import { deductCredit, getUserCredits } from '../services/creditService';
import { useAuth } from '../contexts/AuthContext';
import { TryOnRequest, TryOnResponse } from '../types';
import toast from 'react-hot-toast';

const TryOn: React.FC = () => {
  const { user } = useAuth();
  const [modelImage, setModelImage] = useState<string>('');
  const [outfitImage, setOutfitImage] = useState<string>('');
  const [bottomClothImage, setBottomClothImage] = useState<string>('');
  const [generatedImage, setGeneratedImage] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [modelFile, setModelFile] = useState<File | null>(null);
  const [outfitFile, setOutfitFile] = useState<File | null>(null);
  const [bottomClothFile, setBottomClothFile] = useState<File | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [garmentType, setGarmentType] = useState<'full_body' | 'comb'>('full_body');
  const [isDownloading, setIsDownloading] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const handleModelImageSelect = (base64: string, file: File) => {
    setModelImage(base64);
    setModelFile(file);
    // Clear previous result when new image is selected
    setGeneratedImage('');
  };

  const handleOutfitImageSelect = (base64: string, file: File) => {
    setOutfitImage(base64);
    setOutfitFile(file);
    // Clear previous result when new image is selected
    setGeneratedImage('');
  };

  const handleBottomClothImageSelect = (base64: string, file: File) => {
    setBottomClothImage(base64);
    setBottomClothFile(file);
    // Clear previous result when new image is selected
    setGeneratedImage('');
  };

  const handleModelImageRemove = () => {
    setModelImage('');
    setModelFile(null);
    setGeneratedImage('');
  };

  const handleOutfitImageRemove = () => {
    setOutfitImage('');
    setOutfitFile(null);
    setGeneratedImage('');
  };

  const handleBottomClothImageRemove = () => {
    setBottomClothImage('');
    setBottomClothFile(null);
    setGeneratedImage('');
  };

  const handleGarmentTypeChange = (type: 'full_body' | 'comb') => {
    setGarmentType(type);
    // Clear bottom cloth image if switching to full_body
    if (type === 'full_body') {
      setBottomClothImage('');
      setBottomClothFile(null);
    }
    // Clear previous result when changing type
    setGeneratedImage('');
  };

  const handleGenerateTryOn = async () => {
    if (!modelImage || !outfitImage) {
      toast.error('Please upload both model and outfit images');
      return;
    }

    if (garmentType === 'comb' && !bottomClothImage) {
      toast.error('Please upload bottom cloth image for combination try-on');
      return;
    }

    // Check credits before generating
    if (!user) {
      toast.error('Please log in to continue');
      return;
    }

    try {
      const credits = await getUserCredits(user.uid);
      
      if (!credits.isPremium && credits.credits <= 0) {
        setShowUpgradeModal(true);
        return;
      }

      setIsGenerating(true);
      
      // Deduct credit
      const creditDeducted = await deductCredit(user.uid);
      if (!creditDeducted) {
        setShowUpgradeModal(true);
        setIsGenerating(false);
        return;
      }
      
      const request: TryOnRequest & { 
        garmentType: 'full_body' | 'comb';
        bottomClothImage?: string;
      } = {
        modelImage,
        outfitImage,
        garmentType,
        ...(garmentType === 'comb' && bottomClothImage && { bottomClothImage })
      };

      console.log('🚀 Sending try-on request to backend...');
      const response = await api.post<{ data: TryOnResponse }>('/tryon', request, {
        timeout: 60000 // 60 seconds for try-on generation
      });
      
      console.log('📦 Received response from backend:', response.data);
      
      if (response.data.data.success && response.data.data.generatedImageUrl) {
        console.log('✅ Image URL received:', response.data.data.generatedImageUrl);
        setGeneratedImage(response.data.data.generatedImageUrl);
        
        // Save to try-on history
        const historyItem = {
          id: `tryon-${Date.now()}`,
          type: 'ai',
          modelImage,
          outfitImage,
          resultImage: response.data.data.generatedImageUrl,
          createdAt: new Date(),
          status: 'completed',
          tags: [garmentType === 'comb' ? 'combination' : 'full-body', 'ai-generated'],
          garmentType
        };
        
        const existingHistory = JSON.parse(localStorage.getItem('sitfit-tryon-history') || '[]');
        existingHistory.unshift(historyItem); // Add to beginning (newest first)
        
        // Keep only last 50 items to prevent storage bloat
        if (existingHistory.length > 50) {
          existingHistory.splice(50);
        }
        
        localStorage.setItem('sitfit-tryon-history', JSON.stringify(existingHistory));
        
        // Check if it's demo mode
        if (response.data.data.message?.includes('Demo Mode')) {
          toast.success('Virtual try-on generated! (Demo Mode - Using placeholder image)', {
            duration: 6000
          });
        } else {
          toast.success('Virtual try-on generated successfully!');
        }
      } else {
        toast.error(response.data.data.message || 'Failed to generate try-on');
      }
    } catch (error: any) {
      console.error('❌ Try-on generation error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      const errorMessage = error.response?.data?.message || error.message || 'Failed to generate virtual try-on';
      toast.error(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    setModelImage('');
    setOutfitImage('');
    setBottomClothImage('');
    setGeneratedImage('');
    setModelFile(null);
    setOutfitFile(null);
    setBottomClothFile(null);
    setGarmentType('full_body');
    setIsFavorite(false);
  };

  const handleSaveToFavorites = () => {
    if (!generatedImage) return;

    const favoriteId = `tryon-${Date.now()}`;
    const favorites = JSON.parse(localStorage.getItem('sitfit-tryon-favorites') || '[]');
    
    if (isFavorite) {
      // Remove from favorites
      const newFavorites = favorites.filter((fav: any) => fav.image !== generatedImage);
      localStorage.setItem('sitfit-tryon-favorites', JSON.stringify(newFavorites));
      setIsFavorite(false);
      toast.success('Removed from favorites');
    } else {
      // Add to favorites
      const newFavorite = {
        id: favoriteId,
        image: generatedImage,
        modelImage,
        outfitImage,
        garmentType,
        timestamp: Date.now()
      };
      favorites.push(newFavorite);
      localStorage.setItem('sitfit-tryon-favorites', JSON.stringify(favorites));
      setIsFavorite(true);
      toast.success('Added to favorites! ❤️');
    }
  };

  const handleShareResult = async () => {
    if (!generatedImage) return;

    try {
      const shareData = {
        title: 'My Virtual Try-On Result - SitFit',
        text: `Check out my virtual try-on result created with SitFit AI!`,
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
    if (!generatedImage) return;

    setIsDownloading(true);
    try {
      const filename = `sitfit-ai-tryon-${Date.now()}.jpg`;
      await downloadService.downloadImage(generatedImage, { filename });
      toast.success('Image downloaded successfully!');
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Failed to download image. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const canGenerate = modelImage && outfitImage && !isGenerating && 
    (garmentType === 'full_body' || (garmentType === 'comb' && bottomClothImage));

  return (
    <>
      <UpgradeModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} />
      <Layout>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Virtual Try-On</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Upload a photo of yourself and an outfit to see how it looks on you using our AI technology
          </p>
        </div>

        {/* Garment Type Selection */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Cog6ToothIcon className="h-5 w-5 mr-2" />
            Try-On Mode
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => handleGarmentTypeChange('full_body')}
              className={`p-4 rounded-lg border-2 transition-all ${
                garmentType === 'full_body'
                  ? 'border-primary-500 bg-black text-white'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <div className="text-left">
                <h3 className="font-semibold">Full Body Outfit</h3>
                <p className={`text-sm mt-1 ${
                  garmentType === 'full_body' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Try on complete outfits like dresses, jumpsuits, or full sets
                </p>
              </div>
            </button>
            <button
              onClick={() => handleGarmentTypeChange('comb')}
              className={`p-4 rounded-lg border-2 transition-all ${
                garmentType === 'comb'
                  ? 'border-primary-500 bg-black text-white'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <div className="text-left">
                <h3 className="font-semibold">Separate Pieces</h3>
                <p className={`text-sm mt-1 ${
                  garmentType === 'comb' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Try on top and bottom pieces separately for mix-and-match styling
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Upload Section */}
        <div className={`grid gap-8 ${garmentType === 'comb' ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1 lg:grid-cols-2'}`}>
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

          {/* Top/Outfit Image Upload */}
          <div className="space-y-4">
            <ImageUpload
              onImageSelect={handleOutfitImageSelect}
              onImageRemove={handleOutfitImageRemove}
              currentImage={outfitImage}
              label={garmentType === 'comb' ? 'Upload Top Piece' : 'Upload Outfit Photo'}
              className="h-full"
            />
            {outfitFile && (
              <div className="text-sm text-gray-500 text-center">
                {outfitFile.name} ({(outfitFile.size / 1024 / 1024).toFixed(2)} MB)
              </div>
            )}
          </div>

          {/* Bottom Cloth Image Upload (only for comb mode) */}
          {garmentType === 'comb' && (
            <div className="space-y-4">
              <ImageUpload
                onImageSelect={handleBottomClothImageSelect}
                onImageRemove={handleBottomClothImageRemove}
                currentImage={bottomClothImage}
                label="Upload Bottom Piece"
                className="h-full"
              />
              {bottomClothFile && (
                <div className="text-sm text-gray-500 text-center">
                  {bottomClothFile.name} ({(bottomClothFile.size / 1024 / 1024).toFixed(2)} MB)
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4">
          <button
            onClick={handleGenerateTryOn}
            disabled={!canGenerate}
            className="btn-primary px-8 py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isGenerating ? (
              <>
                <LoadingSpinner size="sm" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <CheckCircleIcon className="h-5 w-5" />
                <span>Generate Try-On</span>
              </>
            )}
          </button>

          {(modelImage || outfitImage || generatedImage) && (
            <button
              onClick={handleReset}
              disabled={isGenerating}
              className="btn-secondary px-8 py-3 text-lg flex items-center space-x-2"
            >
              <ArrowPathIcon className="h-5 w-5" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Loading State */}
        {isGenerating && (
          <div className="card text-center py-12">
            <LoadingSpinner size="lg" />
            <h3 className="text-lg font-semibold text-gray-900 mt-4">
              Creating Your Virtual Try-On
            </h3>
            <p className="text-gray-600 mt-2">
              Our AI is working its magic... This usually takes 10-30 seconds
            </p>
            <div className="mt-6 max-w-md mx-auto">
              <div className="bg-gray-200 rounded-full h-2">
                <div className="bg-primary-500 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
              </div>
            </div>
          </div>
        )}

        {/* Result Section */}
        {generatedImage && !isGenerating && (
          <div className="card">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Your Virtual Try-On Result
            </h2>
            
            {/* Demo Mode Notice */}
            {generatedImage.includes('placeholder') && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">
                      Demo Mode Active
                    </h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <p>
                        The AI try-on service is currently in demo mode. In production, this would show your actual virtual try-on result using advanced AI technology.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Original Model */}
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">Original Photo</h3>
                <img
                  src={modelImage}
                  alt="Original model"
                  className="w-full h-64 object-cover rounded-lg border border-gray-200"
                />
              </div>

              {/* Outfit */}
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">Outfit</h3>
                <img
                  src={outfitImage}
                  alt="Outfit"
                  className="w-full h-64 object-cover rounded-lg border border-gray-200"
                />
              </div>

              {/* Generated Result */}
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">Virtual Try-On</h3>
                <div className="relative">
                  {imageLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
                      <LoadingSpinner size="md" message="Loading result..." />
                    </div>
                  )}
                  <img
                    src={generatedImage}
                    alt="Virtual try-on result"
                    className="w-full h-64 object-cover rounded-lg border border-gray-200 shadow-lg"
                    onLoad={() => setImageLoading(false)}
                    onLoadStart={() => setImageLoading(true)}
                    onError={(e) => {
                      setImageLoading(false);
                      // Fallback to a different image service if the first one fails
                      const target = e.target as HTMLImageElement;
                      if (!target.src.includes('dummyimage.com')) {
                        target.src = `https://dummyimage.com/400x600/4ECDC4/ffffff&text=Virtual+Try-On+Demo+Result`;
                      } else if (!target.src.includes('data:image/svg')) {
                        // Ultimate fallback to SVG data URL
                        target.src = `data:image/svg+xml;base64,${btoa(`
                          <svg width="400" height="600" xmlns="http://www.w3.org/2000/svg">
                            <rect width="100%" height="100%" fill="#4ECDC4"/>
                            <text x="50%" y="40%" text-anchor="middle" fill="white" font-family="Arial" font-size="24" font-weight="bold">
                              Virtual Try-On
                            </text>
                            <text x="50%" y="55%" text-anchor="middle" fill="white" font-family="Arial" font-size="18">
                              Demo Result
                            </text>
                            <text x="50%" y="70%" text-anchor="middle" fill="white" font-family="Arial" font-size="14">
                              Add credits for real results
                            </text>
                          </svg>
                        `)}`;
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons for Result */}
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <button 
                onClick={handleSaveToFavorites}
                className={`btn-primary flex items-center space-x-2 ${
                  isFavorite ? 'bg-red-500 hover:bg-red-600' : ''
                }`}
              >
                {isFavorite ? (
                  <HeartIconSolid className="h-5 w-5" />
                ) : (
                  <HeartIcon className="h-5 w-5" />
                )}
                <span>
                  {isFavorite ? 'Remove from Favorites' : 'Save to Favorites'}
                </span>
              </button>
              
              <button 
                onClick={handleShareResult}
                className="btn-outline flex items-center space-x-2"
              >
                <ShareIcon className="h-5 w-5" />
                <span>Share Result</span>
              </button>
              
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
                <span>{isDownloading ? 'Downloading...' : 'Download Image'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Tips Section */}
        <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
          <h2 className="text-lg font-semibold text-blue-900 mb-4">💡 Tips for Best Results</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-blue-800 mb-2">For Your Photo:</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Use good lighting (natural light works best)</li>
                <li>• Stand straight with arms at your sides</li>
                <li>• Wear fitted clothing for better results</li>
                <li>• Face the camera directly</li>
                <li>• Use a plain background if possible</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-blue-800 mb-2">For Outfit Photos:</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Use high-quality, clear images</li>
                <li>• Show the complete outfit</li>
                <li>• Avoid heavily wrinkled clothing</li>
                <li>• Product photos work great</li>
                <li>• Ensure good contrast with background</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>
    </>
  );
};

export default TryOn;