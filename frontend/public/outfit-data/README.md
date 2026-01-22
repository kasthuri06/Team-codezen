# Outfit Data Directory

This directory contains the local outfit combination database for the SitFit application.

## Structure

- `models/` - Contains photos of people/models
- `outfits/` - Contains photos of clothing/outfits  
- `results/` - Contains the final try-on result images
- `combinations.json` - Database file that maps model + outfit combinations to results

## Adding New Combinations

1. Add your images to the respective folders:
   - Model photos go in `models/`
   - Outfit photos go in `outfits/`
   - Result photos go in `results/`

2. Update `combinations.json` with a new entry:
```json
{
  "id": "combo_003",
  "modelImage": "models/your_model.jpg",
  "outfitImage": "outfits/your_outfit.jpg", 
  "resultImage": "results/your_result.jpg",
  "tags": ["casual", "summer", "male"]
}
```

3. Refresh the application to see your new combinations!

## Image Guidelines

- Use high-quality images (recommended: 400x600px or higher)
- Ensure good lighting and clear visibility
- Use common image formats (JPG, PNG)
- Keep file sizes reasonable (under 5MB each)

## Tags

Use descriptive tags to help with categorization:
- Style: casual, formal, business, party, sport
- Season: summer, winter, spring, fall
- Gender: male, female, unisex
- Type: dress, jeans, shirt, jacket, etc.