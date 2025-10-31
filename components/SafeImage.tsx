import React, { useState, useCallback, memo } from 'react';
import { Image, ImageProps, View, StyleSheet, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';

interface SafeImageProps extends Omit<ImageProps, 'source'> {
  uri?: string;
  fallbackIconSize?: number;
  fallbackIconName?: keyof typeof Feather.glyphMap;
  showLoader?: boolean;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
}

const SafeImage = memo(function SafeImage({
  uri,
  style,
  fallbackIconSize = 40,
  fallbackIconName = 'image',
  showLoader = true,
  resizeMode = 'cover',
  ...props
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

  return (
    <View style={style}>
      <Image
        {...props}
        source={{ 
          uri: trimmedUri,
          cache: 'force-cache' // Enable caching
        }}
        style={[StyleSheet.absoluteFillObject, { resizeMode }]}
        onError={handleError}
        onLoad={handleLoad}
        onLoadStart={handleLoadStart}
      />
      {isLoading && showLoader && (
        <View style={[styles.loader, style]}>
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
  },
  loader: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
});
