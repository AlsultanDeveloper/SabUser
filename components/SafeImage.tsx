import React, { useState, useCallback, memo } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Image, ImageContentFit } from 'expo-image';
import { Feather } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';

interface SafeImageProps {
  uri?: string;
  style?: any;
  fallbackIconSize?: number;
  fallbackIconName?: keyof typeof Feather.glyphMap;
  showLoader?: boolean;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
  contentFit?: ImageContentFit;
}

const SafeImage = memo(function SafeImage({
  uri,
  style,
  fallbackIconSize = 40,
  fallbackIconName = 'image',
  showLoader = true,
  resizeMode = 'cover',
  contentFit,
}: SafeImageProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const trimmedUri = uri?.trim();
  
  const isValidUri = trimmedUri && 
    trimmedUri.length > 0 && (
      trimmedUri.startsWith('http://') || 
      trimmedUri.startsWith('https://') || 
      trimmedUri.startsWith('file://') ||
      trimmedUri.startsWith('data:')
    );

  const handleError = useCallback(() => {
    setHasError(true);
    setIsLoading(false);
  }, []);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
  }, []);

  const handleLoadStart = useCallback(() => {
    setIsLoading(true);
    setHasError(false);
  }, []);

  const renderFallback = () => (
    <View style={[styles.fallback, style]}>
      <Feather 
        name={fallbackIconName} 
        size={fallbackIconSize} 
        color={Colors.gray[300]} 
      />
    </View>
  );

  if (!isValidUri || hasError) {
    return renderFallback();
  }

  // Map resizeMode to contentFit
  const fit: ImageContentFit = contentFit || (resizeMode as ImageContentFit);

  return (
    <View style={style}>
      <Image
        source={{ uri: trimmedUri }}
        style={{
          width: '100%',
          height: '100%',
        }}
        contentFit={fit}
        onError={handleError}
        onLoad={handleLoad}
        onLoadStart={handleLoadStart}
        transition={150}
        cachePolicy="memory-disk"
        recyclingKey={trimmedUri}
        priority="high"
      />
      {isLoading && showLoader && (
        <View style={[styles.loader, StyleSheet.absoluteFillObject]}>
          <ActivityIndicator 
            size="small" 
            color={Colors.primary} 
          />
        </View>
      )}
    </View>
  );
});

export default SafeImage;

const styles = StyleSheet.create({
  fallback: {
    backgroundColor: Colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  loader: {
    backgroundColor: 'rgba(249, 250, 251, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

