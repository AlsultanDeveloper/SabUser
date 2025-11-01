// checkout.tsx - Premium Redesign
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
import SafeImage from '@/components/SafeImage';
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
  const [currentStep, setCurrentStep] = useState(1); // 1: Address, 2: Review
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
      
      {/* Premium Header with Gradient */}
      <LinearGradient
        colors={[Colors.primary, Colors.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradientHeader}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={Colors.white} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{t('checkout.title')}</Text>
          <Text style={styles.headerSubtitle}>
            {String(cart.length)} {t('cart.items')}
          </Text>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.secureBadge}>
            <Feather name="shield" size={16} color={Colors.success} />
          </View>
        </View>
      </LinearGradient>

      {/* Progress Steps */}
      <View style={styles.stepsContainer}>
        <View style={styles.stepItem}>
          <View style={[styles.stepCircle, currentStep >= 1 && styles.stepCircleActive]}>
            {currentStep > 1 ? (
              <Feather name="check" size={16} color={Colors.white} />
            ) : (
              <Text style={styles.stepNumber}>1</Text>
            )}
          </View>
          <Text style={[styles.stepLabel, currentStep >= 1 && styles.stepLabelActive]}>
            {t('checkout.address')}
          </Text>
        </View>
        
        <View style={[styles.stepLine, currentStep >= 2 && styles.stepLineActive]} />
        
        <View style={styles.stepItem}>
          <View style={[styles.stepCircle, currentStep >= 2 && styles.stepCircleActive]}>
            <Text style={styles.stepNumber}>2</Text>
          </View>
          <Text style={[styles.stepLabel, currentStep >= 2 && styles.stepLabelActive]}>
            {t('checkout.review')}
          </Text>
        </View>
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
        >
          {currentStep === 1 ? (
            // Step 1: Address Selection
            <>
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardHeaderLeft}>
                    <View style={styles.iconCircle}>
                      <Feather name="map-pin" size={20} color={Colors.primary} />
                    </View>
                    <Text style={styles.cardTitle}>{t('checkout.deliveryAddress')}</Text>
                  </View>
                  {!showAddNewAddress && savedAddresses.length > 0 && (
                    <TouchableOpacity
                      onPress={() => setShowAddNewAddress(true)}
                      style={styles.addButton}
                    >
                      <Feather name="plus" size={18} color={Colors.white} />
                    </TouchableOpacity>
                  )}
                </View>
                
                {loadingAddresses ? (
                  <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>{t('checkout.loading')}</Text>
                  </View>
                ) : showAddNewAddress ? (
                  <View style={styles.formContainer}>
                    {savedAddresses.length > 0 && (
                      <TouchableOpacity
                        onPress={() => setShowAddNewAddress(false)}
                        style={styles.backToSavedButton}
                      >
                        <Feather name="arrow-left" size={18} color={Colors.primary} />
                        <Text style={styles.backToSavedText}>{t('checkout.useSavedAddress')}</Text>
                      </TouchableOpacity>
                    )}
                    
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>{t('checkout.fullName')} *</Text>
                      <View style={styles.inputContainer}>
                        <Feather name="user" size={18} color={Colors.primary} style={styles.inputIcon} />
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
                        <Feather name="phone" size={18} color={Colors.primary} style={styles.inputIcon} />
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
                      <View style={[styles.inputContainer, styles.textAreaContainer]}>
                        <Feather name="map-pin" size={18} color={Colors.primary} style={styles.inputIcon} />
                        <TextInput
                          style={[styles.input, styles.textArea]}
                          value={newAddress.address}
                          onChangeText={(text) => setNewAddress({ ...newAddress, address: text })}
                          placeholder={t('checkout.placeholder.address')}
                          placeholderTextColor={Colors.gray[400]}
                          multiline
                          numberOfLines={3}
                        />
                      </View>
                    </View>

                    <View style={styles.row}>
                      <View style={[styles.inputGroup, styles.flex1]}>
                        <Text style={styles.label}>{t('checkout.city')} *</Text>
                        <View style={styles.inputContainer}>
                          <Feather name="home" size={18} color={Colors.primary} style={styles.inputIcon} />
                          <TextInput
                            style={styles.input}
                            value={newAddress.city}
                            onChangeText={(text) => setNewAddress({ ...newAddress, city: text })}
                            placeholder={t('checkout.placeholder.city')}
                            placeholderTextColor={Colors.gray[400]}
                          />
                        </View>
                      </View>

                      <View style={[styles.inputGroup, styles.flex1]}>
                        <Text style={styles.label}>{t('checkout.postalCode')}</Text>
                        <View style={styles.inputContainer}>
                          <Feather name="hash" size={18} color={Colors.primary} style={styles.inputIcon} />
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
                      <Feather name="map" size={20} color={Colors.white} />
                      <Text style={styles.mapButtonText}>{t('checkout.selectOnMap')}</Text>
                    </TouchableOpacity>
                  </View>
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
                        <View style={styles.addressCardHeader}>
                          <View style={styles.radioButton}>
                            {selectedAddressId === addr.id && (
                              <View style={styles.radioButtonInner} />
                            )}
                          </View>
                          {addr.isDefault && (
                            <View style={styles.defaultBadge}>
                              <Feather name="star" size={12} color={Colors.white} />
                              <Text style={styles.defaultText}>Default</Text>
                            </View>
                          )}
                        </View>
                        <View style={styles.addressContent}>
                          <Text style={styles.addressName}>{addr.fullName}</Text>
                          <View style={styles.addressRow}>
                            <Feather name="phone" size={14} color={Colors.text.secondary} />
                            <Text style={styles.addressDetail}>{addr.phoneNumber}</Text>
                          </View>
                          <View style={styles.addressRow}>
                            <Feather name="map-pin" size={14} color={Colors.text.secondary} />
                            <Text style={styles.addressDetail}>{addr.address}</Text>
                          </View>
                          <View style={styles.addressRow}>
                            <Feather name="home" size={14} color={Colors.text.secondary} />
                            <Text style={styles.addressDetail}>
                              {addr.city} {addr.postalCode}
                            </Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* Order Summary Compact */}
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardHeaderLeft}>
                    <View style={styles.iconCircle}>
                      <Feather name="shopping-bag" size={20} color={Colors.secondary} />
                    </View>
                    <Text style={styles.cardTitle}>{t('checkout.orderSummary')}</Text>
                  </View>
                  <Text style={styles.itemCount}>
                    {String(cart.length)} items
                  </Text>
                </View>

                {/* Compact Product List */}
                <View style={styles.productsCompact}>
                  {cart.slice(0, 3).map((item) => {
                    const finalPrice = item.product.discount
                      ? item.product.price * (1 - item.product.discount / 100)
                      : item.product.price;

                    return (
                      <View key={item.product.id} style={styles.productCompactRow}>
                        <SafeImage uri={item.product.image} style={styles.productThumb} />
                        <View style={styles.productCompactInfo}>
                          <Text style={styles.productCompactName} numberOfLines={1}>
                            {typeof item.product.name === 'string' 
                              ? item.product.name 
                              : (item.product.name?.[language] || item.product.name?.en || 'Product')}
                          </Text>
                          <Text style={styles.productCompactQty}>
                            Qty: {String(item.quantity)}
                          </Text>
                        </View>
                        <Text style={styles.productCompactPrice}>
                          {formatPrice(finalPrice * item.quantity)}
                        </Text>
                      </View>
                    );
                  })}
                  
                  {cart.length > 3 && (
                    <Text style={styles.moreItems}>
                      +{String(cart.length - 3)} more items
                    </Text>
                  )}
                </View>

                <View style={styles.divider} />
                
                <View style={styles.totalSection}>
                  <View style={styles.totalRow}>
                    <Text style={styles.subtotalLabel}>Subtotal</Text>
                    <Text style={styles.subtotalValue}>{formatPrice(cartTotal)}</Text>
                  </View>
                  <View style={styles.totalRow}>
                    <Text style={styles.subtotalLabel}>Delivery</Text>
                    <Text style={styles.freeText}>FREE</Text>
                  </View>
                  <View style={styles.divider} />
                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Total</Text>
                    <Text style={styles.totalAmount}>{formatPrice(cartTotal)}</Text>
                  </View>
                </View>
              </View>

              {/* Payment Method */}
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardHeaderLeft}>
                    <View style={styles.iconCircle}>
                      <Feather name="credit-card" size={20} color={Colors.success} />
                    </View>
                    <Text style={styles.cardTitle}>{t('checkout.paymentMethod')}</Text>
                  </View>
                </View>
                
                <View style={styles.paymentOption}>
                  <View style={styles.paymentLeft}>
                    <View style={styles.paymentIcon}>
                      <Feather name="dollar-sign" size={24} color={Colors.success} />
                    </View>
                    <View>
                      <Text style={styles.paymentTitle}>{t('checkout.cashOnDelivery')}</Text>
                      <Text style={styles.paymentSubtitle}>{t('checkout.payWhenReceive')}</Text>
                    </View>
                  </View>
                  <View style={styles.checkCircle}>
                    <Feather name="check" size={16} color={Colors.white} />
                  </View>
                </View>
              </View>
            </>
          ) : (
            // Step 2: Review Order
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{t('checkout.reviewOrder')}</Text>
              {/* Review content will be added here */}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Floating Footer */}
      <View style={styles.floatingFooter}>
        <View style={styles.footerContent}>
          <View style={styles.footerLeft}>
            <Text style={styles.footerLabel}>Total Amount</Text>
            <Text style={styles.footerAmount}>{formatPrice(cartTotal)}</Text>
          </View>
          
          <TouchableOpacity
            style={[styles.continueButton, loading && styles.buttonDisabled]}
            onPress={currentStep === 1 ? () => setCurrentStep(2) : handlePlaceOrder}
            disabled={loading || (currentStep === 1 && !selectedAddressId && !showAddNewAddress)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={loading ? [Colors.gray[400], Colors.gray[400]] : [Colors.primary, Colors.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.continueGradient}
            >
              {loading ? (
                <Text style={styles.continueText}>{t('checkout.processing')}</Text>
              ) : (
                <>
                  <Text style={styles.continueText}>
                    {currentStep === 1 ? 'Continue' : t('checkout.placeOrder')}
                  </Text>
                  <Feather name="arrow-right" size={20} color={Colors.white} />
                </>
              )}
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
    backgroundColor: Colors.gray[50],
  },
  
  // Premium Gradient Header
  gradientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.lg,
    paddingTop: Spacing.xl,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FontSizes.xl,
    fontWeight: 'bold' as const,
    color: Colors.white,
  },
  headerSubtitle: {
    fontSize: FontSizes.sm,
    color: Colors.white + 'CC',
    marginTop: 2,
  },
  headerRight: {
    width: 40,
    alignItems: 'center',
  },
  secureBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Progress Steps
  stepsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[100],
  },
  stepItem: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  stepCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.gray[200],
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepCircleActive: {
    backgroundColor: Colors.primary,
  },
  stepNumber: {
    fontSize: FontSizes.md,
    fontWeight: 'bold' as const,
    color: Colors.white,
  },
  stepLabel: {
    fontSize: FontSizes.xs,
    color: Colors.text.secondary,
    fontWeight: '500' as const,
  },
  stepLabelActive: {
    color: Colors.primary,
    fontWeight: '600' as const,
  },
  stepLine: {
    width: 80,
    height: 2,
    backgroundColor: Colors.gray[200],
    marginHorizontal: Spacing.md,
  },
  stepLineActive: {
    backgroundColor: Colors.primary,
  },

  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 140,
    padding: Spacing.md,
    gap: Spacing.md,
  },

  // Premium Card Design
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: FontSizes.lg,
    fontWeight: 'bold' as const,
    color: Colors.text.primary,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemCount: {
    fontSize: FontSizes.sm,
    color: Colors.text.secondary,
    fontWeight: '500' as const,
  },

  // Form Styles
  formContainer: {
    gap: Spacing.md,
  },
  inputGroup: {
    gap: Spacing.xs,
  },
  label: {
    fontSize: FontSizes.sm,
    fontWeight: '600' as const,
    color: Colors.text.primary,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray[50],
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    minHeight: 52,
    borderWidth: 1.5,
    borderColor: Colors.gray[200],
  },
  textAreaContainer: {
    alignItems: 'flex-start',
    minHeight: 90,
    paddingVertical: Spacing.sm,
  },
  inputIcon: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: FontSizes.md,
    color: Colors.text.primary,
  },
  textArea: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  flex1: {
    flex: 1,
  },
  
  backToSavedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
  },
  backToSavedText: {
    color: Colors.primary,
    fontSize: FontSizes.sm,
    fontWeight: '600' as const,
  },
  
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.primary,
    marginTop: Spacing.sm,
  },
  mapButtonText: {
    color: Colors.white,
    fontSize: FontSizes.md,
    fontWeight: '600' as const,
  },

  // Address Cards
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
    backgroundColor: Colors.gray[50],
  },
  addressCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '08',
  },
  addressCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
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
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary,
  },
  defaultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.success,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  defaultText: {
    color: Colors.white,
    fontSize: FontSizes.xs,
    fontWeight: 'bold' as const,
  },
  addressContent: {
    gap: Spacing.xs,
  },
  addressName: {
    fontSize: FontSizes.md,
    fontWeight: 'bold' as const,
    color: Colors.text.primary,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  addressDetail: {
    flex: 1,
    fontSize: FontSizes.sm,
    color: Colors.text.secondary,
    lineHeight: 18,
  },

  // Compact Product List
  productsCompact: {
    gap: Spacing.sm,
  },
  productCompactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  productThumb: {
    width: 50,
    height: 50,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.gray[100],
  },
  productCompactInfo: {
    flex: 1,
    gap: 4,
  },
  productCompactName: {
    fontSize: FontSizes.sm,
    fontWeight: '600' as const,
    color: Colors.text.primary,
  },
  productCompactQty: {
    fontSize: FontSizes.xs,
    color: Colors.text.secondary,
  },
  productCompactPrice: {
    fontSize: FontSizes.md,
    fontWeight: 'bold' as const,
    color: Colors.primary,
  },
  moreItems: {
    fontSize: FontSizes.sm,
    color: Colors.primary,
    fontWeight: '600' as const,
    textAlign: 'center',
    paddingVertical: Spacing.sm,
  },

  divider: {
    height: 1,
    backgroundColor: Colors.gray[200],
    marginVertical: Spacing.md,
  },

  // Totals Section
  totalSection: {
    gap: Spacing.sm,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subtotalLabel: {
    fontSize: FontSizes.md,
    color: Colors.text.secondary,
  },
  subtotalValue: {
    fontSize: FontSizes.md,
    fontWeight: '600' as const,
    color: Colors.text.primary,
  },
  freeText: {
    fontSize: FontSizes.md,
    fontWeight: 'bold' as const,
    color: Colors.success,
  },
  totalLabel: {
    fontSize: FontSizes.xl,
    fontWeight: 'bold' as const,
    color: Colors.text.primary,
  },
  totalAmount: {
    fontSize: FontSizes.xxl,
    fontWeight: 'bold' as const,
    color: Colors.primary,
  },

  // Payment Option
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.success + '10',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderColor: Colors.success,
  },
  paymentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  paymentIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  paymentTitle: {
    fontSize: FontSizes.md,
    fontWeight: '600' as const,
    color: Colors.text.primary,
  },
  paymentSubtitle: {
    fontSize: FontSizes.sm,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  checkCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.success,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Floating Footer
  floatingFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[200],
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  footerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  footerLeft: {
    flex: 1,
  },
  footerLabel: {
    fontSize: FontSizes.xs,
    color: Colors.text.secondary,
    marginBottom: 2,
  },
  footerAmount: {
    fontSize: FontSizes.xxl,
    fontWeight: 'bold' as const,
    color: Colors.primary,
  },
  continueButton: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    minWidth: 140,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  continueGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.xs,
  },
  continueText: {
    fontSize: FontSizes.md,
    fontWeight: 'bold' as const,
    color: Colors.white,
  },
});
