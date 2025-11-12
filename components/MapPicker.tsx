// 🗺️ Map Picker Component - Using WebView (no native build needed!)
// Allows users to pick delivery location using Google Maps

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { Colors } from '@/constants/theme';
import { useApp } from '@/contexts/AppContext';

interface MapPickerProps {
  visible: boolean;
  onClose: () => void;
  onLocationSelected: (location: {
    latitude: number;
    longitude: number;
    address?: string;
  }) => void;
  initialLocation?: {
    latitude: number;
    longitude: number;
  };
}

export default function MapPicker({
  visible,
  onClose,
  onLocationSelected,
  initialLocation,
}: MapPickerProps) {
  const { language } = useApp();
  const isRTL = language === 'ar';
  
  const [selectedLocation, setSelectedLocation] = useState<{latitude: number; longitude: number} | null>(initialLocation || null);
  const [loading, setLoading] = useState(true);
  const [locationReady, setLocationReady] = useState(false);
  const webViewRef = useRef<WebView>(null);

  // Get current location immediately when modal opens
  React.useEffect(() => {
    if (visible) {
      setLoading(true);
      setLocationReady(false);
      
      if (initialLocation) {
        // If we have initial location, use it
        setSelectedLocation(initialLocation);
        setLocationReady(true);
        setLoading(false);
      } else {
        // Get current location
        getCurrentLocation();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  // Get current location
  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        const newLocation = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };

        setSelectedLocation(newLocation);
        setLocationReady(true);
        
        // Update WebView map if already loaded
        if (webViewRef.current) {
          webViewRef.current.injectJavaScript(`
            if (typeof map !== 'undefined') {
              map.setCenter({ lat: ${newLocation.latitude}, lng: ${newLocation.longitude} });
            }
            true;
          `);
        }
      } else {
        // Permission denied, show alert
        Alert.alert(
          'Location Permission Required',
          'Please enable location permissions to use this feature',
          [{ text: 'OK', onPress: onClose }]
        );
      }
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert(
        'Error',
        'Could not get your current location. Please try again.',
        [{ text: 'OK', onPress: onClose }]
      );
    } finally {
      setLoading(false);
    }
  };

  // Get Google Maps API Key from environment
  const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

  // HTML content with Google Maps
  const getMapHTML = () => {
    if (!selectedLocation || !locationReady) {
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              background: #F9FAFB;
            }
            .loader {
              text-align: center;
            }
            .spinner {
              border: 4px solid #E5E7EB;
              border-top: 4px solid #8B5CF6;
              border-radius: 50%;
              width: 40px;
              height: 40px;
              animation: spin 1s linear infinite;
              margin: 0 auto 16px;
            }
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            .text {
              color: #6B7280;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="loader">
            <div class="spinner"></div>
            <div class="text">Getting your location...</div>
          </div>
        </body>
        </html>
      `;
    }

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          overflow: hidden;
        }
        #map { 
          width: 100vw; 
          height: 100vh; 
        }
        .search-container {
          position: absolute;
          top: 16px;
          left: 50%;
          transform: translateX(-50%);
          width: 90%;
          max-width: 400px;
          z-index: 1000;
        }
        #search-input {
          width: 100%;
          padding: 14px 20px;
          border: none;
          border-radius: 12px;
          background: white;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          font-size: 16px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          outline: none;
          color: #1F2937;
        }
        #search-input::placeholder {
          color: #9CA3AF;
        }
        .info-box {
          position: absolute;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          background: white;
          padding: 14px 24px;
          border-radius: 24px;
          box-shadow: 0 6px 20px rgba(0,0,0,0.15);
          font-size: 14px;
          font-weight: 600;
          color: #1F2937;
          z-index: 1000;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .info-icon {
          width: 20px;
          height: 20px;
          background: #8B5CF6;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <div class="search-container">
        <input id="search-input" type="text" placeholder="${isRTL ? 'وين وين وين' : 'Search for location...'}" />
      </div>
      <div id="map"></div>
      <div class="info-box">
        <div class="info-icon">📍</div>
        <span id="coords">Loading...</span>
      </div>
      
      <script>
        let map;
        let marker;
        let searchBox;
        let currentLat = ${selectedLocation.latitude};
        let currentLng = ${selectedLocation.longitude};

        function initMap() {
          // Check if Google Maps loaded
          if (typeof google === 'undefined' || typeof google.maps === 'undefined') {
            document.body.innerHTML = '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;padding:20px;text-align:center;font-family:sans-serif;"><div style="font-size:48px;margin-bottom:20px;">⚠️</div><div style="font-size:18px;color:#EF4444;font-weight:600;margin-bottom:10px;">Google Maps API Error</div><div style="font-size:14px;color:#6B7280;">Failed to load Google Maps.<br>Please check your API key and billing settings.</div></div>';
            return;
          }

          // Check if map element exists
          const mapElement = document.getElementById('map');
          if (!mapElement) {
            console.error('Map element not found');
            return;
          }

          try {
            // Initialize Google Map
            map = new google.maps.Map(mapElement, {
            center: { lat: currentLat, lng: currentLng },
            zoom: 17,
            mapTypeControl: true,
            mapTypeControlOptions: {
              position: google.maps.ControlPosition.TOP_RIGHT,
              mapTypeIds: ['roadmap', 'satellite', 'hybrid']
            },
            streetViewControl: false,
            fullscreenControl: false,
            zoomControl: true,
            zoomControlOptions: {
              position: google.maps.ControlPosition.RIGHT_CENTER
            },
            gestureHandling: 'greedy',
            styles: [
              // Subtle styling to match Google Maps look
              {
                featureType: 'poi',
                elementType: 'labels.text',
                stylers: [{ visibility: 'on' }]
              },
              {
                featureType: 'poi.business',
                stylers: [{ visibility: 'on' }]
              },
              {
                featureType: 'road',
                elementType: 'labels',
                stylers: [{ visibility: 'on' }]
              },
              {
                featureType: 'transit',
                elementType: 'labels.icon',
                stylers: [{ visibility: 'on' }]
              }
            ]
          });

          // Add default Google Maps marker at center
          marker = new google.maps.Marker({
            position: { lat: currentLat, lng: currentLng },
            map: map,
            draggable: false,
            title: 'Delivery Location'
          });

          // Setup search box
          const input = document.getElementById('search-input');
          searchBox = new google.maps.places.SearchBox(input);
          
          // Bias search results towards map viewport
          map.addListener('bounds_changed', function() {
            searchBox.setBounds(map.getBounds());
          });

          // Listen for place selection from search
          searchBox.addListener('places_changed', function() {
            const places = searchBox.getPlaces();
            
            if (!places || places.length === 0) {
              return;
            }

            const place = places[0];
            
            if (!place.geometry || !place.geometry.location) {
              return;
            }

            // Move map to selected place
            const location = place.geometry.location;
            map.setCenter(location);
            map.setZoom(17);
            
            // Clear search input
            input.value = '';
          });

          // Update coordinates on map move
          google.maps.event.addListener(map, 'center_changed', function() {
            const center = map.getCenter();
            const lat = center.lat();
            const lng = center.lng();
            
            // Update marker position
            marker.setPosition({ lat: lat, lng: lng });
            updateCoords(lat, lng);
          });

          // Initialize
          updateCoords(currentLat, currentLng);
          
          } catch (error) {
            console.error('Map initialization error:', error);
            document.body.innerHTML = '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;padding:20px;text-align:center;font-family:sans-serif;"><div style="font-size:48px;margin-bottom:20px;">❌</div><div style="font-size:18px;color:#EF4444;font-weight:600;margin-bottom:10px;">Map Error</div><div style="font-size:14px;color:#6B7280;">' + error.message + '</div></div>';
          }
        }

        function updateCoords(lat, lng) {
          currentLat = lat;
          currentLng = lng;
          const coordsElement = document.getElementById('coords');
          if (coordsElement) {
            coordsElement.textContent = lat.toFixed(5) + ', ' + lng.toFixed(5);
          }
          
          // Send to React Native
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              latitude: lat,
              longitude: lng
            }));
          }
        }
      </script>
      <script src="https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&callback=initMap" async defer></script>
    </body>
    </html>
  `;
  };

  // Get current location
  const handleGetCurrentLocation = async () => {
    try {
      setLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Please enable location permissions');
        setLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const newLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      setSelectedLocation(newLocation);
      
      // Update WebView map (Google Maps)
      webViewRef.current?.injectJavaScript(`
        if (typeof map !== 'undefined') {
          map.setCenter({ lat: ${newLocation.latitude}, lng: ${newLocation.longitude} });
          map.setZoom(18);
        }
        true;
      `);

      setLoading(false);
      Alert.alert('Success', 'Location detected!');
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Could not get your current location');
      setLoading(false);
    }
  };

  // Get address from coordinates
  const getAddressFromCoordinates = async (latitude: number, longitude: number) => {
    try {
      const addresses = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (addresses.length > 0) {
        const addr = addresses[0];
        return `${addr.street || ''} ${addr.name || ''}, ${addr.city || addr.region || ''}`.trim();
      }
      return undefined;
    } catch (error) {
      console.error('Error getting address:', error);
      return undefined;
    }
  };

  // Handle location selection from WebView
  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.latitude && data.longitude) {
        setSelectedLocation({
          latitude: data.latitude,
          longitude: data.longitude,
        });
      }
    } catch (error) {
      console.error('Error parsing WebView message:', error);
    }
  };

  // Confirm location
  const handleConfirmLocation = async () => {
    if (!selectedLocation) return;
    
    setLoading(true);
    
    const address = await getAddressFromCoordinates(
      selectedLocation.latitude,
      selectedLocation.longitude
    );

    onLocationSelected({
      latitude: selectedLocation.latitude,
      longitude: selectedLocation.longitude,
      address,
    });

    setLoading(false);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Feather name="x" size={24} color="#1F2937" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>{isRTL ? 'وين بدك نوصل الطلب' : 'Pick Delivery Location'}</Text>
            <Text style={styles.headerSubtitle}>{isRTL ? 'اصبعك و حدد عالخريطة' : 'Move map to select location'}</Text>
          </View>
          <TouchableOpacity
            style={styles.currentLocationButton}
            onPress={handleGetCurrentLocation}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#8B5CF6" />
            ) : (
              <MaterialCommunityIcons name="crosshairs-gps" size={20} color="#8B5CF6" />
            )}
          </TouchableOpacity>
        </View>

        {/* Map WebView */}
        <View style={styles.mapContainer}>
          <WebView
            ref={webViewRef}
            source={{ html: getMapHTML() }}
            onMessage={handleWebViewMessage}
            onError={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              console.error('WebView error:', nativeEvent);
              Alert.alert('Error', 'Failed to load map. Please try again.');
            }}
            onHttpError={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              console.error('HTTP error:', nativeEvent);
            }}
            onLoadStart={() => console.log('WebView loading...')}
            onLoadEnd={() => console.log('WebView loaded')}
            style={styles.webView}
            javaScriptEnabled
            domStorageEnabled
            allowsInlineMediaPlayback
            mediaPlaybackRequiresUserAction={false}
          />
        </View>

        {/* Bottom Actions */}
        <View style={styles.bottomContainer}>
          <View style={styles.infoCard}>
            <MaterialCommunityIcons name="information-outline" size={20} color="#6B7280" />
            <Text style={styles.infoText}>
              {isRTL ? 'اصبعك و حدد عالخريطة' : 'Move the map to place the pin on your desired delivery location'}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.confirmButton, styles.confirmGradient]}
            onPress={handleConfirmLocation}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <>
                <Feather name="check-circle" size={20} color="#FFF" />
                <Text style={styles.confirmText}>{isRTL ? 'خلص هيدا العنوان' : 'Confirm Location'}</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  currentLocationButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  webView: {
    flex: 1,
  },
  bottomContainer: {
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 8,
    lineHeight: 16,
  },
  confirmButton: {
    width: '100%',
  },
  confirmGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: '#3B82F6',
  },
  confirmText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFF',
    marginLeft: 8,
  },
});
