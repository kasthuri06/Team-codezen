# 🎨 SitFit Local Try-On System

A local image matching system that allows you to store pre-generated outfit combinations and match them with user uploads.

## 🚀 Quick Start

1. **Run the setup script:**
   ```bash
   start-local-tryon.bat
   ```

2. **Add your images:**
   - Place model photos in `frontend/public/outfit-data/models/`
   - Place outfit photos in `frontend/public/outfit-data/outfits/`
   - Place result photos in `frontend/public/outfit-data/results/`

3. **Update the database:**
   - Edit `frontend/public/outfit-data/combinations.json`
   - Or use the helper script: `node add-outfit-combination.js`

4. **Access the system:**
   - Open http://localhost:3000
   - Navigate to "Local Try-On"

## 📁 Directory Structure

```
frontend/public/outfit-data/
├── models/           # Photos of people/models
├── outfits/          # Photos of clothing/outfits
├── results/          # Final try-on result images
├── combinations.json # Database mapping
└── README.md        # Documentation
```

## 🔧 How It Works

1. **Image Upload**: Users upload their model and outfit photos
2. **Similarity Matching**: System calculates similarity scores between uploaded images and stored combinations
3. **Best Match**: Returns the combination with the highest similarity score
4. **Result Display**: Shows the pre-generated result image

## 📝 Adding New Combinations

### Method 1: Using the Helper Script (Recommended)

```bash
node add-outfit-combination.js
```

Follow the prompts to add:
- Combination ID
- Image filenames
- Tags for categorization

### Method 2: Manual Editing

1. Add your images to the respective folders
2. Edit `combinations.json`:

```json
{
  "id": "combo_005",
  "modelImage": "models/your_model.jpg",
  "outfitImage": "outfits/your_outfit.jpg",
  "resultImage": "results/your_result.jpg",
  "tags": ["casual", "summer", "male"]
}
```

## 🏷️ Tagging System

Use descriptive tags for better organization:

- **Style**: casual, formal, business, party, sport
- **Season**: summer, winter, spring, fall
- **Gender**: male, female, unisex
- **Type**: dress, jeans, shirt, jacket, etc.
- **Color**: red, blue, black, white, etc.

## 🖼️ Image Guidelines

### Model Photos
- High resolution (400x600px minimum)
- Good lighting (natural light preferred)
- Person standing straight, arms at sides
- Plain background if possible
- Clear, unobstructed view

### Outfit Photos
- Product-style photos work best
- Clear view of the entire outfit
- Good contrast with background
- Minimal wrinkles or distortions
- High quality and sharp focus

### Result Photos
- Should show the model wearing the outfit
- Same lighting and pose style as model photo
- Professional quality preferred
- Realistic representation of the combination

## 🔍 Matching Algorithm

The current system uses a simple similarity calculation based on:
- File size comparison
- File type matching
- Random variation to simulate AI

### Future Improvements
For production use, consider implementing:
- **Canvas API**: For pixel-level image comparison
- **TensorFlow.js**: For feature extraction and deep learning
- **OpenCV.js**: For advanced image processing
- **Perceptual hashing**: For robust image similarity
- **Color histogram analysis**: For color-based matching

## 🛠️ Customization

### Adjusting Match Threshold
Edit `frontend/src/services/outfitMatcher.ts`:

```typescript
// Lower threshold = more matches, less accuracy
// Higher threshold = fewer matches, more accuracy
if (combinedScore > bestScore && combinedScore > 0.5) {
```

### Modifying Similarity Weights
```typescript
// Adjust the importance of model vs outfit matching
const combinedScore = (modelSimilarity * 0.6) + (outfitSimilarity * 0.4);
```

## 🚀 Production Deployment

1. **Optimize Images**: Compress images for web delivery
2. **CDN Integration**: Use a CDN for faster image loading
3. **Database**: Move from JSON to a proper database (MongoDB, PostgreSQL)
4. **Caching**: Implement image and result caching
5. **AI Integration**: Replace simple matching with real AI models

## 🔧 Troubleshooting

### Images Not Loading
- Check file paths in `combinations.json`
- Ensure images exist in the correct folders
- Verify image formats (JPG, PNG supported)

### No Matches Found
- Lower the similarity threshold
- Add more combinations to the database
- Check that uploaded images are clear and well-lit

### Performance Issues
- Optimize image sizes (recommended: under 2MB each)
- Reduce the number of combinations for testing
- Consider implementing lazy loading

## 📊 Analytics & Monitoring

Track these metrics for system improvement:
- Match success rate
- User satisfaction with matches
- Most popular combinations
- Upload failure rates
- Response times

## 🔐 Security Considerations

- Validate uploaded file types
- Limit file sizes to prevent abuse
- Sanitize file names
- Implement rate limiting
- Consider user authentication for uploads

## 🎯 Future Features

- **Batch Upload**: Upload multiple combinations at once
- **Auto-Tagging**: AI-powered automatic tag generation
- **Style Filters**: Filter combinations by style, season, etc.
- **User Favorites**: Save and organize favorite combinations
- **Social Sharing**: Share results on social media
- **Mobile App**: Native mobile application

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the console logs for error messages
3. Ensure all dependencies are installed
4. Verify the directory structure is correct

---

**Happy styling! 🎨✨**