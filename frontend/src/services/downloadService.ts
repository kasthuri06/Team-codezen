/**
 * Download Service
 * Handles image downloads and file operations
 */

export interface DownloadOptions {
  filename?: string;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
}

class DownloadService {
  /**
   * Download an image from a URL
   */
  async downloadImage(imageUrl: string, options: DownloadOptions = {}): Promise<void> {
    const {
      filename = `sitfit-image-${Date.now()}.jpg`,
      quality = 0.9,
      format = 'jpeg'
    } = options;

    try {
      // Fetch the image
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }

      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.style.display = 'none';
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      throw error;
    }
  }

  /**
   * Download a canvas as an image
   */
  downloadCanvas(canvas: HTMLCanvasElement, filename: string = `sitfit-canvas-${Date.now()}.png`): void {
    try {
      const link = document.createElement('a');
      link.download = filename;
      link.href = canvas.toDataURL();
      link.click();
    } catch (error) {
      console.error('Canvas download failed:', error);
      throw error;
    }
  }

  /**
   * Create a composite image from multiple sources
   */
  async createCompositeImage(
    modelImageUrl: string,
    outfitImageUrl: string,
    resultImageUrl: string,
    filename: string = `sitfit-composite-${Date.now()}.jpg`
  ): Promise<void> {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context not available');

      // Set canvas size
      canvas.width = 1200;
      canvas.height = 600;

      // Load images
      const [modelImg, outfitImg, resultImg] = await Promise.all([
        this.loadImage(modelImageUrl),
        this.loadImage(outfitImageUrl),
        this.loadImage(resultImageUrl)
      ]);

      // Clear canvas with white background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw images side by side
      const imgWidth = 380;
      const imgHeight = 570;
      const padding = 20;
      const startY = 15;

      // Model image
      ctx.drawImage(modelImg, padding, startY, imgWidth, imgHeight);
      
      // Outfit image
      ctx.drawImage(outfitImg, padding * 2 + imgWidth, startY, imgWidth, imgHeight);
      
      // Result image
      ctx.drawImage(resultImg, padding * 3 + imgWidth * 2, startY, imgWidth, imgHeight);

      // Add labels
      ctx.fillStyle = '#333333';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      
      ctx.fillText('Your Photo', padding + imgWidth / 2, canvas.height - 5);
      ctx.fillText('Outfit', padding * 2 + imgWidth + imgWidth / 2, canvas.height - 5);
      ctx.fillText('Result', padding * 3 + imgWidth * 2 + imgWidth / 2, canvas.height - 5);

      // Download the composite
      this.downloadCanvas(canvas, filename);
    } catch (error) {
      console.error('Composite image creation failed:', error);
      throw error;
    }
  }

  /**
   * Load an image and return a promise
   */
  private loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  /**
   * Check if the browser supports native sharing
   */
  canShare(): boolean {
    return 'share' in navigator;
  }

  /**
   * Share content using native sharing or fallback to clipboard
   */
  async shareContent(data: {
    title?: string;
    text?: string;
    url?: string;
  }): Promise<void> {
    try {
      if (this.canShare()) {
        await navigator.share(data);
      } else {
        // Fallback to clipboard
        const shareText = `${data.title || ''}\n${data.text || ''}\n${data.url || ''}`.trim();
        await navigator.clipboard.writeText(shareText);
      }
    } catch (error) {
      console.error('Share failed:', error);
      throw error;
    }
  }

  /**
   * Copy text to clipboard
   */
  async copyToClipboard(text: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error('Copy to clipboard failed:', error);
      throw error;
    }
  }
}

export const downloadService = new DownloadService();
export default downloadService;