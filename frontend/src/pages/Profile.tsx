import React, { useState, useEffect } from 'react';
import { 
  UserIcon, 
  EnvelopeIcon, 
  CalendarIcon,
  CameraIcon,
  SparklesIcon,
  HeartIcon,
  Cog6ToothIcon,
  ArrowDownTrayIcon,
  ShareIcon,
  EyeIcon,
  TrashIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';
import { downloadService } from '../services/downloadService';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [styleTips, setStyleTips] = useState(true);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [tryOnHistory, setTryOnHistory] = useState<any[]>([]);
  const [stylistHistory, setStylistHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState({
    tryOns: 0,
    consultations: 0,
    favorites: 0
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = () => {
    // Load favorites from localStorage
    const localFavorites = JSON.parse(localStorage.getItem('sitfit-favorites') || '[]');
    const tryOnFavorites = JSON.parse(localStorage.getItem('sitfit-tryon-favorites') || '[]');
    const allFavorites = [...localFavorites, ...tryOnFavorites];
    setFavorites(allFavorites);

    // Load actual try-on history from localStorage
    const storedTryOnHistory = JSON.parse(localStorage.getItem('sitfit-tryon-history') || '[]');
    const storedFavorites = JSON.parse(localStorage.getItem('sitfit-tryon-favorites') || '[]');
    
    // Combine favorites and history, convert favorites to history format
    const favoritesAsHistory = storedFavorites.map((fav: any) => ({
      id: fav.id || `fav-${fav.timestamp}`,
      type: 'ai',
      modelImage: fav.modelImage || 'https://dummyimage.com/150x200/4ECDC4/ffffff&text=Model',
      outfitImage: fav.outfitImage || 'https://dummyimage.com/150x200/7ED321/ffffff&text=Outfit',
      resultImage: fav.image,
      createdAt: new Date(fav.timestamp || Date.now()),
      status: 'completed',
      tags: fav.garmentType ? [fav.garmentType] : ['ai-generated'],
      garmentType: fav.garmentType
    }));

    // Combine stored history with favorites
    const allTryOns = [...storedTryOnHistory, ...favoritesAsHistory];
    
    // Sort by creation date (newest first)
    allTryOns.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    setTryOnHistory(allTryOns);

    // Load stylist history from localStorage
    const storedStylistHistory = JSON.parse(localStorage.getItem('sitfit-stylist-history') || '[]');
    
    // If no stored history, use mock data
    const mockStylistHistory = storedStylistHistory.length > 0 ? storedStylistHistory : [
      {
        id: 1,
        query: "What should I wear for a job interview?",
        response: "For a job interview, I recommend a classic business professional look. Start with a well-fitted blazer in navy or charcoal, paired with matching trousers or a pencil skirt. Choose a crisp white or light blue button-down shirt, and complete the look with closed-toe shoes in black or brown leather.",
        createdAt: new Date('2024-01-15'),
        rating: 5
      },
      {
        id: 2,
        query: "Help me style a casual weekend outfit",
        response: "For a relaxed weekend look, try pairing comfortable dark jeans with a soft cotton t-shirt or casual blouse. Layer with a cardigan or light jacket, and finish with clean sneakers or comfortable flats. Add a crossbody bag and some simple jewelry for a put-together casual vibe.",
        createdAt: new Date('2024-01-14'),
        rating: 4
      }
    ];
    setStylistHistory(mockStylistHistory);

    // Update stats based on actual data
    setStats({
      tryOns: allTryOns.length,
      consultations: storedStylistHistory.length,
      favorites: allFavorites.length
    });
  };

  // Button functionality handlers
  const handleEditProfile = () => {
    setIsEditing(true);
  };

  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      // In a real app, you'd update the user profile via API
      // For now, we'll just simulate the save
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setDisplayName(user?.displayName || '');
    setIsEditing(false);
  };

  const handleViewTryOn = (item: any) => {
    // Create a modal or navigate to detailed view
    const itemType = item.garmentType ? 'favorite' : 'try-on';
    const date = item.timestamp ? new Date(item.timestamp).toLocaleDateString() : 
                 item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'recently';
    toast.success(`Viewing ${itemType} from ${date}`);
  };

  const handleShareTryOn = async (item: any) => {
    try {
      const resultImage = item.image || item.resultImage;
      const itemType = item.garmentType ? 'favorite look' : 'try-on result';
      const tags = item.tags ? item.tags.join(', ') : (item.garmentType || 'Fashion');
      
      const shareData = {
        title: `My Virtual ${itemType} - SitFit`,
        text: `Check out my virtual ${itemType}! Tags: ${tags}`,
        url: window.location.href
      };
      
      // Use the resultImage for sharing context
      console.log('Sharing image:', resultImage);
      
      await downloadService.shareContent(shareData);
      toast.success(`${itemType} shared successfully!`);
    } catch (error) {
      toast.error('Failed to share. Please try again.');
    }
  };

  const handleDownloadTryOn = async (item: any) => {
    try {
      const resultImage = item.image || item.resultImage;
      const itemId = item.id || `item-${Date.now()}`;
      const filename = `sitfit-${item.garmentType || 'tryon'}-${itemId}-${Date.now()}.jpg`;
      await downloadService.downloadImage(resultImage, { filename });
      toast.success('Image downloaded successfully!');
    } catch (error) {
      toast.error('Failed to download image. Please try again.');
    }
  };

  const handleDeleteTryOn = (tryOnId: string) => {
    if (window.confirm('Are you sure you want to delete this try-on?')) {
      // Remove from state
      const updatedHistory = tryOnHistory.filter(t => t.id !== tryOnId);
      setTryOnHistory(updatedHistory);
      
      // Update localStorage
      const storedHistory = JSON.parse(localStorage.getItem('sitfit-tryon-history') || '[]');
      const updatedStoredHistory = storedHistory.filter((t: any) => t.id !== tryOnId);
      localStorage.setItem('sitfit-tryon-history', JSON.stringify(updatedStoredHistory));
      
      // Also check and remove from favorites if it exists there
      const storedFavorites = JSON.parse(localStorage.getItem('sitfit-tryon-favorites') || '[]');
      const updatedFavorites = storedFavorites.filter((f: any) => f.id !== tryOnId);
      localStorage.setItem('sitfit-tryon-favorites', JSON.stringify(updatedFavorites));
      
      // Update stats
      setStats(prev => ({
        ...prev,
        tryOns: updatedHistory.length
      }));
      
      toast.success('Try-on deleted successfully');
    }
  };

  const handleRemoveFavorite = (favoriteId: string) => {
    if (window.confirm('Are you sure you want to remove this from favorites?')) {
      // Update state
      const newFavorites = favorites.filter(f => (f.id || f) !== favoriteId);
      setFavorites(newFavorites);
      
      // Update localStorage for local favorites (combination IDs)
      const localFavorites = JSON.parse(localStorage.getItem('sitfit-favorites') || '[]');
      const updatedLocalFavorites = localFavorites.filter((f: any) => f !== favoriteId);
      localStorage.setItem('sitfit-favorites', JSON.stringify(updatedLocalFavorites));
      
      // Update localStorage for try-on favorites (full objects)
      const tryOnFavorites = JSON.parse(localStorage.getItem('sitfit-tryon-favorites') || '[]');
      const updatedTryOnFavorites = tryOnFavorites.filter((f: any) => (f.id || f) !== favoriteId);
      localStorage.setItem('sitfit-tryon-favorites', JSON.stringify(updatedTryOnFavorites));
      
      // Update stats
      setStats(prev => ({
        ...prev,
        favorites: newFavorites.length
      }));
      
      toast.success('Removed from favorites');
    }
  };

  const handleViewStylistConversation = (conversation: any) => {
    // Navigate to stylist page with conversation context
    navigate('/stylist', { state: { conversation } });
  };

  const handleCreateNewTryOn = () => {
    navigate('/local-tryon');
  };

  const handleAskStylist = () => {
    navigate('/stylist');
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: UserIcon },
    { id: 'tryons', name: 'Try-Ons', icon: CameraIcon },
    { id: 'stylist', name: 'Style History', icon: SparklesIcon },
    { id: 'favorites', name: 'Favorites', icon: HeartIcon },
    { id: 'settings', name: 'Settings', icon: Cog6ToothIcon },
  ];

  const renderOverview = () => (
    <div className="space-y-6 animate-fadeIn">
      {/* Profile Info */}
      <div className="card bg-gradient-to-r from-primary-50 to-secondary-50 border-primary-200 hover:shadow-lg transition-all duration-300">
        <div className="flex items-center space-x-6">
          <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-200">
            <span className="text-2xl font-bold text-white">
              {user?.displayName?.[0] || user?.email?.[0] || 'U'}
            </span>
          </div>
          <div className="flex-1">
            {isEditing ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="text-2xl font-bold bg-transparent border-b-2 border-primary-300 focus:border-primary-500 outline-none"
                  placeholder="Enter display name"
                />
              </div>
            ) : (
              <h2 className="text-2xl font-bold text-gray-900">
                {displayName || 'Fashion Enthusiast'}
              </h2>
            )}
            <div className="flex items-center text-gray-600 mt-1">
              <EnvelopeIcon className="h-4 w-4 mr-2" />
              {user?.email}
            </div>
            <div className="flex items-center text-gray-600 mt-1">
              <CalendarIcon className="h-4 w-4 mr-2" />
              Member since January 2024
            </div>
          </div>
          <div className="flex space-x-2">
            {isEditing ? (
              <>
                <button 
                  onClick={handleSaveProfile}
                  disabled={isLoading}
                  className="btn-primary flex items-center space-x-2 disabled:opacity-50"
                >
                  {isLoading ? <LoadingSpinner size="sm" /> : <CheckIcon className="h-4 w-4" />}
                  <span>Save</span>
                </button>
                <button 
                  onClick={handleCancelEdit}
                  className="btn-outline flex items-center space-x-2"
                >
                  <XMarkIcon className="h-4 w-4" />
                  <span>Cancel</span>
                </button>
              </>
            ) : (
              <button 
                onClick={handleEditProfile}
                className="btn-outline flex items-center space-x-2 hover:scale-105 transition-transform duration-200"
              >
                <PencilIcon className="h-4 w-4" />
                <span>Edit Profile</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card text-center hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br from-blue-50 to-blue-100">
          <CameraIcon className="h-8 w-8 text-primary-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900 animate-countUp">{stats.tryOns}</div>
          <div className="text-sm text-gray-600">Try-Ons Created</div>
        </div>
        <div className="card text-center hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br from-purple-50 to-purple-100">
          <SparklesIcon className="h-8 w-8 text-secondary-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900 animate-countUp">{stats.consultations}</div>
          <div className="text-sm text-gray-600">Style Consultations</div>
        </div>
        <div className="card text-center hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br from-red-50 to-pink-100">
          <HeartIconSolid className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900 animate-countUp">{stats.favorites}</div>
          <div className="text-sm text-gray-600">Favorite Looks</div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card hover:shadow-lg transition-all duration-300">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
          Recent Activity
        </h3>
        <div className="space-y-3">
          {/* Show recent try-ons */}
          {tryOnHistory.slice(0, 2).map((tryon, index) => (
            <div key={`tryon-${tryon.id}`} className="flex items-center space-x-3 p-3 bg-gradient-to-r from-primary-50 to-transparent rounded-lg hover:from-primary-100 transition-colors duration-200">
              <CameraIcon className="h-5 w-5 text-primary-500" />
              <div className="flex-1">
                <p className="text-sm font-medium text-black">
                  Created {tryon.type === 'ai' ? 'AI' : 'local'} try-on
                </p>
                <p className="text-xs text-black">
                  {new Date(tryon.createdAt).toLocaleDateString() === new Date().toLocaleDateString() 
                    ? 'Today' 
                    : new Date(tryon.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
          
          {/* Show recent stylist consultations */}
          {stylistHistory.slice(0, 2).map((consultation, index) => (
            <div key={`stylist-${consultation.id}`} className="flex items-center space-x-3 p-3 bg-gradient-to-r from-secondary-50 to-transparent rounded-lg hover:from-secondary-100 transition-colors duration-200">
              <SparklesIcon className="h-5 w-5 text-secondary-500" />
              <div className="flex-1">
                <p className="text-sm font-medium text-black">Asked for style advice</p>
                <p className="text-xs text-black">
                  {new Date(consultation.createdAt).toLocaleDateString() === new Date().toLocaleDateString() 
                    ? 'Today' 
                    : new Date(consultation.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
          
          {/* Show fallback if no activities */}
          {tryOnHistory.length === 0 && stylistHistory.length === 0 && (
            <div className="text-center py-4">
              <p className="text-sm text-black">No recent activity</p>
              <p className="text-xs text-black mt-1">Start creating try-ons or ask the stylist for advice!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderTryOns = () => (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Your Try-On History</h3>
        <button 
          onClick={handleCreateNewTryOn}
          className="btn-primary hover:scale-105 transition-transform duration-200"
        >
          Create New Try-On
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tryOnHistory.map((tryon, index) => (
          <div 
            key={tryon.id} 
            className="card hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="relative">
              <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                <img 
                  src={tryon.resultImage} 
                  alt="Try-on result"
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `https://via.placeholder.com/300x400/4ECDC4/ffffff?text=Image+Not+Available`;
                  }}
                />
              </div>
              <div className="absolute top-2 right-2">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  tryon.type === 'ai' 
                    ? 'bg-purple-100 text-purple-800' 
                    : 'bg-green-100 text-green-800'
                }`}>
                  {tryon.type === 'ai' ? 'AI Generated' : 'Local Match'}
                </span>
              </div>
            </div>
            
            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">
                  {new Date(tryon.createdAt).toLocaleDateString()}
                </span>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                  {tryon.status}
                </span>
              </div>
              
              {tryon.tags && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {tryon.tags.map((tag: string) => (
                    <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              
              <div className="flex space-x-2">
                <button 
                  onClick={() => handleViewTryOn(tryon)}
                  className="btn-outline text-xs px-3 py-1 flex items-center space-x-1 hover:scale-105 transition-transform duration-200"
                >
                  <EyeIcon className="h-3 w-3" />
                  <span>View</span>
                </button>
                <button 
                  onClick={() => handleShareTryOn(tryon)}
                  className="btn-outline text-xs px-3 py-1 flex items-center space-x-1 hover:scale-105 transition-transform duration-200"
                >
                  <ShareIcon className="h-3 w-3" />
                  <span>Share</span>
                </button>
                <button 
                  onClick={() => handleDownloadTryOn(tryon)}
                  className="btn-outline text-xs px-3 py-1 flex items-center space-x-1 hover:scale-105 transition-transform duration-200"
                >
                  <ArrowDownTrayIcon className="h-3 w-3" />
                  <span>Download</span>
                </button>
                <button 
                  onClick={() => handleDeleteTryOn(tryon.id)}
                  className="text-red-500 hover:text-red-700 text-xs px-2 py-1 hover:scale-105 transition-all duration-200"
                >
                  <TrashIcon className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderStylistHistory = () => (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Style Consultation History</h3>
        <button 
          onClick={handleAskStylist}
          className="btn-primary hover:scale-105 transition-transform duration-200"
        >
          Ask Stylist
        </button>
      </div>
      
      <div className="space-y-4">
        {stylistHistory.map((conversation, index) => (
          <div 
            key={conversation.id} 
            className="card hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{conversation.query}</p>
                  <p className="text-sm text-black mt-1">
                    {new Date(conversation.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <span 
                      key={i}
                      className={`text-sm ${
                        i < conversation.rating ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-3">
                <p className="text-sm text-black">
                  {conversation.response.substring(0, 150)}...
                </p>
              </div>
              <button 
                onClick={() => handleViewStylistConversation(conversation)}
                className="text-sm text-primary-600 hover:text-primary-500 font-medium hover:underline transition-all duration-200"
              >
                View full conversation →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderFavorites = () => (
    <div className="space-y-6 animate-fadeIn">
      <h3 className="text-lg font-semibold text-gray-900">Your Favorite Looks</h3>
      
      {favorites.length === 0 ? (
        <div className="text-center py-12">
          <div className="animate-bounce">
            <HeartIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          </div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">No favorites yet</h4>
          <p className="text-gray-600 mb-6">
            Start creating try-ons and save your favorite looks here
          </p>
          <button 
            onClick={handleCreateNewTryOn}
            className="btn-primary hover:scale-105 transition-transform duration-200"
          >
            Create Your First Try-On
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((favorite, index) => (
            <div 
              key={favorite.id || index} 
              className="card hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="relative">
                <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                  {favorite.image ? (
                    <img 
                      src={favorite.image} 
                      alt="Favorite try-on result"
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://dummyimage.com/300x400/FF6B6B/ffffff&text=Favorite+Look';
                      }}
                    />
                  ) : (
                    <div className="text-center">
                      <HeartIconSolid className="h-12 w-12 text-red-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Favorite Look</p>
                    </div>
                  )}
                </div>
                <div className="absolute top-2 left-2">
                  <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full flex items-center">
                    <HeartIconSolid className="h-3 w-3 mr-1" />
                    Favorite
                  </span>
                </div>
                <button
                  onClick={() => handleRemoveFavorite(favorite.id || favorite)}
                  className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md hover:bg-purple-50 transition-colors duration-200"
                >
                  <TrashIcon className="h-4 w-4 text-red-500" />
                </button>
              </div>
              <div className="mt-4">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm font-medium text-gray-900">
                    {favorite.garmentType ? `${favorite.garmentType.replace('_', ' ')} Try-On` : `Favorite Look #${index + 1}`}
                  </p>
                  <span className="text-xs text-gray-500">
                    {favorite.timestamp ? new Date(favorite.timestamp).toLocaleDateString() : 'Recently saved'}
                  </span>
                </div>
                
                {/* Show model and outfit thumbnails if available */}
                {(favorite.modelImage || favorite.outfitImage) && (
                  <div className="flex space-x-2 mb-3">
                    {favorite.modelImage && (
                      <div className="w-12 h-16 bg-gray-100 rounded overflow-hidden">
                        <img 
                          src={favorite.modelImage} 
                          alt="Model"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://dummyimage.com/48x64/4ECDC4/ffffff&text=M';
                          }}
                        />
                      </div>
                    )}
                    {favorite.outfitImage && (
                      <div className="w-12 h-16 bg-gray-100 rounded overflow-hidden">
                        <img 
                          src={favorite.outfitImage} 
                          alt="Outfit"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://dummyimage.com/48x64/7ED321/ffffff&text=O';
                          }}
                        />
                      </div>
                    )}
                  </div>
                )}
                
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleViewTryOn(favorite)}
                    className="btn-outline text-xs px-3 py-1 flex items-center space-x-1 hover:scale-105 transition-transform duration-200"
                  >
                    <EyeIcon className="h-3 w-3" />
                    <span>View</span>
                  </button>
                  <button 
                    onClick={() => handleShareTryOn(favorite)}
                    className="btn-outline text-xs px-3 py-1 flex items-center space-x-1 hover:scale-105 transition-transform duration-200"
                  >
                    <ShareIcon className="h-3 w-3" />
                    <span>Share</span>
                  </button>
                  <button 
                    onClick={() => handleDownloadTryOn(favorite)}
                    className="btn-outline text-xs px-3 py-1 flex items-center space-x-1 hover:scale-105 transition-transform duration-200"
                  >
                    <ArrowDownTrayIcon className="h-3 w-3" />
                    <span>Download</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6 animate-fadeIn">
      <h3 className="text-lg font-semibold text-gray-900">Account Settings</h3>
      
      <div className="card space-y-6 hover:shadow-lg transition-all duration-300">
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-4">Profile Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="input-field transition-all duration-200 focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                defaultValue={user?.email || ''}
                className="input-field bg-gray-50"
                disabled
              />
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-md font-medium text-gray-900 mb-4">Preferences</h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-purple-50 transition-colors duration-200">
              <div>
                <p className="text-sm font-medium text-gray-900">Email Notifications</p>
                <p className="text-sm text-gray-600">Receive updates about new features</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={emailNotifications}
                  onChange={(e) => setEmailNotifications(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600 shadow-inner"></div>
              </label>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-purple-50 transition-colors duration-200">
              <div>
                <p className="text-sm font-medium text-gray-900">Style Tips</p>
                <p className="text-sm text-gray-600">Get weekly style recommendations</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={styleTips}
                  onChange={(e) => setStyleTips(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600 shadow-inner"></div>
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-between pt-6 border-t border-gray-200">
          <button 
            onClick={handleSaveProfile}
            disabled={isLoading}
            className="btn-secondary flex items-center space-x-2 disabled:opacity-50 hover:scale-105 transition-transform duration-200"
          >
            {isLoading ? <LoadingSpinner size="sm" /> : <CheckIcon className="h-4 w-4" />}
            <span>Save Changes</span>
          </button>
          <button 
            onClick={logout}
            className="text-red-600 hover:text-red-500 font-medium hover:underline transition-all duration-200"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'tryons':
        return renderTryOns();
      case 'stylist':
        return renderStylistHistory();
      case 'favorites':
        return renderFavorites();
      case 'settings':
        return renderSettings();
      default:
        return renderOverview();
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        {/* Animated Background */}
        <div className="fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-40 -right-32 w-80 h-80 bg-gradient-to-br from-primary-200 to-secondary-200 rounded-full opacity-20 animate-float"></div>
          <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-gradient-to-br from-secondary-200 to-primary-200 rounded-full opacity-20 animate-float-delayed"></div>
        </div>

        {/* Header */}
        <div className="mb-8 animate-slideDown">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
            Profile
          </h1>
          <p className="text-gray-600 mt-2">Manage your account and view your fashion journey</p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8 animate-slideUp">
          <nav className="-mb-px flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 whitespace-nowrap transition-all duration-300 hover:scale-105 ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600 transform translate-y-0'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="min-h-screen">
          {renderTabContent()}
        </div>
      </div>
    </Layout>
  );
};

export default Profile;