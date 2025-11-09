// 🛍️ Checkout Details - Address & Payment
// Modern checkout flow inspired by Amazon & SHEIN

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import * as Location from 'expo-location';
import MapPicker from '@/components/MapPicker';
import { useOrders } from '@/contexts/OrderContext';
import type { OrderItem, SavedAddress } from '@/types';
import { getUserAddresses } from '@/constants/firestore';

export default function CheckoutDetailsScreen() {
  const router = useRouter();
  const { cart, cartTotal, formatPrice, clearCart, language } = useApp();
  const { user } = useAuth();
  const { createOrder } = useOrders();

  // Shipping Address State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  // Saved Addresses
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [loadingSavedAddresses, setLoadingSavedAddresses] = useState(false);
  const [showSavedAddresses, setShowSavedAddresses] = useState(false);
  const [selectedSavedAddress, setSelectedSavedAddress] = useState<SavedAddress | null>(null);

  // Payment Method State
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'omt' | 'whish'>('cash');
  
  // Map Picker State
  const [showMapPicker, setShowMapPicker] = useState(false);

  // Calculate shipping cost from products
  // Each product has its own shippingCost defined in admin panel
  const calculateShippingFromProducts = () => {
    if (cart.length === 0) return 0;
    
    // Get the maximum shipping cost from all products in cart
    const maxShipping = Math.max(
      ...cart.map(item => item.product.shippingCost || 0)
    );
    
    return maxShipping;
  };

  const finalShippingCost = calculateShippingFromProducts();
  const finalTotal = cartTotal + finalShippingCost;

  // Load saved addresses on mount
  useEffect(() => {
    const loadSavedAddresses = async () => {
      if (!user?.uid) return;
      
      try {
        setLoadingSavedAddresses(true);
        const addresses = await getUserAddresses(user.uid);
        setSavedAddresses(addresses as SavedAddress[]);
        
        // Auto-show saved addresses if available
        if (addresses.length > 0) {
          setShowSavedAddresses(true);
        }
      } catch (error) {
        console.error('Error loading saved addresses:', error);
      } finally {
        setLoadingSavedAddresses(false);
      }
    };

    loadSavedAddresses();
  }, [user?.uid]);

  // Get Current Location
  const handleGetCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Please enable location permissions to use this feature');
        return;
      }

      Alert.alert('Getting Location', 'Please wait...');
      
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setLatitude(location.coords.latitude);
      setLongitude(location.coords.longitude);

      // Reverse geocode to get address
      const addresses = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (addresses.length > 0) {
        const addr = addresses[0];
        setAddress(`${addr.street || ''} ${addr.name || ''}`);
        setCity(addr.city || addr.region || '');
        setPostalCode(addr.postalCode || '');
        
        Alert.alert('Success', 'Location detected successfully!');
      }
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Could not get your current location');
    }
  };

  // Select a saved address
  const handleSelectSavedAddress = (savedAddress: SavedAddress) => {
    setSelectedSavedAddress(savedAddress);
    setFullName(savedAddress.fullName);
    setPhone(savedAddress.phoneNumber);
    setAddress(savedAddress.address);
    setCity(savedAddress.city);
    setPostalCode(savedAddress.postalCode || '');
    setLatitude(savedAddress.latitude || null);
    setLongitude(savedAddress.longitude || null);
    setShowSavedAddresses(false);
    Alert.alert('✅ Address Selected', `Using "${savedAddress.label || 'Home'}" address`);
  };

  // Open Maps to Pick Location
  const handleOpenMaps = () => {
    setShowMapPicker(true);
  };

  // Handle location selected from map
  const handleLocationSelected = async (location: {
    latitude: number;
    longitude: number;
    address?: string;
  }) => {
    setLatitude(location.latitude);
    setLongitude(location.longitude);
    
    if (location.address) {
      setAddress(location.address);
    }
    
    // Try to get more detailed address info
    try {
      const addresses = await Location.reverseGeocodeAsync({
        latitude: location.latitude,
        longitude: location.longitude,
      });

      if (addresses.length > 0) {
        const addr = addresses[0];
        if (!location.address) {
          setAddress(`${addr.street || ''} ${addr.name || ''}`);
        }
        setCity(addr.city || addr.region || '');
        setPostalCode(addr.postalCode || '');
      }
    } catch (error) {
      console.error('Error getting address details:', error);
    }
  };

  // Validate and Place Order
  const handlePlaceOrder = async () => {
    // Validation
    if (!fullName || !phone || !address || !city) {
      Alert.alert('Missing Information', 'Please fill in all required fields');
      return;
    }

    // Check if user is logged in
    if (!user || !user.uid) {
      Alert.alert('Error', 'You must be logged in to place an order');
      return;
    }

    // Show loading
    Alert.alert('Processing', 'Please wait...');

    try {
      // Prepare order items - preserve selected options
      const orderItems: OrderItem[] = cart.map((item) => ({
        product: item.product,
        quantity: item.quantity,
        price: item.product.discount
          ? item.product.price * (1 - item.product.discount / 100)
          : item.product.price,
        ...((item as any).selectedSize && { selectedSize: (item as any).selectedSize }),
        ...((item as any).selectedColor && { selectedColor: (item as any).selectedColor }),
        ...((item as any).selectedAge && { selectedAge: (item as any).selectedAge }),
      } as any));

      // Prepare address with coordinates
      const orderAddress = {
        fullName,
        phoneNumber: phone,
        address,
        city,
        postalCode: postalCode || '',
        country: 'Saudi Arabia',
        ...(latitude && longitude && {
          latitude,
          longitude,
        }),
      };

      // Create order in Firebase
      const order = await createOrder(
        user.uid,
        orderItems,
        finalTotal,
        orderAddress,
        paymentMethod
      );

      console.log('✅ Order created successfully:', order.orderNumber);

      // Clear cart
      clearCart();

      // Show success message
      Alert.alert(
        'Order Placed! 🎉',
        `Your order ${order.orderNumber} has been confirmed!\n\nTotal: ${formatPrice(finalTotal)}${
          latitude && longitude
            ? '\n\n📍 Delivery location saved for accurate tracking'
            : ''
        }`,
        [
          {
            text: 'View Order',
            onPress: () => {
              // Replace navigation stack to prevent going back to cart
              router.replace(`/order/${order.id}` as any);
            },
          },
          {
            text: 'Continue Shopping',
            onPress: () => {
              // Replace navigation stack to go to home
              router.replace('/(tabs)/home' as any);
            },
          },
        ],
        { cancelable: false } // Prevent dismissing without choosing an option
      );
    } catch (error) {
      console.error('❌ Error placing order:', error);
      Alert.alert(
        'Error',
        'Failed to place your order. Please try again.',
        [
          {
            text: 'OK',
          },
        ]
      );
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Order Summary Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{cart.length} items</Text>
            <Text style={styles.summaryValue}>{formatPrice(cartTotal)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Shipping</Text>
            <Text style={[styles.summaryValue, { color: finalShippingCost === 0 ? '#10B981' : '#6B7280' }]}>
              {finalShippingCost === 0 ? 'FREE' : formatPrice(finalShippingCost)}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatPrice(finalTotal)}</Text>
          </View>
        </View>

        {/* Shipping Address Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="truck-delivery" size={24} color="#8B5CF6" />
            <Text style={styles.sectionTitle}>Shipping Address</Text>
          </View>

          {/* Saved Addresses Toggle */}
          {savedAddresses.length > 0 && (
            <TouchableOpacity
              style={styles.savedAddressToggle}
              onPress={() => setShowSavedAddresses(!showSavedAddresses)}
            >
              <View style={styles.savedAddressToggleLeft}>
                <MaterialCommunityIcons name="bookmark-multiple" size={22} color="#8B5CF6" />
                <Text style={styles.savedAddressToggleText}>
                  {showSavedAddresses ? 'Hide' : 'Use'} Saved Addresses ({savedAddresses.length})
                </Text>
              </View>
              <Feather name={showSavedAddresses ? 'chevron-up' : 'chevron-down'} size={20} color="#6B7280" />
            </TouchableOpacity>
          )}

          {/* Loading Saved Addresses */}
          {loadingSavedAddresses && (
            <View style={{ padding: 20, alignItems: 'center' }}>
              <Text style={{ color: '#6B7280', fontSize: 14 }}>Loading saved addresses...</Text>
            </View>
          )}

          {/* Saved Addresses List */}
          {showSavedAddresses && savedAddresses.length > 0 && (
            <View style={styles.savedAddressesList}>
              {savedAddresses.map((savedAddr) => (
                <TouchableOpacity
                  key={savedAddr.id}
                  style={[
                    styles.savedAddressCard,
                    selectedSavedAddress?.id === savedAddr.id && styles.savedAddressCardSelected,
                  ]}
                  onPress={() => handleSelectSavedAddress(savedAddr)}
                >
                  <View style={styles.savedAddressIcon}>
                    <MaterialCommunityIcons 
                      name={savedAddr.label === 'Home' ? 'home' : savedAddr.label === 'Work' ? 'briefcase' : 'map-marker'}
                      size={20}
                      color={selectedSavedAddress?.id === savedAddr.id ? '#8B5CF6' : '#6B7280'}
                    />
                  </View>
                  <View style={styles.savedAddressContent}>
                    <Text style={styles.savedAddressLabel}>{savedAddr.label || 'Address'}</Text>
                    <Text style={styles.savedAddressName}>{savedAddr.fullName}</Text>
                    <Text style={styles.savedAddressText} numberOfLines={2}>
                      {savedAddr.address}, {savedAddr.city}
                    </Text>
                    <Text style={styles.savedAddressPhone}>{savedAddr.phoneNumber}</Text>
                    {savedAddr.latitude && savedAddr.longitude && (
                      <View style={styles.verifiedBadge}>
                        <MaterialCommunityIcons name="map-marker-check" size={14} color="#10B981" />
                        <Text style={styles.verifiedText}>Location Verified</Text>
                      </View>
                    )}
                  </View>
                  {selectedSavedAddress?.id === savedAddr.id && (
                    <View style={styles.selectedCheckmark}>
                      <Feather name="check-circle" size={24} color="#8B5CF6" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Manual Address Input */}
          {!showSavedAddresses && (
            <>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Full Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your name"
                  value={fullName}
                  onChangeText={setFullName}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Phone Number *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter here"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Address *</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Street address, building, apartment"
                  value={address}
                  onChangeText={setAddress}
                  multiline
                  numberOfLines={3}
                />
              </View>
            </>
          )}

          {/* Location Picker Buttons */}
          <View style={styles.locationButtons}>
            <TouchableOpacity
              style={styles.locationButton}
              onPress={handleGetCurrentLocation}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="crosshairs-gps" size={20} color="#8B5CF6" />
              <Text style={styles.locationButtonText}>Use Current Location</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.locationButton}
              onPress={handleOpenMaps}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="map-marker" size={20} color="#8B5CF6" />
              <Text style={styles.locationButtonText}>Pick on Map</Text>
            </TouchableOpacity>
          </View>

          {latitude && longitude && (
            <View style={styles.locationInfo}>
              <Feather name="map-pin" size={16} color="#10B981" />
              <Text style={styles.locationInfoText}>
                Location: {latitude.toFixed(4)}, {longitude.toFixed(4)}
              </Text>
            </View>
          )}

          <View style={styles.row}>
            <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>City *</Text>
              <TextInput
                style={styles.input}
                placeholder="City"
                value={city}
                onChangeText={setCity}
              />
            </View>

            <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.label}>Postal Code</Text>
              <TextInput
                style={styles.input}
                placeholder="12345"
                value={postalCode}
                onChangeText={setPostalCode}
                keyboardType="number-pad"
              />
            </View>
          </View>
        </View>

        {/* Payment Method Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="credit-card" size={24} color="#8B5CF6" />
            <Text style={styles.sectionTitle}>Payment Method</Text>
          </View>

          <TouchableOpacity
            style={[styles.paymentOption, paymentMethod === 'cash' && styles.paymentOptionActive]}
            onPress={() => setPaymentMethod('cash')}
          >
            <View style={styles.paymentLeft}>
              <MaterialCommunityIcons 
                name="cash" 
                size={24} 
                color={paymentMethod === 'cash' ? '#8B5CF6' : '#6B7280'} 
              />
              <Text style={[styles.paymentText, paymentMethod === 'cash' && styles.paymentTextActive]}>
                Cash on Delivery
              </Text>
            </View>
            <View style={[styles.radio, paymentMethod === 'cash' && styles.radioActive]}>
              {paymentMethod === 'cash' && <View style={styles.radioDot} />}
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.paymentOption, paymentMethod === 'card' && styles.paymentOptionActive]}
            onPress={() => setPaymentMethod('card')}
          >
            <View style={styles.paymentLeft}>
              <Image
                source={require('@/assets/images/payment/card-logo.png')}
                style={styles.paymentLogoImage}
                resizeMode="contain"
              />
              <Text style={[styles.paymentText, paymentMethod === 'card' && styles.paymentTextActive]}>
                Credit/Debit Card
              </Text>
            </View>
            <View style={[styles.radio, paymentMethod === 'card' && styles.radioActive]}>
              {paymentMethod === 'card' && <View style={styles.radioDot} />}
            </View>
          </TouchableOpacity>

          {paymentMethod === 'card' && (
            <TouchableOpacity
              style={styles.cardDetailsButton}
              onPress={() => router.push('/payment/card' as any)}
              activeOpacity={0.7}
            >
              <View style={styles.cardDetailsContent}>
                <Feather name="credit-card" size={20} color="#8B5CF6" />
                <Text style={styles.cardDetailsText}>
                  {language === 'ar' ? 'إدخال بيانات البطاقة' : 'Enter Card Details'}
                </Text>
              </View>
              <Feather name="arrow-right" size={20} color="#8B5CF6" />
            </TouchableOpacity>
          )}

          {/* OMT Payment */}
          <TouchableOpacity
            style={[styles.paymentOption, paymentMethod === 'omt' && styles.paymentOptionActive]}
            onPress={() => setPaymentMethod('omt')}
          >
            <View style={styles.paymentLeft}>
              <Image
                source={require('@/assets/images/payment/omt-logo.png')}
                style={styles.paymentLogoImage}
                resizeMode="contain"
              />
              <Text style={[styles.paymentText, paymentMethod === 'omt' && styles.paymentTextActive]}>
                {language === 'ar' ? 'OMT للتحويلات المالية' : 'OMT Money Transfer'}
              </Text>
            </View>
            <View style={[styles.radio, paymentMethod === 'omt' && styles.radioActive]}>
              {paymentMethod === 'omt' && <View style={styles.radioDot} />}
            </View>
          </TouchableOpacity>

          {paymentMethod === 'omt' && (
            <TouchableOpacity
              style={[styles.cardDetailsButton, styles.omtButton]}
              onPress={() => router.push('/payment/omt' as any)}
              activeOpacity={0.7}
            >
              <View style={styles.cardDetailsContent}>
                <Feather name="smartphone" size={20} color="#FF6B00" />
                <Text style={[styles.cardDetailsText, { color: '#FF6B00' }]}>
                  {language === 'ar' ? 'الدفع عبر OMT' : 'Pay with OMT'}
                </Text>
              </View>
              <Feather name="arrow-right" size={20} color="#FF6B00" />
            </TouchableOpacity>
          )}

          {/* Whish Money Payment */}
          <TouchableOpacity
            style={[styles.paymentOption, paymentMethod === 'whish' && styles.paymentOptionActive]}
            onPress={() => setPaymentMethod('whish')}
          >
            <View style={styles.paymentLeft}>
              <Image
                source={require('@/assets/images/payment/whish-logo.png')}
                style={styles.paymentLogoImage}
                resizeMode="contain"
              />
              <Text style={[styles.paymentText, paymentMethod === 'whish' && styles.paymentTextActive]}>
                {language === 'ar' ? 'Whish Money' : 'Whish Money'}
              </Text>
            </View>
            <View style={[styles.radio, paymentMethod === 'whish' && styles.radioActive]}>
              {paymentMethod === 'whish' && <View style={styles.radioDot} />}
            </View>
          </TouchableOpacity>

          {paymentMethod === 'whish' && (
            <TouchableOpacity
              style={[styles.cardDetailsButton, styles.whishButton]}
              onPress={() => router.push('/payment/whish' as any)}
              activeOpacity={0.7}
            >
              <View style={styles.cardDetailsContent}>
                <Feather name="zap" size={20} color="#6366F1" />
                <Text style={[styles.cardDetailsText, { color: '#6366F1' }]}>
                  {language === 'ar' ? 'الدفع عبر Whish Money' : 'Pay with Whish Money'}
                </Text>
              </View>
              <Feather name="arrow-right" size={20} color="#6366F1" />
            </TouchableOpacity>
          )}
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Fixed Bottom Place Order Button */}
      <View style={styles.bottomContainer}>
        <View style={styles.bottomContent}>
          <View>
            <Text style={styles.bottomLabel}>Total Amount</Text>
            <Text style={styles.bottomTotal}>{formatPrice(finalTotal)}</Text>
          </View>
          
          <TouchableOpacity
            style={styles.placeOrderButton}
            onPress={handlePlaceOrder}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#8B5CF6', '#EC4899']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.placeOrderGradient}
            >
              <Text style={styles.placeOrderText}>Place Order</Text>
              <Feather name="check-circle" size={20} color="#FFF" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>

      {/* Map Picker Modal */}
      <MapPicker
        visible={showMapPicker}
        onClose={() => setShowMapPicker(false)}
        onLocationSelected={handleLocationSelected}
        initialLocation={latitude && longitude ? { latitude, longitude } : undefined}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  summaryCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  section: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginLeft: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 13,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 8,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#8B5CF6',
  },
  inputContainer: {
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1F2937',
    backgroundColor: '#FFF',
  },
  textArea: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
  },
  locationButtons: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 10,
  },
  locationButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#F3E8FF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#8B5CF6',
  },
  locationButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8B5CF6',
    marginLeft: 6,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#D1FAE5',
    borderRadius: 8,
    marginBottom: 12,
  },
  locationInfoText: {
    fontSize: 11,
    color: '#059669',
    marginLeft: 8,
    fontWeight: '500',
  },
  paymentOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    marginBottom: 8,
    backgroundColor: '#FFF',
  },
  paymentOptionActive: {
    borderColor: '#8B5CF6',
    backgroundColor: '#F3E8FF',
  },
  paymentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentLogoImage: {
    width: 45,
    height: 45,
    marginRight: 12,
  },
  paymentIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentIconCircleActive: {
    backgroundColor: '#FF6B00',
  },
  paymentIconText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FF6B00',
  },
  paymentIconTextActive: {
    color: '#FFF',
  },
  paymentText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginLeft: 10,
  },
  paymentTextActive: {
    color: '#8B5CF6',
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: {
    borderColor: '#8B5CF6',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#8B5CF6',
  },
  comingSoon: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
  },
  comingSoonText: {
    fontSize: 13,
    color: '#92400E',
    marginLeft: 8,
    fontWeight: '500',
  },
  cardDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginTop: 8,
  },
  cardDetailsContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cardDetailsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  omtButton: {
    borderColor: '#FFD7B5',
    backgroundColor: '#FFF7ED',
  },
  whishButton: {
    borderColor: '#C7D2FE',
    backgroundColor: '#EEF2FF',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingBottom: 0,
  },
  bottomContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
  },
  bottomLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 2,
  },
  bottomTotal: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  placeOrderButton: {
    flex: 1,
    marginLeft: 12,
  },
  placeOrderGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 10,
  },
  placeOrderText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFF',
    marginRight: 8,
  },
  // Saved Addresses Styles
  savedAddressToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F3E8FF',
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E9D5FF',
  },
  savedAddressToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  savedAddressToggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7C3AED',
    marginLeft: 10,
  },
  savedAddressesList: {
    marginBottom: 16,
  },
  savedAddressCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  savedAddressCardSelected: {
    borderColor: '#8B5CF6',
    backgroundColor: '#F9F5FF',
  },
  savedAddressIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  savedAddressContent: {
    flex: 1,
  },
  savedAddressLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  savedAddressName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 4,
  },
  savedAddressText: {
    fontSize: 13,
    color: '#9CA3AF',
    marginBottom: 4,
    lineHeight: 18,
  },
  savedAddressPhone: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 6,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#059669',
    marginLeft: 4,
  },
  selectedCheckmark: {
    marginLeft: 8,
  },
});
