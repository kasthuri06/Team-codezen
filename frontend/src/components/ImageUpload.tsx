import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { validateImageFile, fileToBase64, formatFileSize } from '../utils/imageUtils';
import toast from 'react-hot-toast';

interface ImageUploadProps {
  onImageSelect: (base64: string, file: File) => void;
  onImageRemove: () => void;
  currentImage?: string;
  label: string;
  accept?: string;
  maxSize?: number; // in MB
  className?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageSelect,
  onImageRemove,
  currentImage,
  label,
  accept = 'image/*',
  maxSize = 10,
  className = ''
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    
    if (!file) return;

    // Validate file
    if (!validateImageFile(file, maxSize)) {
      toast.error(`Please select a valid image file under ${maxSize}MB`);
      return;
    }

    try {
      setIsProcessing(true);
      const base64 = await fileToBase64(file);
      onImageSelect(base64, file);
      toast.success('Image uploaded successfully!');
    } catch (error) {
      console.error('Error processing image:', error);
      toast.error('Failed to process image. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }, [onImageSelect, maxSize]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    },
    maxFiles: 1,
    multiple: false
  });

  const handleRemove = () => {
    onImageRemove();
    toast.success('Image removed');
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      
      {currentImage ? (
        <div className="relative">
          <img
            src={currentImage}
            alt="Uploaded"
            className="w-full h-48 object-cover rounded-lg border border-gray-300"
          />
          <button
            onClick={handleRemove}
            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-primary-500 bg-primary-50'
              : 'border-gray-300 hover:border-gray-400'
          } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <input {...getInputProps()} disabled={isProcessing} />
          
          <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
          
          <div className="mt-4">
            {isProcessing ? (
              <p className="text-sm text-gray-600">Processing image...</p>
            ) : isDragActive ? (
              <p className="text-sm text-primary-600">Drop the image here...</p>
            ) : (
              <>
                <p className="text-sm text-gray-600">
                  <span className="font-medium text-primary-600">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  PNG, JPG, GIF up to {maxSize}MB
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;