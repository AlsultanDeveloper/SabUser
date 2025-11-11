// 🛍️ SAB Market Checkout Details - Address & Payment
// Modern checkout flow for SAB Market

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
import { useRouter, Stack } from 'expo-router';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useMarket } from '@/contexts/MarketContext';
import { useAuth } from '@/contexts/AuthContext';
import { Colors } from '@/constants/theme';
import * as Location from 'expo-location';
import MapPicker from '@/components/MapPicker';
import { useOrders } from '@/contexts/OrderContext';
import type { OrderItem, SavedAddress } from '@/types';
import { getUserAddresses } from '@/constants/firestore';

export default function MarketCheckoutDetailsScreen() {
  const router = useRouter();
  const { marketCart, marketCartTotal, clearMarketCart, language } = useMarket();
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

  // Fixed shipping cost for SAB Market (30 minutes delivery)
  const finalShippingCost = 5; // $5 flat rate for 30 min delivery
  const safeCartTotal = typeof marketCartTotal === 'number' && !isNaN(marketCartTotal) ? marketCartTotal : 0;
  const finalTotal = safeCartTotal + finalShippingCost;

  // Format price - ensure valid number
  const formatPrice = (price: number) => {
    const validPrice = typeof price === 'number' && !isNaN(price) ? price : 0;
    return `$${validPrice.toFixed(2)}`;
  };

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
      // Prepare order items from market cart
      const orderItems: OrderItem[] = marketCart.map((item) => {
        const productName = typeof item.name === 'string' 
          ? item.name 
          : item.name?.[language as 'en' | 'ar'] || item.name?.en || 'Product';

        // Create clean product object without undefined values
        const cleanProduct: any = {
          id: item.id,
          name: item.name,
          price: item.price,
          image: item.image || '',
          images: item.image ? [item.image] : [],
          description: productName,
          category: 'SAB Market',
          brand: 'SAB Market',
          rating: 0,
          reviews: 0,
          inStock: true,
        };

        // Add optional fields only if they exist
        if (item.weight) cleanProduct.weight = item.weight;
        if (item.discount != null) cleanProduct.discount = item.discount;

        return {
          product: cleanProduct,
          quantity: item.quantity,
          price: item.discount
            ? item.price * (1 - item.discount / 100)
            : item.price,
        };
      });

      // Prepare address with coordinates
      const orderAddress = {
        fullName,
        phoneNumber: phone,
        address,
        city,
        postalCode: postalCode || '',
        country: 'Lebanon',
        ...(latitude && longitude && {
          latitude,
          longitude,
        }),
      };

      // Create order in Firebase with SAB Market flag
      const order = await createOrder(
        user.uid,
        orderItems,
        finalTotal,
        orderAddress,
        paymentMethod,
        true // ✅ isSabMarket = true for 30 minutes delivery
      );

      console.log('✅ SAB Market Order created successfully:', order.orderNumber);

      // Clear market cart
      clearMarketCart();

      // Show success message
      Alert.alert(
        'Order Placed! 🎉',
        `Your SAB Market order ${order.orderNumber} has been confirmed!\n\nDelivery in 30 minutes\nTotal: ${formatPrice(finalTotal)}${
          latitude && longitude
            ? '\n\n📍 Delivery location saved for tracking'
            : ''
        }`,
        [
          {
            text: 'View Order',
            onPress: () => {
              // First go to orders page, then push to order details
              router.replace('/orders' as any);
              setTimeout(() => {
                router.push(`/order/${order.id}` as any);
              }, 100);
            },
          },
          {
            text: 'Continue Shopping',
            onPress: () => {
              router.push('/market' as any);
            },
          },
        ],
        { cancelable: false }
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
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Gradient Header - Orange/Red */}
      <LinearGradient
        colors={['#FF6B35', '#FF8C42', '#FFA95F']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientHeader}
      >
        <SafeAreaView edges={['top']}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Feather name="arrow-left" size={24} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              {language === 'ar' ? 'إتمام الطلب' : 'Checkout'}
            </Text>
            <TouchableOpacity 
              style={styles.backToStoreButtonHeader}
              onPress={() => router.push('/' as any)}
            >
              <Text style={styles.backToStoreTextHeader}>Store</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Order Summary Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.sectionTitle}>
            {language === 'ar' ? 'ملخص الطلب' : 'Order Summary'}
          </Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              {marketCart.length} {language === 'ar' ? 'منتجات' : 'items'}
            </Text>
            <Text style={styles.summaryValue}>{formatPrice(safeCartTotal)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              {language === 'ar' ? 'الشحن (30 دقيقة)' : 'Shipping (30 min)'}
            </Text>
            <Text style={styles.summaryValue}>{formatPrice(finalShippingCost)}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>
              {language === 'ar' ? 'المجموع' : 'Total'}
            </Text>
            <Text style={styles.totalValue}>{formatPrice(finalTotal)}</Text>
          </View>
        </View>

        {/* Shipping Address Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="truck-delivery" size={24} color="#FF6B35" />
            <Text style={styles.sectionTitle}>
              {language === 'ar' ? 'عنوان التوصيل' : 'Shipping Address'}
            </Text>
          </View>

          {/* Saved Addresses Toggle */}
          {savedAddresses.length > 0 && (
            <TouchableOpacity
              style={styles.savedAddressToggle}
              onPress={() => setShowSavedAddresses(!showSavedAddresses)}
            >
              <View style={styles.savedAddressToggleLeft}>
                <MaterialCommunityIcons name="bookmark-multiple" size={22} color="#FF6B35" />
                <Text style={styles.savedAddressToggleText}>
                  {showSavedAddresses 
                    ? (language === 'ar' ? 'إخفاء' : 'Hide')
                    : (language === 'ar' ? 'استخدام' : 'Use')
                  } {language === 'ar' ? 'العناوين المحفوظة' : 'Saved Addresses'} ({savedAddresses.length})
                </Text>
              </View>
              <Feather name={showSavedAddresses ? 'chevron-up' : 'chevron-down'} size={20} color="#6B7280" />
            </TouchableOpacity>
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
                      color={selectedSavedAddress?.id === savedAddr.id ? '#FF6B35' : '#6B7280'}
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
                      <Feather name="check-circle" size={24} color="#FF6B35" />
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
                <Text style={styles.label}>
                  {language === 'ar' ? 'الاسم الكامل *' : 'Full Name *'}
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder={language === 'ar' ? 'أدخل اسمك' : 'Enter your name'}
                  value={fullName}
                  onChangeText={setFullName}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>
                  {language === 'ar' ? 'رقم الهاتف *' : 'Phone Number *'}
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder={language === 'ar' ? 'أدخل رقم الهاتف' : 'Enter phone number'}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>
                  {language === 'ar' ? 'العنوان *' : 'Address *'}
                </Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder={language === 'ar' ? 'الشارع، المبنى، الشقة' : 'Street, building, apartment'}
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
              <MaterialCommunityIcons name="crosshairs-gps" size={20} color="#FF6B35" />
              <Text style={styles.locationButtonText}>
                {language === 'ar' ? 'الموقع الحالي' : 'Current Location'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.locationButton}
              onPress={handleOpenMaps}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="map-marker" size={20} color="#FF6B35" />
              <Text style={styles.locationButtonText}>
                {language === 'ar' ? 'اختر من الخريطة' : 'Pick on Map'}
              </Text>
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
              <Text style={styles.label}>
                {language === 'ar' ? 'المدينة *' : 'City *'}
              </Text>
              <TextInput
                style={styles.input}
                placeholder={language === 'ar' ? 'المدينة' : 'City'}
                value={city}
                onChangeText={setCity}
              />
            </View>

            <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.label}>
                {language === 'ar' ? 'الرمز البريدي' : 'Postal Code'}
              </Text>
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
            <MaterialCommunityIcons name="credit-card" size={24} color="#FF6B35" />
            <Text style={styles.sectionTitle}>
              {language === 'ar' ? 'طريقة الدفع' : 'Payment Method'}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.paymentOption, paymentMethod === 'cash' && styles.paymentOptionActive]}
            onPress={() => setPaymentMethod('cash')}
          >
            <View style={styles.paymentLeft}>
              <MaterialCommunityIcons 
                name="cash" 
                size={24} 
                color={paymentMethod === 'cash' ? '#FF6B35' : '#6B7280'} 
              />
              <Text style={[styles.paymentText, paymentMethod === 'cash' && styles.paymentTextActive]}>
                {language === 'ar' ? 'الدفع عند الاستلام' : 'Cash on Delivery'}
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
                {language === 'ar' ? 'بطاقة ائتمان/خصم' : 'Credit/Debit Card'}
              </Text>
            </View>
            <View style={[styles.radio, paymentMethod === 'card' && styles.radioActive]}>
              {paymentMethod === 'card' && <View style={styles.radioDot} />}
            </View>
          </TouchableOpacity>

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
                {language === 'ar' ? 'OMT' : 'OMT'}
              </Text>
            </View>
            <View style={[styles.radio, paymentMethod === 'omt' && styles.radioActive]}>
              {paymentMethod === 'omt' && <View style={styles.radioDot} />}
            </View>
          </TouchableOpacity>

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
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Fixed Bottom Place Order Button */}
      <View style={styles.bottomContainer}>
        <View style={styles.bottomContent}>
          <View>
            <Text style={styles.bottomLabel}>
              {language === 'ar' ? 'المبلغ الإجمالي' : 'Total Amount'}
            </Text>
            <Text style={styles.bottomTotal}>{formatPrice(finalTotal)}</Text>
          </View>
          
          <TouchableOpacity
            style={styles.placeOrderButton}
            onPress={handlePlaceOrder}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#FF6B35', '#E63946']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.placeOrderGradient}
            >
              <Text style={styles.placeOrderText}>
                {language === 'ar' ? 'إتمام الطلب' : 'Place Order'}
              </Text>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  gradientHeader: {
    paddingBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: '#FFF',
  },
  headerPlaceholder: {
    width: 40,
  },
  backToStoreButtonHeader: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    minWidth: 60,
    alignItems: 'center',
  },
  backToStoreTextHeader: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700' as const,
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
    color: '#FF6B35',
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
    backgroundColor: '#FFF5F0',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FF6B35',
  },
  locationButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF6B35',
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
    borderColor: '#FF6B35',
    backgroundColor: '#FFF5F0',
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
  paymentText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginLeft: 10,
  },
  paymentTextActive: {
    color: '#FF6B35',
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
    borderColor: '#FF6B35',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF6B35',
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
    backgroundColor: '#FFF5F0',
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FFDDC1',
  },
  savedAddressToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  savedAddressToggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF6B35',
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
    borderColor: '#FF6B35',
    backgroundColor: '#FFFAF6',
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
