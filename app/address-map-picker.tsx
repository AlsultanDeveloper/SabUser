// address-map-picker.tsx - dummy content
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
  TextInput,
  Keyboard,
  Animated,
  ScrollView,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import { WebView } from 'react-native-webview';
import { Colors, Spacing, BorderRadius, FontSizes, Shadows } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { createDocument, collections } from '@/constants/firestore';

interface LocationCoords {
  latitude: number;
  longitude: number;
  address?: string;
}

interface SearchResult {
  display_name: string;
  lat: string;
  lon: string;
}

export default function AddressMapPickerScreen() {
  const router = useRouter();
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const { user } = useAuth();
  const [location, setLocation] = useState<LocationCoords | null>(null);
  const [loading, setLoading] = useState(true);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [addressForm, setAddressForm] = useState({
    label: '',
    fullName: '',
    phoneNumber: '',
    addressDetails: '',
    city: '',
    postalCode: '',
  });
  const webViewRef = useRef<WebView>(null);
  const pinScaleValue = useMemo(() => new Animated.Value(1), []);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const getCurrentLocation = useCallback(async () => {
    try {
      setLoading(true);
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const coords = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      };
      setLocation(coords);
      
      if (webViewRef.current && mapReady) {
        webViewRef.current.injectJavaScript(`
          updateLocation(${coords.latitude}, ${coords.longitude});
          true;
        `);
      }
    } catch (error) {
      console.error('Error getting current location:', error);
      const defaultCoords = {
        latitude: 24.7136,
        longitude: 46.6753,
      };
      setLocation(defaultCoords);
    } finally {
      setLoading(false);
    }
  }, [mapReady]);

  const requestLocationPermission = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please grant location permission to use map picker',
          [
            { text: 'Cancel', onPress: () => router.back() },
            { text: 'Settings', onPress: () => Location.requestForegroundPermissionsAsync() },
          ]
        );
        setLoading(false);
        return;
      }

      setPermissionGranted(true);
      await getCurrentLocation();
    } catch (error) {
      console.error('Error requesting location permission:', error);
      setLoading(false);
    }
  }, [router, getCurrentLocation]);

  useEffect(() => {
    requestLocationPermission();
  }, [requestLocationPermission]);

  const handleConfirmLocation = () => {
    if (!location) {
      Alert.alert('Error', 'Please select a location');
      return;
    }

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    setShowAddressForm(true);
  };

  const handleSaveAddress = async () => {
    if (!user?.uid) {
      Alert.alert('Error', 'Please sign in to save address');
      return;
    }

    if (!location) {
      Alert.alert('Error', 'Please select a location');
      return;
    }

    if (!addressForm.fullName || !addressForm.phoneNumber || !addressForm.city) {
      Alert.alert('Error', 'Please fill in all required fields (Name, Phone, City)');
      return;
    }

    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    setSaving(true);
    try {
      const addressData = {
        userId: user.uid,
        fullName: addressForm.fullName,
        phoneNumber: addressForm.phoneNumber,
        address: `${addressForm.addressDetails || location.address || 'Address'}${addressForm.city ? ', ' + addressForm.city : ''}`,
        city: addressForm.city,
        postalCode: addressForm.postalCode,
        country: 'Saudi Arabia',
        latitude: location.latitude,
        longitude: location.longitude,
        isDefault: false,
        label: addressForm.label || undefined,
      };

      await createDocument(collections.addresses, addressData);
      
      Alert.alert(
        'Success',
        'Address saved successfully!',
        [
          { 
            text: 'OK', 
            onPress: () => {
              if (mode === 'checkout') {
                router.back();
              } else {
                router.replace('/addresses' as any);
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error saving address:', error);
      Alert.alert('Error', 'Failed to save address. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'locationChanged') {
        setLocation({
          latitude: data.latitude,
          longitude: data.longitude,
          address: data.address,
        });
        animatePin();
      }
    } catch (error) {
      console.error('Error parsing WebView message:', error);
    }
  };

  const animatePin = useCallback(() => {
    Animated.sequence([
      Animated.timing(pinScaleValue, {
        toValue: 1.3,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(pinScaleValue, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  }, [pinScaleValue]);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (query.trim().length < 3) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearching(true);
      setShowSearchResults(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=sa`
        );
        const data = await response.json();
        setSearchResults(data);
      } catch (error) {
        console.error('Error searching location:', error);
      } finally {
        setIsSearching(false);
      }
    }, 500);
  };

  const selectSearchResult = (result: SearchResult) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    
    setLocation({
      latitude: lat,
      longitude: lng,
      address: result.display_name,
    });

    if (webViewRef.current && mapReady) {
      webViewRef.current.injectJavaScript(`
        updateLocation(${lat}, ${lng});
        true;
      `);
    }

    setSearchQuery('');
    setShowSearchResults(false);
    setSearchResults([]);
    Keyboard.dismiss();
  };

  const getMapHTML = () => {
    const initialLat = location?.latitude || 24.7136;
    const initialLng = location?.longitude || 46.6753;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body, html { height: 100%; width: 100%; overflow: hidden; }
          #map { height: 100%; width: 100%; }
          .marker {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -100%);
            font-size: 44px;
            color: #7C3AED;
            z-index: 1000;
            pointer-events: none;
            filter: drop-shadow(0 3px 8px rgba(124, 58, 237, 0.4));
            transition: transform 0.15s ease-out;
          }
          .marker-animating {
            transform: translate(-50%, -100%) scale(1.2);
          }
        </style>
      </head>
      <body>
        <div class="marker">📍</div>
        <div id="map"></div>
        <script>
          let map;
          let marker;
          let currentLat = ${initialLat};
          let currentLng = ${initialLng};

          function initMap() {
            map = L.map('map', {
              zoomControl: true,
              attributionControl: false
            }).setView([currentLat, currentLng], 15);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              maxZoom: 19
            }).addTo(map);

            map.on('movestart', function() {
              const marker = document.querySelector('.marker');
              if (marker) marker.classList.add('marker-animating');
            });

            map.on('moveend', function() {
              const center = map.getCenter();
              currentLat = center.lat;
              currentLng = center.lng;
              const marker = document.querySelector('.marker');
              if (marker) marker.classList.remove('marker-animating');
              sendLocationUpdate();
            });

            sendLocationUpdate();
          }

          function sendLocationUpdate() {
            fetch('https://nominatim.openstreetmap.org/reverse?format=json&lat=' + currentLat + '&lon=' + currentLng)
              .then(response => response.json())
              .then(data => {
                const message = {
                  type: 'locationChanged',
                  latitude: currentLat,
                  longitude: currentLng,
                  address: data.display_name || 'Address not available'
                };
                window.ReactNativeWebView.postMessage(JSON.stringify(message));
              })
              .catch(() => {
                const message = {
                  type: 'locationChanged',
                  latitude: currentLat,
                  longitude: currentLng,
                  address: 'Address not available'
                };
                window.ReactNativeWebView.postMessage(JSON.stringify(message));
              });
          }

          function updateLocation(lat, lng) {
            currentLat = lat;
            currentLng = lng;
            map.setView([lat, lng], 15);
            sendLocationUpdate();
          }

          window.addEventListener('load', function() {
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
            script.onload = initMap;
            document.head.appendChild(script);

            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
            document.head.appendChild(link);
          });
        </script>
      </body>
      </html>
    `;
  };

  if (showAddressForm) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Stack.Screen options={{ headerShown: false }} />
        
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setShowAddressForm(false)} style={styles.backButton}>
            <Feather name="arrow-left" size={24} color={Colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>إضافة عنوان</Text>
          <View style={styles.backButton} />
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.formContainer}
        >
          <ScrollView 
            style={styles.formScroll} 
            contentContainerStyle={styles.formScrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {location && (
              <View style={styles.locationPreviewCard}>
                <View style={styles.locationPreviewHeader}>
                  <Feather name="map-pin" size={20} color={Colors.primary} />
                  <Text style={styles.locationPreviewTitle}>الموقع المحدد</Text>
                </View>
                {location.address && (
                  <Text style={styles.locationPreviewText} numberOfLines={2}>
                    {location.address}
                  </Text>
                )}
                <Text style={styles.locationPreviewCoords}>
                  {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                </Text>
              </View>
            )}

            <View style={styles.formSection}>
              <Text style={styles.formSectionTitle}>تفاصيل العنوان</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.formLabel}>التسمية (اختياري)</Text>
                <View style={styles.labelButtons}>
                  {['Home', 'Work', 'Other'].map((label) => (
                    <TouchableOpacity
                      key={label}
                      style={[
                        styles.labelButton,
                        addressForm.label === label && styles.labelButtonActive,
                      ]}
                      onPress={() => setAddressForm({ ...addressForm, label })}
                      activeOpacity={0.7}
                    >
                      <Feather 
                        name={label === 'Home' ? 'home' : label === 'Work' ? 'briefcase' : 'map-pin'} 
                        size={16} 
                        color={addressForm.label === label ? Colors.white : Colors.gray[600]} 
                      />
                      <Text style={[
                        styles.labelButtonText,
                        addressForm.label === label && styles.labelButtonTextActive,
                      ]}>
                        {label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.formLabel}>الاسم الكامل *</Text>
                <View style={styles.formInputContainer}>
                  <Feather name="user" size={20} color={Colors.gray[400]} />
                  <TextInput
                    style={styles.formInput}
                    value={addressForm.fullName}
                    onChangeText={(text) => setAddressForm({ ...addressForm, fullName: text })}
                    placeholder="أدخل الاسم الكامل"
                    placeholderTextColor={Colors.gray[400]}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.formLabel}>رقم الهاتف *</Text>
                <View style={styles.formInputContainer}>
                  <Feather name="phone" size={20} color={Colors.gray[400]} />
                  <TextInput
                    style={styles.formInput}
                    value={addressForm.phoneNumber}
                    onChangeText={(text) => setAddressForm({ ...addressForm, phoneNumber: text })}
                    placeholder="ضع رقم هاتفك"
                    placeholderTextColor={Colors.gray[400]}
                    keyboardType="phone-pad"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.formLabel}>تفاصيل العنوان (اختياري)</Text>
                <View style={[styles.formInputContainer, styles.textAreaContainer]}>
                  <Feather name="map" size={20} color={Colors.gray[400]} style={styles.textAreaIcon} />
                  <TextInput
                    style={[styles.formInput, styles.textAreaInput]}
                    value={addressForm.addressDetails}
                    onChangeText={(text) => setAddressForm({ ...addressForm, addressDetails: text })}
                    placeholder="رقم المبنى، الطابق، الشقة، إلخ"
                    placeholderTextColor={Colors.gray[400]}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                  />
                </View>
              </View>

              <View style={styles.rowInputs}>
                <View style={[styles.inputGroup, styles.halfInput]}>
                  <Text style={styles.formLabel}>المدينة *</Text>
                  <View style={styles.formInputContainer}>
                    <TextInput
                      style={styles.formInput}
                      value={addressForm.city}
                      onChangeText={(text) => setAddressForm({ ...addressForm, city: text })}
                      placeholder="مدينتك"
                      placeholderTextColor={Colors.gray[400]}
                    />
                  </View>
                </View>

                <View style={[styles.inputGroup, styles.halfInput]}>
                  <Text style={styles.formLabel}>الرمز البريدي</Text>
                  <View style={styles.formInputContainer}>
                    <TextInput
                      style={styles.formInput}
                      value={addressForm.postalCode}
                      onChangeText={(text) => setAddressForm({ ...addressForm, postalCode: text })}
                      placeholder="12345"
                      placeholderTextColor={Colors.gray[400]}
                      keyboardType="number-pad"
                    />
                  </View>
                </View>
              </View>
            </View>
          </ScrollView>

          <View style={styles.formFooter}>
            <TouchableOpacity
              style={[styles.saveAddressButton, saving && styles.saveAddressButtonDisabled]}
              onPress={handleSaveAddress}
              disabled={saving}
              activeOpacity={0.8}
            >
              <Feather name="check" size={20} color={Colors.white} />
              <Text style={styles.saveAddressButtonText}>
                {saving ? 'جاري الحفظ...' : 'حفظ العنوان'}
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>حدد الموقع</Text>
        <View style={styles.backButton} />
      </View>

      {permissionGranted && (
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Feather name="search" size={20} color={Colors.text.secondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="ابحث عن عنوان أو منطقة"
              placeholderTextColor={Colors.text.secondary}
              value={searchQuery}
              onChangeText={handleSearch}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => {
                setSearchQuery('');
                setShowSearchResults(false);
                setSearchResults([]);
              }}>
                <Feather name="x" size={20} color={Colors.text.secondary} />
              </TouchableOpacity>
            )}
          </View>

          {showSearchResults && (
            <View style={styles.searchResults}>
              {isSearching ? (
                <View style={styles.searchResultItem}>
                  <ActivityIndicator size="small" color={Colors.primary} />
                  <Text style={styles.searchResultText}>جاري البحث...</Text>
                </View>
              ) : searchResults.length > 0 ? (
                searchResults.map((result, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.searchResultItem}
                    onPress={() => selectSearchResult(result)}
                  >
                    <Feather name="map-pin" size={18} color={Colors.primary} />
                    <Text style={styles.searchResultText} numberOfLines={2}>
                      {result.display_name}
                    </Text>
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.searchResultItem}>
                  <Feather name="alert-circle" size={18} color={Colors.text.secondary} />
                  <Text style={styles.searchResultText}>لم يتم العثور على نتائج</Text>
                </View>
              )}
            </View>
          )}
        </View>
      )}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading map...</Text>
        </View>
      ) : !permissionGranted ? (
        <View style={styles.errorContainer}>
          <Feather name="map-pin" size={80} color={Colors.gray[300]} />
          <Text style={styles.errorTitle}>Location Permission Required</Text>
          <Text style={styles.errorDescription}>
            Please grant location permission to use the map picker
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={requestLocationPermission}
          >
            <Text style={styles.retryButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.mapContainer}>
            <WebView
              ref={webViewRef}
              source={{ html: getMapHTML() }}
              style={styles.webview}
              onMessage={handleWebViewMessage}
              onLoadEnd={() => setMapReady(true)}
              javaScriptEnabled
              domStorageEnabled
              startInLoadingState
              renderLoading={() => (
                <View style={styles.webviewLoading}>
                  <ActivityIndicator size="large" color={Colors.primary} />
                  <Text style={styles.loadingText}>Loading map...</Text>
                </View>
              )}
            />
            {location && (
              <View style={styles.infoCard}>
                <View style={styles.infoHeader}>
                  <Feather name="map-pin" size={20} color={Colors.primary} />
                  <Text style={styles.infoTitle}>الموقع المحدد</Text>
                </View>
                {location.address && (
                  <Text style={styles.infoAddress} numberOfLines={3}>
                    {location.address}
                  </Text>
                )}
                <Text style={styles.infoCoords}>
                  {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={styles.locateMeButton}
              onPress={getCurrentLocation}
              activeOpacity={0.8}
            >
              <View style={styles.locateMeIcon}>
                <Feather name="navigation" size={20} color={Colors.primary} />
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleConfirmLocation}
              activeOpacity={0.9}
            >
              <Feather name="check" size={22} color={Colors.white} />
              <Text style={styles.confirmButtonText}>تأكيد الموقع</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  formContainer: {
    flex: 1,
  },
  formScroll: {
    flex: 1,
  },
  formScrollContent: {
    padding: Spacing.md,
    paddingBottom: 100,
  },
  locationPreviewCard: {
    backgroundColor: Colors.primary + '10',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  locationPreviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  locationPreviewTitle: {
    fontSize: FontSizes.md,
    fontWeight: 'bold' as const,
    color: Colors.primary,
  },
  locationPreviewText: {
    fontSize: FontSizes.sm,
    color: Colors.text.primary,
    lineHeight: 20,
    marginBottom: Spacing.xs,
  },
  locationPreviewCoords: {
    fontSize: FontSizes.xs,
    color: Colors.text.secondary,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  formSection: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    ...Shadows.sm,
  },
  formSectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: 'bold' as const,
    color: Colors.text.primary,
    marginBottom: Spacing.lg,
    textAlign: 'right',
  },
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  formLabel: {
    fontSize: FontSizes.sm,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
    textAlign: 'right',
  },
  labelButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  labelButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.gray[300],
    backgroundColor: Colors.white,
  },
  labelButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  labelButtonText: {
    fontSize: FontSizes.sm,
    fontWeight: '600' as const,
    color: Colors.gray[600],
  },
  labelButtonTextActive: {
    color: Colors.white,
  },
  formInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray[100],
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.gray[200],
  },
  formInput: {
    flex: 1,
    fontSize: FontSizes.md,
    color: Colors.text.primary,
    textAlign: 'right',
  },
  textAreaContainer: {
    alignItems: 'flex-start',
    paddingVertical: Spacing.sm,
  },
  textAreaIcon: {
    marginTop: 2,
  },
  textAreaInput: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  rowInputs: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  halfInput: {
    flex: 1,
  },
  formFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    padding: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[200],
    ...Shadows.lg,
  },
  saveAddressButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md + 2,
    borderRadius: BorderRadius.xl,
    ...Shadows.md,
  },
  saveAddressButtonDisabled: {
    opacity: 0.6,
  },
  saveAddressButtonText: {
    fontSize: FontSizes.md,
    fontWeight: 'bold' as const,
    color: Colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: FontSizes.xl,
    fontWeight: 'bold' as const,
    color: Colors.text.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
  },
  loadingText: {
    fontSize: FontSizes.md,
    color: Colors.text.secondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.md,
  },
  errorTitle: {
    fontSize: FontSizes.xl,
    fontWeight: 'bold' as const,
    color: Colors.text.primary,
    textAlign: 'center',
  },
  errorDescription: {
    fontSize: FontSizes.md,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.md,
  },
  retryButtonText: {
    color: Colors.white,
    fontSize: FontSizes.md,
    fontWeight: 'bold' as const,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  webview: {
    flex: 1,
  },
  webviewLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.gray[100],
    gap: Spacing.md,
  },
  searchContainer: {
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray[100],
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Platform.OS === 'ios' ? Spacing.sm + 2 : Spacing.sm,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: FontSizes.md,
    color: Colors.text.primary,
    textAlign: 'right',
  },
  searchResults: {
    marginTop: Spacing.sm,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    ...Shadows.md,
    maxHeight: 250,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[100],
  },
  searchResultText: {
    flex: 1,
    fontSize: FontSizes.sm,
    color: Colors.text.primary,
    textAlign: 'right',
  },
  infoCard: {
    position: 'absolute',
    top: Spacing.md,
    left: Spacing.md,
    right: Spacing.md,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    ...Shadows.lg,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  infoTitle: {
    fontSize: FontSizes.md,
    fontWeight: 'bold' as const,
    color: Colors.text.primary,
  },
  infoAddress: {
    fontSize: FontSizes.md,
    color: Colors.text.primary,
    lineHeight: 20,
    marginBottom: Spacing.sm,
    textAlign: 'right',
  },
  infoCoords: {
    fontSize: FontSizes.xs,
    color: Colors.text.secondary,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  locateMeButton: {
    position: 'absolute',
    bottom: Spacing.xl + Spacing.lg,
    right: Spacing.md,
    ...Shadows.lg,
  },
  locateMeIcon: {
    backgroundColor: Colors.white,
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.gray[200],
  },
  footer: {
    padding: Spacing.md,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[200],
  },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md + 2,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.xl,
    ...Shadows.md,
  },
  confirmButtonText: {
    color: Colors.white,
    fontSize: FontSizes.md,
    fontWeight: 'bold' as const,
  },
});
