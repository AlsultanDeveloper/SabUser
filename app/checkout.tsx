// checkout.tsx - dummy content
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { useOrders } from '@/contexts/OrderContext';
import OrderSuccessModal from '@/components/OrderSuccessModal';
import type { OrderItem, SavedAddress } from '@/types';
import { Colors, Spacing, BorderRadius, FontSizes } from '@/constants/theme';
import { getUserAddresses } from '@/constants/firestore';



export default function CheckoutScreen() {
  const router = useRouter();
  const { t, cart, cartTotal, formatPrice, clearCart, language } = useApp();
  const { user, isAuthenticated } = useAuth();
  const { createOrder } = useOrders();
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showAddNewAddress, setShowAddNewAddress] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [newAddress, setNewAddress] = useState({
    fullName: '',
    phoneNumber: '',
    address: '',
    city: '',
    postalCode: '',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      Alert.alert(
        t('checkout.error'),
        t('checkout.signInRequired'),
        [
          { text: t('common.ok'), onPress: () => router.replace('/auth/login' as any) },
        ]
      );
    }
  }, [isAuthenticated, router, t]);

  const loadAddresses = useCallback(async () => {
    if (!user?.uid) return;
    
    try {
      setLoadingAddresses(true);
      const addresses = await getUserAddresses(user.uid);
      const typedAddresses = addresses as SavedAddress[];
      setSavedAddresses(typedAddresses);
      
      const defaultAddress = typedAddresses.find(addr => addr.isDefault);
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress.id);
      } else if (typedAddresses.length > 0) {
        setSelectedAddressId(typedAddresses[0].id);
      } else {
        setShowAddNewAddress(true);
      }
    } catch (error) {
      console.error('Error loading addresses:', error);
    } finally {
      setLoadingAddresses(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    if (user?.uid) {
      loadAddresses();
    }
  }, [user?.uid, loadAddresses]);

  const handlePlaceOrder = async () => {
    if (!isAuthenticated) {
      Alert.alert(
        t('checkout.error'),
        t('checkout.signInRequired'),
        [
          { text: t('common.cancel'), style: 'cancel' },
          { text: t('account.signIn'), onPress: () => router.push('/auth/login' as any) },
        ]
      );
      return;
    }

    let orderAddress;
    if (showAddNewAddress) {
      if (!newAddress.fullName || !newAddress.phoneNumber || !newAddress.address || !newAddress.city) {
        Alert.alert(t('checkout.error'), t('checkout.fillAllFields'));
        return;
      }
      orderAddress = {
        fullName: newAddress.fullName,
        phoneNumber: newAddress.phoneNumber,
        address: newAddress.address,
        city: newAddress.city,
        postalCode: newAddress.postalCode,
        country: 'Saudi Arabia',
      };
    } else {
      if (!selectedAddressId) {
        Alert.alert(t('checkout.error'), t('checkout.selectAddress'));
        return;
      }
      const selectedAddress = savedAddresses.find(addr => addr.id === selectedAddressId);
      if (!selectedAddress) {
        Alert.alert(t('checkout.error'), t('checkout.addressNotFound'));
        return;
      }
      orderAddress = {
        fullName: selectedAddress.fullName,
        phoneNumber: selectedAddress.phoneNumber,
        address: selectedAddress.address,
        city: selectedAddress.city,
        postalCode: selectedAddress.postalCode,
        country: selectedAddress.country || 'Saudi Arabia',
        latitude: selectedAddress.latitude,
        longitude: selectedAddress.longitude,
      };
    }

    setLoading(true);
    try {
      const orderItems: OrderItem[] = cart.map(item => ({
        product: item.product,
        quantity: item.quantity,
        price: item.product.discount
          ? item.product.price * (1 - item.product.discount / 100)
          : item.product.price,
      }));

      const order = await createOrder(
        user?.uid || 'guest',
        orderItems,
        cartTotal,
        orderAddress,
        'cash'
      );

      console.log('Order created:', order);

      await clearCart();

      setShowSuccessModal(true);
    } catch (error: any) {
      console.error('Error placing order:', error);
      Alert.alert(t('checkout.error'), error.message || t('checkout.orderFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    router.replace('/(tabs)/orders' as any);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <OrderSuccessModal
        visible={showSuccessModal}
        onClose={handleCloseSuccessModal}
      />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('checkout.title')}</Text>
        <View style={styles.backButton} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{t('checkout.deliveryAddress')}</Text>
              {!showAddNewAddress && savedAddresses.length > 0 && (
                <TouchableOpacity
                  onPress={() => setShowAddNewAddress(true)}
                  style={styles.addNewButton}
                >
                  <Feather name="plus" size={18} color={Colors.primary} />
                  <Text style={styles.addNewButtonText}>{t('checkout.addNew')}</Text>
                </TouchableOpacity>
              )}
            </View>
            
            {loadingAddresses ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>{t('checkout.loading')}</Text>
              </View>
            ) : showAddNewAddress ? (
              <>
                {savedAddresses.length > 0 && (
                  <TouchableOpacity
                    onPress={() => setShowAddNewAddress(false)}
                    style={styles.backToSavedButton}
                  >
                    <Feather name="arrow-left" size={18} color={Colors.primary} />
                    <Text style={styles.backToSavedButtonText}>{t('checkout.useSavedAddress')}</Text>
                  </TouchableOpacity>
                )}
                
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>{t('checkout.fullName')} *</Text>
                  <View style={styles.inputContainer}>
                    <Feather name="user" size={20} color={Colors.gray[400]} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      value={newAddress.fullName}
                      onChangeText={(text) => setNewAddress({ ...newAddress, fullName: text })}
                      placeholder={t('checkout.placeholder.fullName')}
                      placeholderTextColor={Colors.gray[400]}
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>{t('checkout.phoneNumber')} *</Text>
                  <View style={styles.inputContainer}>
                    <Feather name="phone" size={20} color={Colors.gray[400]} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      value={newAddress.phoneNumber}
                      onChangeText={(text) => setNewAddress({ ...newAddress, phoneNumber: text })}
                      placeholder={t('checkout.placeholder.phone')}
                      placeholderTextColor={Colors.gray[400]}
                      keyboardType="phone-pad"
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>{t('checkout.address')} *</Text>
                  <View style={styles.inputContainer}>
                    <Feather name="map-pin" size={20} color={Colors.gray[400]} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      value={newAddress.address}
                      onChangeText={(text) => setNewAddress({ ...newAddress, address: text })}
                      placeholder={t('checkout.placeholder.address')}
                      placeholderTextColor={Colors.gray[400]}
                      multiline
                    />
                  </View>
                </View>

                <View style={styles.row}>
                  <View style={[styles.inputGroup, styles.halfWidth]}>
                    <Text style={styles.label}>{t('checkout.city')} *</Text>
                    <View style={styles.inputContainer}>
                      <TextInput
                        style={styles.input}
                        value={newAddress.city}
                        onChangeText={(text) => setNewAddress({ ...newAddress, city: text })}
                        placeholder={t('checkout.placeholder.city')}
                        placeholderTextColor={Colors.gray[400]}
                      />
                    </View>
                  </View>

                  <View style={[styles.inputGroup, styles.halfWidth]}>
                    <Text style={styles.label}>{t('checkout.postalCode')}</Text>
                    <View style={styles.inputContainer}>
                      <TextInput
                        style={styles.input}
                        value={newAddress.postalCode}
                        onChangeText={(text) => setNewAddress({ ...newAddress, postalCode: text })}
                        placeholder={t('checkout.placeholder.postalCode')}
                        placeholderTextColor={Colors.gray[400]}
                        keyboardType="number-pad"
                      />
                    </View>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.mapButton}
                  onPress={() => router.push('/address-map-picker?mode=checkout' as any)}
                >
                  <Feather name="map" size={20} color={Colors.primary} />
                  <Text style={styles.mapButtonText}>{t('checkout.selectOnMap')}</Text>
                </TouchableOpacity>
              </>
            ) : (
              <View style={styles.addressesList}>
                {savedAddresses.map((addr) => (
                  <TouchableOpacity
                    key={addr.id}
                    style={[
                      styles.addressCard,
                      selectedAddressId === addr.id && styles.addressCardSelected,
                    ]}
                    onPress={() => setSelectedAddressId(addr.id)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.addressCardContent}>
                      <View style={styles.radioButton}>
                        {selectedAddressId === addr.id ? (
                          <View style={styles.radioButtonSelected} />
                        ) : null}
                      </View>
                      <View style={styles.addressInfo}>
                        <Text style={styles.addressName}>{addr.fullName}</Text>
                        <Text style={styles.addressPhone}>{addr.phoneNumber}</Text>
                        <Text style={styles.addressText}>{addr.address}</Text>
                        <Text style={styles.addressText}>
                          {addr.city} {addr.postalCode}
                        </Text>
                        {addr.isDefault && (
                          <View style={styles.defaultBadge}>
                            <Text style={styles.defaultBadgeText}>Default</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('checkout.paymentMethod')}</Text>
            <View style={styles.paymentMethod}>
              <View style={styles.paymentMethodLeft}>
                <View style={styles.paymentIconContainer}>
                  <Feather name="dollar-sign" size={24} color={Colors.success} />
                </View>
                <View>
                  <Text style={styles.paymentMethodTitle}>{t('checkout.cashOnDelivery')}</Text>
                  <Text style={styles.paymentMethodSubtitle}>{t('checkout.payWhenReceive')}</Text>
                </View>
              </View>
              <Feather name="check-circle" size={24} color={Colors.success} />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('checkout.orderSummary')}</Text>
            {cart.map((item) => {
              const finalPrice = item.product.discount
                ? item.product.price * (1 - item.product.discount / 100)
                : item.product.price;

              return (
                <View key={item.product.id} style={styles.orderItem}>
                  <Text style={styles.orderItemName} numberOfLines={1}>
                    {item.product.name[language]} × {item.quantity}
                  </Text>
                  <Text style={styles.orderItemPrice}>{formatPrice(finalPrice * item.quantity)}</Text>
                </View>
              );
            })}

            <View style={styles.divider} />

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>{t('cart.orderTotal')}</Text>
              <Text style={styles.totalAmount}>{formatPrice(cartTotal)}</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.placeOrderButton, loading && styles.placeOrderButtonDisabled]}
          onPress={handlePlaceOrder}
          disabled={loading}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={loading ? [Colors.gray[400], Colors.gray[400]] : [Colors.primary, Colors.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.buttonGradient}
          >
            {loading ? (
              <Text style={styles.placeOrderButtonText}>{t('checkout.processing')}</Text>
            ) : (
              <>
                <Feather name="check-circle" size={20} color={Colors.white} />
                <Text style={styles.placeOrderButtonText}>{t('checkout.placeOrder')}</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
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
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
    flexGrow: 1,
  },
  section: {
    backgroundColor: Colors.white,
    marginTop: Spacing.md,
    padding: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: 'bold' as const,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  inputGroup: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: FontSizes.sm,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray[100],
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    minHeight: 48,
    borderWidth: 1,
    borderColor: Colors.gray[200],
  },
  inputIcon: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: FontSizes.md,
    color: Colors.text.primary,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  halfWidth: {
    flex: 1,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.success + '10',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderColor: Colors.success,
  },
  paymentMethodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  paymentIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  paymentMethodTitle: {
    fontSize: FontSizes.md,
    fontWeight: '600' as const,
    color: Colors.text.primary,
  },
  paymentMethodSubtitle: {
    fontSize: FontSizes.sm,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  orderItemName: {
    flex: 1,
    fontSize: FontSizes.md,
    color: Colors.text.primary,
    marginRight: Spacing.md,
  },
  orderItemPrice: {
    fontSize: FontSizes.md,
    fontWeight: '600' as const,
    color: Colors.text.primary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.gray[200],
    marginVertical: Spacing.md,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: FontSizes.lg,
    fontWeight: 'bold' as const,
    color: Colors.text.primary,
  },
  totalAmount: {
    fontSize: FontSizes.xxl,
    fontWeight: 'bold' as const,
    color: Colors.primary,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  addNewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  addNewButtonText: {
    color: Colors.primary,
    fontSize: FontSizes.sm,
    fontWeight: '600' as const,
  },
  backToSavedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  backToSavedButtonText: {
    color: Colors.primary,
    fontSize: FontSizes.sm,
    fontWeight: '600' as const,
  },
  loadingContainer: {
    paddingVertical: Spacing.xl,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: FontSizes.md,
    color: Colors.text.secondary,
  },
  addressesList: {
    gap: Spacing.md,
  },
  addressCard: {
    borderWidth: 2,
    borderColor: Colors.gray[200],
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    backgroundColor: Colors.white,
  },
  addressCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '08',
  },
  addressCardContent: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary,
  },
  addressInfo: {
    flex: 1,
  },
  addressName: {
    fontSize: FontSizes.md,
    fontWeight: 'bold' as const,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  addressPhone: {
    fontSize: FontSizes.sm,
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
  },
  addressText: {
    fontSize: FontSizes.sm,
    color: Colors.text.secondary,
    lineHeight: 18,
  },
  defaultBadge: {
    marginTop: Spacing.xs,
    alignSelf: 'flex-start',
    backgroundColor: Colors.success,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  defaultBadgeText: {
    color: Colors.white,
    fontSize: FontSizes.xs,
    fontWeight: 'bold' as const,
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.md,
  },
  mapButtonText: {
    color: Colors.primary,
    fontSize: FontSizes.md,
    fontWeight: '600' as const,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[200],
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  placeOrderButton: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  placeOrderButtonDisabled: {
    opacity: 0.6,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  placeOrderButtonText: {
    fontSize: FontSizes.lg,
    fontWeight: 'bold' as const,
    color: Colors.white,
  },
});
