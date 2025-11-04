// useFirestore.ts - dummy content
import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  collection, 
  getDocs, 
  getDoc,
  doc,
  query, 
  where, 
  orderBy, 
  limit,
  QueryConstraint,
} from 'firebase/firestore';
import { db, isConfigured } from '@/constants/firebase';
import type { Category, Product, Banner, Brand } from '@/types';


async function fetchCategories(): Promise<Category[]> {
  if (!isConfigured || !db) {
    console.error('❌ Firebase not configured');
    throw new Error('Firebase not configured');
  }

  try {
      
    const categoriesRef = collection(db, 'categories');
    const q = query(categoriesRef, orderBy('order', 'asc'));
    const querySnapshot = await getDocs(q);
    
    const loadedCategories: Category[] = [];
      
    for (const docSnap of querySnapshot.docs) {
      const data = docSnap.data();
      
      const subcategoriesRef = collection(db, 'categories', docSnap.id, 'subcategory');
      // إزالة orderBy مؤقتاً لتجنب مشاكل الفهرسة
      // const subcategoriesQuery = query(subcategoriesRef, orderBy('order', 'asc'));
      const subcategoriesSnapshot = await getDocs(subcategoriesRef);
      
      const subcategories = subcategoriesSnapshot.docs.map((subDoc) => {
        const subData = subDoc.data();
        const subImageUrl = subData.image && typeof subData.image === 'string' && subData.image.trim() ? subData.image.trim() : '';
        
        // دعم جميع تنسيقات الأسماء الممكنة
        let subName;
        if (typeof subData.name === 'object' && subData.name !== null && (subData.name.en || subData.name.ar)) {
          // التنسيق: name: { en: "...", ar: "..." }
          subName = subData.name;
        } else if (subData.subcategoryEn || subData.subcategoryAr) {
          // التنسيق: subcategoryEn, subcategoryAr
          subName = { 
            en: subData.subcategoryEn || subData.subcategoryName || '', 
            ar: subData.subcategoryAr || subData.subcategoryNameAr || '' 
          };
        } else if (subData.subcategoryName || subData.subcategoryNameAr) {
          // التنسيق: subcategoryName, subcategoryNameAr
          subName = { 
            en: subData.subcategoryName || '', 
            ar: subData.subcategoryNameAr || '' 
          };
        } else if (typeof subData.name === 'string') {
          // التنسيق: name كنص واحد
          subName = { en: subData.name, ar: subData.name };
        } else {
          // لا يوجد اسم
          subName = { en: 'Unknown', ar: 'غير معروف' };
        }
        
        // console.log تم تعطيله لتجنب الأخطاء
        
        return {
          id: subDoc.id,
          name: subName,
          image: subImageUrl,
        };
      });
      
      const imageUrl = data.image && typeof data.image === 'string' && data.image.trim() ? data.image.trim() : '';
      const categoryName = data.name || { en: '', ar: '' };
      
      loadedCategories.push({
        id: docSnap.id,
        name: categoryName,
        icon: data.icon || 'Package',
        image: imageUrl,
        subcategories: subcategories,
      });
    }

    console.log('✅ Categories loaded from Firestore:', loadedCategories.length);
    return loadedCategories;
  } catch (err) {
    console.error('❌ Error loading categories:', err);
    throw err;
  }
}

export function useCategories() {
  const { data: categories = [], isLoading: loading, error, refetch } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  return { 
    categories, 
    loading, 
    error: error ? (error instanceof Error ? error.message : 'Failed to load categories') : null, 
    refetch 
  };
}

export function useCategory(categoryId: string) {
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCategory = useCallback(async () => {
    if (!categoryId) return;

    if (!isConfigured || !db) {
      console.error('❌ Firebase not configured');
      setError('Firebase not configured');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const categoryRef = doc(db, 'categories', categoryId);
      const categoryDoc = await getDoc(categoryRef);
      
      if (categoryDoc.exists()) {
        const data = categoryDoc.data();
        
        const subcategoriesRef = collection(db, 'categories', categoryId, 'subcategory');
        // إزالة orderBy مؤقتاً لتجنب مشاكل الفهرسة
        // const subcategoriesQuery = query(subcategoriesRef, orderBy('order', 'asc'));
        const subcategoriesSnapshot = await getDocs(subcategoriesRef);
        
        const subcategories = subcategoriesSnapshot.docs.map((subDoc) => {
          const subData = subDoc.data();
          // console.log تم تعطيله لتجنب الأخطاء
          
          const subImageUrl = subData.image && typeof subData.image === 'string' && subData.image.trim() ? subData.image.trim() : '';
          
          // دعم جميع تنسيقات الأسماء الممكنة
          let subName;
          if (typeof subData.name === 'object' && subData.name !== null && (subData.name.en || subData.name.ar)) {
            // التنسيق: name: { en: "...", ar: "..." }
            subName = subData.name;
          } else if (subData.subcategoryEn || subData.subcategoryAr) {
            // التنسيق: subcategoryEn, subcategoryAr
            subName = { 
              en: subData.subcategoryEn || subData.subcategoryName || '', 
              ar: subData.subcategoryAr || subData.subcategoryNameAr || '' 
            };
          } else if (subData.subcategoryName || subData.subcategoryNameAr) {
            // التنسيق: subcategoryName, subcategoryNameAr
            subName = { 
              en: subData.subcategoryName || '', 
              ar: subData.subcategoryNameAr || '' 
            };
          } else if (typeof subData.name === 'string') {
            // التنسيق: name كنص واحد
            subName = { en: subData.name, ar: subData.name };
          } else {
            // لا يوجد اسم
            subName = { en: 'Unknown', ar: 'غير معروف' };
          }
          
          // console.log تم تعطيله لتجنب الأخطاء
          
          return {
            id: subDoc.id,
            name: subName,
            image: subImageUrl,
          };
        });
        
        const imageUrl = data.image && typeof data.image === 'string' && data.image.trim() ? data.image.trim() : '';
        
        if (!imageUrl) {
          console.warn('⚠️ Category missing image:', categoryDoc.id, data.name);
        }
        
        setCategory({
          id: categoryDoc.id,
          name: data.name || { en: '', ar: '' },
          icon: data.icon || 'Package',
          image: imageUrl,
          subcategories: subcategories,
        });
        console.log('✅ Category loaded from Firestore:', categoryDoc.id);
      } else {
        console.error('❌ Category not found:', categoryId);
        setError('Category not found');
      }
    } catch (err) {
      console.error('❌ Error loading category:', err);
      setError(err instanceof Error ? err.message : 'Failed to load category');
    } finally {
      setLoading(false);
    }
  }, [categoryId]);

  useEffect(() => {
    loadCategory();
  }, [loadCategory]);

  const refetch = loadCategory;

  return { category, loading, error, refetch };
}

interface UseProductsOptions {
  categoryId?: string;
  subcategoryId?: string; // تغيير من subcategoryName إلى subcategoryId
  subcategoryName?: string; // نبقيه للتوافق مع الكود القديم
  featured?: boolean;
  limit?: number;
}

async function fetchProducts(options: UseProductsOptions = {}): Promise<Product[]> {
  if (!isConfigured || !db) {
    console.error('❌ Firebase not configured');
    throw new Error('Firebase not configured');
  }

  const productsRef = collection(db, 'products');
  
  const constraints: QueryConstraint[] = [];
  
  if (options.categoryId) {
    constraints.push(where('categoryId', '==', options.categoryId));
    // تعطيل orderBy مؤقتاً لاختبار المشكلة
    // constraints.push(orderBy('createdAt', 'desc'));
  } else if (options.featured) {
    // جلب المنتجات المميزة فقط
    constraints.push(where('featured', '==', true));
    // constraints.push(orderBy('createdAt', 'desc'));
  } else {
    // جلب جميع المنتجات بدون شرط featured
    // تعطيل orderBy مؤقتاً لاختبار المشكلة
    // constraints.push(orderBy('createdAt', 'desc'));
  }
  
  if (options.limit) {
    constraints.push(limit(options.limit));
  }
  
  const q = query(productsRef, ...constraints);
  const querySnapshot = await getDocs(q);
  let loadedProducts: Product[] = [];
  
  console.log(`📦 جاري جلب المنتجات من Firebase...`);
  console.log(`📊 عدد المنتجات المسترجعة: ${querySnapshot.size}`);
  
  querySnapshot.forEach((docSnap) => {
    const data = docSnap.data();
    
    // Filter by subcategory if specified (يدعم كلاً من subcategoryId و subcategoryName)
    if (options.subcategoryId) {
      if (!data.subcategoryId || data.subcategoryId !== options.subcategoryId) {
        console.log(`⏭️  Skipping product ${docSnap.id}: subcategoryId mismatch (expected: ${options.subcategoryId}, got: ${data.subcategoryId})`);
        return; // Skip products that don't match the subcategory ID
      }
    }
    
    if (options.subcategoryName) {
      if (!data.subcategoryName || data.subcategoryName !== options.subcategoryName) {
        return; // Skip products that don't match the subcategory name
      }
    }
    
    const imageUrl = data.image && typeof data.image === 'string' && data.image.trim() && data.image !== 'undefined' ? data.image.trim() : undefined;
    
    // Handle images array - it can contain objects {url, order, path} or strings
    let images: string[] = [];
    if (Array.isArray(data.images) && data.images.length > 0) {
      images = data.images
        .map((img: any) => {
          // If it's an object with url property
          if (img && typeof img === 'object' && img.url && typeof img.url === 'string') {
            return img.url.trim();
          }
          // If it's a plain string
          if (img && typeof img === 'string') {
            return img.trim();
          }
          return '';
        })
        .filter((url: string) => url && url !== 'undefined');
    } else if (imageUrl) {
      // Fallback: if no images array but has imageUrl, use that
      images = [imageUrl];
    } else if (data.imageUrl && typeof data.imageUrl === 'string' && data.imageUrl.trim()) {
      // Also check imageUrl field
      images = [data.imageUrl.trim()];
    }
    
    // Debug: log first few products to see image data
    if (loadedProducts.length < 3) {
      console.log(`\n📸 Product Image Debug #${loadedProducts.length + 1}:`);
      console.log(`   Name: ${typeof data.name === 'object' ? data.name.en : data.name}`);
      console.log(`   data.image:`, data.image);
      console.log(`   data.images:`, data.images);
      console.log(`   data.imageUrl:`, data.imageUrl);
      console.log(`   data.mainImage:`, data.mainImage);
      console.log(`   Computed imageUrl:`, imageUrl);
      console.log(`   Computed images array:`, images);
    }
    
    loadedProducts.push({
      id: docSnap.id,
      name: data.name || { en: '', ar: '' },
      description: data.description || { en: '', ar: '' },
      price: data.price || 0,
      image: imageUrl || '',
      images: images,
      category: data.categoryId || '',
      brand: data.brand,
      brandId: data.brandId,
      brandName: data.brandName || data.brand,
      categoryName: data.categoryName,
      subcategoryId: data.subcategoryId, // إضافة subcategoryId
      subcategoryName: data.subcategoryName || data.subcategoryEn || data.subcategory, // دعم التسميات المختلفة
      rating: data.rating || 0,
      reviews: data.reviews || 0,
      inStock: data.inStock !== false,
      discount: data.discount || 0,
      colors: data.colors,
      sizes: data.sizes,
      shoeSizes: data.shoeSizes,
      ageRange: data.ageRange,
      gender: data.gender,
      season: data.season,
      deliveryTime: data.deliveryTime,
      stock: data.stock,
      available: data.available,
    });
  });

  console.log(`✅ تم تحميل ${loadedProducts.length} منتج بنجاح من Firebase`);
  
  return loadedProducts;
}

export function useProducts(options: UseProductsOptions = {}) {
  const { data: products = [], isLoading: loading, error, refetch } = useQuery({
    queryKey: ['products', options.categoryId, options.subcategoryId, options.subcategoryName, options.featured, options.limit],
    queryFn: () => fetchProducts(options),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  return { 
    products, 
    loading, 
    error: error instanceof Error ? error.message : null, 
    refetch 
  };
}

export function useProduct(productId: string) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProduct = useCallback(async () => {
    if (!productId) return;

    if (!isConfigured || !db) {
      console.error('❌ Firebase not configured');
      setError('Firebase not configured');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const productRef = doc(db, 'products', productId);
      const productDoc = await getDoc(productRef);
      
      if (productDoc.exists()) {
        const data = productDoc.data();
        const imageUrl = data.image && typeof data.image === 'string' && data.image.trim() ? data.image.trim() : undefined;
        const images = Array.isArray(data.images) 
          ? data.images.filter((img: any) => img && typeof img === 'string' && img.trim())
          : imageUrl ? [imageUrl] : [];
        
        if (!imageUrl) {
          console.warn('⚠️ Product missing image:', productDoc.id, data.name);
        }
        
        setProduct({
          id: productDoc.id,
          name: data.name || { en: '', ar: '' },
          description: data.description || { en: '', ar: '' },
          price: data.price || 0,
          image: imageUrl || '',
          images: images,
          category: data.categoryId || '',
          brand: data.brand,
          brandId: data.brandId,
          brandName: data.brandName || data.brand,
          categoryName: data.categoryName,
          subcategoryId: data.subcategoryId,
          subcategoryName: data.subcategoryName || data.subcategoryEn || data.subcategory, // دعم التسميات المختلفة
          rating: data.rating || 0,
          reviews: data.reviews || 0,
          inStock: data.inStock !== false,
          discount: data.discount || 0,
          colors: data.colors,
          sizes: data.sizes,
          shoeSizes: data.shoeSizes,
          ageRange: data.ageRange,
          gender: data.gender,
          season: data.season,
          deliveryTime: data.deliveryTime,
          stock: data.stock,
          available: data.available,
        });
        console.log('✅ Product loaded from Firestore:', productDoc.id);
      } else {
        console.error('❌ Product not found:', productId);
        setError('Product not found');
      }
    } catch (err) {
      console.error('❌ Error loading product:', err);
      setError(err instanceof Error ? err.message : 'Failed to load product');
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    loadProduct();
  }, [loadProduct]);

  const refetch = loadProduct;

  return { product, loading, error, refetch };
}

export function useBanners() {
  const { data: banners = [], isLoading: loading, error, refetch } = useQuery({
    queryKey: ['banners'],
    queryFn: async () => {
      if (!isConfigured || !db) {
        console.error('❌ Firebase not configured');
        throw new Error('Firebase not configured');
      }

      try {
        const bannersRef = collection(db, 'banners');
        const q = query(bannersRef, where('isActive', '==', true), orderBy('order', 'asc'));
        console.log('🔍 Fetching banners from Firestore...');
        const querySnapshot = await getDocs(q);
        console.log('📊 Banners query result:', querySnapshot.size, 'documents');
        
        const loadedBanners: Banner[] = [];
        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          console.log('📊 Raw banner data:', {
            id: docSnap.id,
            data: data,
          });
          
          const imageUrl = data.image && typeof data.image === 'string' && data.image.trim() ? data.image.trim() : '';
          
          if (!imageUrl) {
            console.warn('⚠️ Banner missing image:', docSnap.id);
            return;
          }
          
          let title;
          let subtitle;
          
          if (typeof data.title === 'object' && data.title !== null) {
            title = data.title;
          } else if (typeof data.titleEn === 'string' || typeof data.titleAr === 'string') {
            title = { 
              en: data.titleEn || '', 
              ar: data.titleAr || '' 
            };
          } else {
            title = { en: '', ar: '' };
          }
          
          if (typeof data.subtitle === 'object' && data.subtitle !== null) {
            subtitle = data.subtitle;
          } else if (typeof data.subtitleEn === 'string' || typeof data.subtitleAr === 'string') {
            subtitle = { 
              en: data.subtitleEn || '', 
              ar: data.subtitleAr || '' 
            };
          } else {
            subtitle = { en: '', ar: '' };
          }
          
          console.log('✅ Parsed banner:', { id: docSnap.id, title, subtitle, image: imageUrl });
          
          loadedBanners.push({
            id: docSnap.id,
            image: imageUrl,
            title,
            subtitle,
          });
        });

        console.log('✅ All Banners loaded:', loadedBanners.length);
        return loadedBanners;
      } catch (err) {
        console.error('❌ Error loading banners:', err);
        throw err;
      }
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  return { 
    banners, 
    loading, 
    error: error ? (error instanceof Error ? error.message : 'Failed to load banners') : null, 
    refetch 
  };
}

export function useBrands() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBrands = useCallback(async () => {
    if (!isConfigured || !db) {
      console.error('❌ Firebase not configured');
      setError('Firebase not configured');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const brandsRef = collection(db, 'brands');
      const q = query(brandsRef, orderBy('name.en', 'asc'));
      const querySnapshot = await getDocs(q);
      
      const loadedBrands: Brand[] = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const imageUrl = data.image && typeof data.image === 'string' && data.image.trim() ? data.image.trim() : '';
        const logoUrl = data.logo && typeof data.logo === 'string' && data.logo.trim() ? data.logo.trim() : '';
        
        if (!imageUrl) {
          console.warn('⚠️ Brand missing image:', docSnap.id, data.name);
        }
        
        loadedBrands.push({
          id: docSnap.id,
          name: data.name || { en: '', ar: '' },
          description: data.description || { en: '', ar: '' },
          logo: logoUrl,
          image: imageUrl,
        });
      });

      setBrands(loadedBrands);
      console.log('✅ Brands loaded from Firestore:', loadedBrands.length);
    } catch (err) {
      console.error('❌ Error loading brands:', err);
      setError(err instanceof Error ? err.message : 'Failed to load brands');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBrands();
  }, [loadBrands]);

  const refetch = loadBrands;

  return { brands, loading, error, refetch };
}

export function useBrand(brandId: string) {
  const [brand, setBrand] = useState<Brand | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBrand = useCallback(async () => {
    if (!brandId) return;

    if (!isConfigured || !db) {
      console.error('❌ Firebase not configured');
      setError('Firebase not configured');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const brandRef = doc(db, 'brands', brandId);
      const brandDoc = await getDoc(brandRef);
      
      if (brandDoc.exists()) {
        const data = brandDoc.data();
        const imageUrl = data.image && typeof data.image === 'string' && data.image.trim() ? data.image.trim() : '';
        const logoUrl = data.logo && typeof data.logo === 'string' && data.logo.trim() ? data.logo.trim() : '';
        
        if (!imageUrl) {
          console.warn('⚠️ Brand missing image:', brandDoc.id, data.name);
        }
        
        setBrand({
          id: brandDoc.id,
          name: data.name || { en: '', ar: '' },
          description: data.description || { en: '', ar: '' },
          logo: logoUrl,
          image: imageUrl,
        });
        console.log('✅ Brand loaded from Firestore:', brandDoc.id);
      } else {
        console.error('❌ Brand not found:', brandId);
        setError('Brand not found');
      }
    } catch (err) {
      console.error('❌ Error loading brand:', err);
      setError(err instanceof Error ? err.message : 'Failed to load brand');
    } finally {
      setLoading(false);
    }
  }, [brandId]);

  useEffect(() => {
    loadBrand();
  }, [loadBrand]);

  const refetch = loadBrand;

  return { brand, loading, error, refetch };
}

export async function searchProducts(searchQuery: string): Promise<Product[]> {
  if (!isConfigured || !db) {
    console.error('❌ Firebase not configured');
    return [];
  }

  try {
    const productsRef = collection(db, 'products');
    const querySnapshot = await getDocs(productsRef);
    
    const results: Product[] = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const searchLower = searchQuery.toLowerCase();
      
      if (
        data.name?.en?.toLowerCase().includes(searchLower) ||
        data.name?.ar?.includes(searchQuery) ||
        data.description?.en?.toLowerCase().includes(searchLower) ||
        data.brand?.toLowerCase().includes(searchLower)
      ) {
        const imageUrl = data.image && typeof data.image === 'string' && data.image.trim() ? data.image.trim() : undefined;
        const images = Array.isArray(data.images) 
          ? data.images.filter((img: any) => img && typeof img === 'string' && img.trim())
          : imageUrl ? [imageUrl] : [];
        
        results.push({
          id: docSnap.id,
          name: data.name || { en: '', ar: '' },
          description: data.description || { en: '', ar: '' },
          price: data.price || 0,
          image: imageUrl || '',
          images: images,
          category: data.categoryId || '',
          brand: data.brand,
          rating: data.rating || 0,
          reviews: data.reviews || 0,
          inStock: data.inStock !== false,
          discount: data.discount || 0,
        });
      }
    });

    console.log('✅ Search completed:', results.length, 'results');
    return results;
  } catch (error) {
    console.error('❌ Error searching products:', error);
    return [];
  }
}
