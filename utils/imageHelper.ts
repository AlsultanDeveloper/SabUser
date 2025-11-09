/**
 * Get the best available image URL from a product object
 * Priority: images[0] > imageUrl > image > mainImage > fallback
 */
export const getProductImageUrl = (product: any, fallbackSize: number = 400): string => {
  if (!product) {
    return `https://via.placeholder.com/${fallbackSize}x${fallbackSize}?text=No+Image`;
  }

  // Try images array first
  if (product.images && Array.isArray(product.images) && product.images.length > 0) {
    const firstImage = product.images[0];
    
    // Check if it's an object with url property (new format)
    if (firstImage && typeof firstImage === 'object' && firstImage.url && typeof firstImage.url === 'string') {
      const url = firstImage.url.trim();
      if (url) return url;
    }
    // Check if it's a plain string (old format)
    else if (firstImage && typeof firstImage === 'string') {
      const url = firstImage.trim();
      if (url) return url;
    }
  }

  // Try imageUrl
  if (product.imageUrl && typeof product.imageUrl === 'string' && product.imageUrl.trim()) {
    return product.imageUrl.trim();
  }

  // Try image (but skip if it's literally "undefined")
  if (product.image && typeof product.image === 'string' && product.image.trim() && product.image !== 'undefined') {
    return product.image.trim();
  }

  // Try mainImage
  if (product.mainImage && typeof product.mainImage === 'string' && product.mainImage.trim() && product.mainImage !== 'undefined') {
    return product.mainImage.trim();
  }

  // Fallback placeholder
  return `https://via.placeholder.com/${fallbackSize}x${fallbackSize}?text=No+Image`;
};
