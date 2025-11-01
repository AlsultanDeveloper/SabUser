// 🛍️ Checkout Details - Address & Payment
// Modern checkout flow inspired by Amazon & SHEIN

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '@/contexts/AppContext';
import { useSettings } from '@/hooks/useSettings';
import * as Location from 'expo-location';

export default function CheckoutDetailsScreen() {
  const router = useRouter();
  const { cart, cartTotal, formatPrice } = useApp();
  const { shippingCost, freeShippingThreshold } = useSettings();

  // Shipping Address State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  // Payment Method State
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash');

  // Calculate totals
  const remainingForFreeShipping = Math.max(freeShippingThreshold - cartTotal, 0);
  const finalShippingCost = remainingForFreeShipping > 0 ? shippingCost : 0;
  const finalTotal = cartTotal + finalShippingCost;

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

  // Open Maps to Pick Location
  const handleOpenMaps = () => {
    const lat = latitude || 24.7136; // Default: Riyadh
    const lng = longitude || 46.6753;
    
    const scheme = Platform.select({
      ios: 'maps:',
      android: 'geo:',
    });
    
    const url = Platform.select({
      ios: `${scheme}?q=${lat},${lng}`,
      android: `${scheme}${lat},${lng}?q=${lat},${lng}`,
    });

    if (url) {
      Linking.openURL(url).catch(() => {
        Alert.alert('Error', 'Could not open maps application');
      });
    }
  };

  // Validate and Place Order
  const handlePlaceOrder = () => {
    // Validation
    if (!fullName || !phone || !address || !city) {
      Alert.alert('Missing Information', 'Please fill in all required fields');
      return;
    }

    // TODO: Send order to Firebase
    Alert.alert(
      'Order Placed! 🎉',
      `Your order of ${formatPrice(finalTotal)} has been confirmed!`,
      [
        {
          text: 'OK',
          onPress: () => router.push('/(tabs)/home' as any),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Feather name="arrow-left" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={{ width: 40 }} />
      </View>

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

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Full Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your full name"
              value={fullName}
              onChangeText={setFullName}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Phone Number *</Text>
            <TextInput
              style={styles.input}
              placeholder="+966 XX XXX XXXX"
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
              <MaterialCommunityIcons 
                name="credit-card-outline" 
                size={24} 
                color={paymentMethod === 'card' ? '#8B5CF6' : '#6B7280'} 
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
            <View style={styles.comingSoon}>
              <Feather name="info" size={16} color="#F59E0B" />
              <Text style={styles.comingSoonText}>Card payment coming soon!</Text>
            </View>
          )}
        </View>

        <View style={{ height: 100 }} />
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
    </SafeAreaView>
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
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  summaryCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  section: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginLeft: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#8B5CF6',
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1F2937',
    backgroundColor: '#FFF',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
  },
  locationButtons: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  locationButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F3E8FF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#8B5CF6',
  },
  locationButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8B5CF6',
    marginLeft: 8,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#D1FAE5',
    borderRadius: 8,
    marginBottom: 16,
  },
  locationInfoText: {
    fontSize: 12,
    color: '#059669',
    marginLeft: 8,
    fontWeight: '500',
  },
  paymentOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    marginBottom: 12,
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
  paymentText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
    marginLeft: 12,
  },
  paymentTextActive: {
    color: '#8B5CF6',
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: {
    borderColor: '#8B5CF6',
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
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
    padding: 16,
  },
  bottomLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  bottomTotal: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  placeOrderButton: {
    flex: 1,
    marginLeft: 16,
  },
  placeOrderGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  placeOrderText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
    marginRight: 8,
  },
});
