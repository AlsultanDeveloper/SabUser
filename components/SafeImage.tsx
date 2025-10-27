// SafeImage.tsx - dummy content
import React, { useState } from 'react';
import { Image, ImageProps, View, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';

interface SafeImageProps extends Omit<ImageProps, 'source'> {
  uri?: string;
  fallbackIconSize?: number;
  fallbackIconName?: keyof typeof Feather.glyphMap;
}

export default function SafeImage({
  uri,
  style,
  fallbackIconSize = 40,
  fallbackIconName = 'image',
  ...props
}: SafeImageProps) {
  const [hasError, setHasError] = useState(false);
  
  const trimmedUri = uri?.trim();
  
  const isValidUri = trimmedUri && 
    trimmedUri.length > 0 && (
      trimmedUri.startsWith('http://') || 
      trimmedUri.startsWith('https://') || 
      trimmedUri.startsWith('file://') ||
      trimmedUri.startsWith('data:')
    );

  if (!isValidUri) {
    return (
      <View style={[styles.fallback, style]}>
        <Feather 
          name={fallbackIconName} 
          size={fallbackIconSize} 
          color={Colors.gray[300]} 
        />
      </View>
    );
  }

  if (hasError) {
    return (
      <View style={[styles.fallback, style]}>
        <Feather 
          name={fallbackIconName} 
          size={fallbackIconSize} 
          color={Colors.gray[300]} 
        />
      </View>
    );
  }

  return (
    <Image
      {...props}
      source={{ uri: trimmedUri }}
      style={style}
      onError={() => {
        setHasError(true);
      }}
    />
  );
}

const styles = StyleSheet.create({
  fallback: {
    backgroundColor: Colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
});
