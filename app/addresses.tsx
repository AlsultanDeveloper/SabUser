// addresses.tsx - dummy content
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import MapPicker from '@/components/MapPicker';
import { useApp } from '@/contexts/AppContext';
import { Colors, Spacing, BorderRadius, FontSizes } from '@/constants/theme';

import type { SavedAddress } from '@/types';
import { getUserAddresses, createDocument, updateDocument, deleteDocument, collections } from '@/constants/firestore';
import { useAuth } from '@/contexts/AuthContext';

interface AddressFormData {
  label: string;
  fullName: string;
  phoneNumber: string;
  address: string;
  city: string;
  postalCode: string;
  latitude?: number;
  longitude?: number;
}

export default function AddressesScreen() {
  const { t } = useApp();
  const { user } = useAuth();
  const router = useRouter();
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [editingAddress, setEditingAddress] = useState<SavedAddress | null>(null);
  const [formData, setFormData] = useState<AddressFormData>({
    label: '',
    fullName: '',
    phoneNumber: '',
    address: '',
    city: '',
    postalCode: '',
  });

  const loadAddresses = useCallback(async () => {
    if (!user?.uid) return;

    try {
      setLoadingAddresses(true);
      const fetchedAddresses = await getUserAddresses(user.uid);
      setAddresses(fetchedAddresses as SavedAddress[]);
    } catch (error) {
      console.error('Error loading addresses:', error);
    } finally {
      setLoadingAddresses(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    loadAddresses();
  }, [loadAddresses]);

  const handleAddAddress = () => {
    setShowMapPicker(true);
  };

  const handleLocationSelected = async (location: {
    latitude: number;
    longitude: number;
    address?: string;
  }) => {
    setShowMapPicker(false);
    setFormData(prev => ({
      ...prev,
      latitude: location.latitude,
      longitude: location.longitude,
      address: location.address || prev.address,
    }));
    setModalVisible(true);
  };

  const handleEditAddress = (address: SavedAddress) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setEditingAddress(address);
    setFormData({
      label: address.label || '',
      fullName: address.fullName,
      phoneNumber: address.phoneNumber,
      address: address.address,
      city: address.city,
      postalCode: address.postalCode || '',
      latitude: address.latitude,
      longitude: address.longitude,
    });
    setModalVisible(true);
  };

  const handleDeleteAddress = (id: string) => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
    Alert.alert(
      'Delete Address',
      'Are you sure you want to delete this address?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDocument(collections.addresses, id);
              await loadAddresses();
            } catch (error) {
              console.error('Error deleting address:', error);
              Alert.alert('Error', 'Failed to delete address');
            }
          },
        },
      ]
    );
  };

  const handleSaveAddress = async () => {
    if (!user?.uid) {
      Alert.alert('Error', 'Please sign in to save address');
      return;
    }

    if (!formData.fullName || !formData.phoneNumber || !formData.address || !formData.city) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    try {
      const addressData = {
        userId: user.uid,
        label: formData.label || undefined,
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        address: formData.address,
        city: formData.city,
        postalCode: formData.postalCode,
        country: 'Saudi Arabia',
        latitude: formData.latitude,
        longitude: formData.longitude,
        isDefault: addresses.length === 0,
      };

      if (editingAddress) {
        await updateDocument(collections.addresses, editingAddress.id, addressData);
      } else {
        await createDocument(collections.addresses, addressData);
      }

      await loadAddresses();
      setModalVisible(false);
    } catch (error) {
      console.error('Error saving address:', error);
      Alert.alert('Error', 'Failed to save address');
    }
  };

  const handleSetDefault = async (id: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    try {
      await Promise.all(
        addresses.map(async (addr) => {
          await updateDocument(collections.addresses, addr.id, {
            isDefault: addr.id === id,
          });
        })
      );
      await loadAddresses();
    } catch (error) {
      console.error('Error setting default address:', error);
      Alert.alert('Error', 'Failed to set default address');
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Gradient Header */}
      <LinearGradient
        colors={[Colors.gradient.start, Colors.gradient.middle, Colors.gradient.end]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientHeader}
      >
        <SafeAreaView edges={['top']}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
              activeOpacity={0.7}
            >
              <Feather name="arrow-left" size={24} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{t('account.addresses')}</Text>
            <View style={styles.placeholder} />
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {loadingAddresses ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>Loading addresses...</Text>
          </View>
        ) : addresses.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Feather name="map-pin" size={80} color={Colors.gray[300]} />
            <Text style={styles.emptyTitle}>No Addresses</Text>
            <Text style={styles.emptyDescription}>
              Add your delivery addresses to make checkout faster
            </Text>
          </View>
        ) : (
          addresses.map((address) => (
            <View key={address.id} style={styles.addressCard}>
              <View style={styles.addressCardHeader}>
                <View style={styles.addressLabelContainer}>
                  <View style={styles.addressIconWrapper}>
                    <Feather 
                      name={address.label === 'Home' ? 'home' : address.label === 'Work' ? 'briefcase' : 'map-pin'} 
                      size={20} 
                      color={Colors.primary} 
                    />
                  </View>
                  <View style={styles.addressLabelTextContainer}>
                    {address.label && (
                      <Text style={styles.addressLabel}>{address.label}</Text>
                    )}
                    {address.isDefault && (
                      <View style={styles.defaultBadge}>
                        <Text style={styles.defaultBadgeText}>Default</Text>
                      </View>
                    )}
                  </View>
                </View>
                <View style={styles.addressActions}>
                  <TouchableOpacity
                    onPress={() => handleEditAddress(address)}
                    style={styles.actionButton}
                    activeOpacity={0.7}
                  >
                    <Feather name="edit-2" size={18} color={Colors.primary} />
                    <Text style={styles.actionButtonText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDeleteAddress(address.id)}
                    style={styles.actionButton}
                    activeOpacity={0.7}
                  >
                    <Feather name="trash-2" size={18} color={Colors.error} />
                    <Text style={[styles.actionButtonText, { color: Colors.error }]}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              <View style={styles.addressDetailsContainer}>
                <View style={styles.addressRow}>
                  <Text style={styles.addressRowLabel}>Name</Text>
                  <Text style={styles.addressRowValue}>{address.fullName}</Text>
                </View>
                
                <View style={styles.addressRow}>
                  <Text style={styles.addressRowLabel}>Address</Text>
                  <Text style={styles.addressRowValue} numberOfLines={2}>{address.address}</Text>
                </View>
                
                <View style={styles.addressRow}>
                  <Text style={styles.addressRowLabel}>Mobile Number</Text>
                  <View style={styles.phoneContainer}>
                    <Text style={styles.addressRowValue}>{address.phoneNumber}</Text>
                    <View style={styles.verifiedBadge}>
                      <Text style={styles.verifiedText}>Verified</Text>
                    </View>
                  </View>
                </View>
              </View>
              
              {!address.isDefault && (
                <TouchableOpacity
                  onPress={() => handleSetDefault(address.id)}
                  style={styles.setDefaultButton}
                  activeOpacity={0.7}
                >
                  <Text style={styles.setDefaultButtonText}>Set as Default</Text>
                </TouchableOpacity>
              )}
            </View>
          ))
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddAddress}
          activeOpacity={0.8}
        >
          <Feather name="plus" size={20} color={Colors.white} />
          <Text style={styles.addButtonText}>Add New Address</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingAddress ? 'Edit Address' : 'Add New Address'}
              </Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                activeOpacity={0.7}
              >
                <Feather name="x" size={24} color={Colors.text.primary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Label (Optional)</Text>
                <View style={styles.labelButtonsRow}>
                  {['Home', 'Work', 'Other'].map((label) => (
                    <TouchableOpacity
                      key={label}
                      style={[
                        styles.modalLabelButton,
                        formData.label === label && styles.modalLabelButtonActive,
                      ]}
                      onPress={() => setFormData((prev) => ({ ...prev, label }))}
                      activeOpacity={0.7}
                    >
                      <Feather 
                        name={label === 'Home' ? 'home' : label === 'Work' ? 'briefcase' : 'map-pin'} 
                        size={16} 
                        color={formData.label === label ? Colors.white : Colors.gray[600]} 
                      />
                      <Text style={[
                        styles.modalLabelButtonText,
                        formData.label === label && styles.modalLabelButtonTextActive,
                      ]}>
                        {label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Full Name *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.fullName}
                  onChangeText={(text) =>
                    setFormData((prev) => ({ ...prev, fullName: text }))
                  }
                  placeholder="Enter your full name"
                  placeholderTextColor={Colors.gray[400]}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Phone Number *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.phoneNumber}
                  onChangeText={(text) =>
                    setFormData((prev) => ({ ...prev, phoneNumber: text }))
                  }
                  placeholder="your phone number"
                  placeholderTextColor={Colors.gray[400]}
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Address *</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={formData.address}
                  onChangeText={(text) =>
                    setFormData((prev) => ({ ...prev, address: text }))
                  }
                  placeholder="Street, building, floor"
                  placeholderTextColor={Colors.gray[400]}
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>City *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.city}
                  onChangeText={(text) =>
                    setFormData((prev) => ({ ...prev, city: text }))
                  }
                  placeholder="Enter city"
                  placeholderTextColor={Colors.gray[400]}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Postal Code</Text>
                <TextInput
                  style={styles.input}
                  value={formData.postalCode}
                  onChangeText={(text) =>
                    setFormData((prev) => ({ ...prev, postalCode: text }))
                  }
                  placeholder="Enter postal code"
                  placeholderTextColor={Colors.gray[400]}
                  keyboardType="numeric"
                />
              </View>

              {formData.latitude && formData.longitude && (
                <View style={styles.locationPreview}>
                  <Feather name="map-pin" size={16} color={Colors.success} />
                  <Text style={styles.locationPreviewText}>
                    Location: {formData.latitude.toFixed(4)}, {formData.longitude.toFixed(4)}
                  </Text>
                </View>
              )}

              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveAddress}
                activeOpacity={0.8}
              >
                <Text style={styles.saveButtonText}>
                  {editingAddress ? 'Update Address' : 'Add Address'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Map Picker */}
      {showMapPicker && (
        <MapPicker
          visible={showMapPicker}
          onClose={() => setShowMapPicker(false)}
          onLocationSelected={handleLocationSelected}
          initialLocation={
            formData.latitude && formData.longitude
              ? {
                  latitude: formData.latitude,
                  longitude: formData.longitude,
                }
              : undefined
          }
        />
      )}
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
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl * 2,
  },
  emptyTitle: {
    fontSize: FontSizes.xl,
    fontWeight: 'bold' as const,
    color: Colors.text.primary,
    marginTop: Spacing.lg,
  },
  emptyDescription: {
    fontSize: FontSizes.md,
    color: Colors.text.secondary,
    marginTop: Spacing.sm,
    textAlign: 'center',
    paddingHorizontal: Spacing.xl,
  },
  addressCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  addressCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[100],
  },
  addressLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  addressIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addressLabelTextContainer: {
    flex: 1,
  },
  addressLabel: {
    fontSize: FontSizes.lg,
    fontWeight: 'bold' as const,
    color: Colors.text.primary,
    marginBottom: 2,
  },
  defaultBadge: {
    backgroundColor: Colors.success,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
    alignSelf: 'flex-start',
  },
  defaultBadgeText: {
    color: Colors.white,
    fontSize: FontSizes.xs,
    fontWeight: 'bold' as const,
  },
  addressActions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionButtonText: {
    fontSize: FontSizes.sm,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  addressDetailsContainer: {
    gap: Spacing.md,
  },
  addressRow: {
    flexDirection: 'column',
    gap: 4,
  },
  addressRowLabel: {
    fontSize: FontSizes.xs,
    color: Colors.text.secondary,
    fontWeight: '600' as const,
    textTransform: 'uppercase',
  },
  addressRowValue: {
    fontSize: FontSizes.md,
    color: Colors.text.primary,
    lineHeight: 20,
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  verifiedBadge: {
    backgroundColor: Colors.success + '20',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  verifiedText: {
    fontSize: FontSizes.xs,
    color: Colors.success,
    fontWeight: 'bold' as const,
  },
  setDefaultButton: {
    marginTop: Spacing.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.primary,
    alignSelf: 'flex-start',
  },
  setDefaultButtonText: {
    color: Colors.primary,
    fontSize: FontSizes.sm,
    fontWeight: '600' as const,
  },
  footer: {
    padding: 16,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[200],
  },
  addButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    gap: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  addButtonText: {
    color: Colors.white,
    fontSize: FontSizes.md,
    fontWeight: 'bold' as const,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    paddingTop: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  modalTitle: {
    fontSize: FontSizes.xl,
    fontWeight: 'bold' as const,
    color: Colors.text.primary,
  },
  formGroup: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: FontSizes.md,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.gray[300],
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: FontSizes.md,
    color: Colors.text.primary,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  saveButtonText: {
    color: Colors.white,
    fontSize: FontSizes.md,
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
  locationPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.md,
    padding: Spacing.sm,
    backgroundColor: Colors.success + '10',
    borderRadius: BorderRadius.md,
  },
  locationPreviewText: {
    fontSize: FontSizes.sm,
    color: Colors.success,
    fontWeight: '600' as const,
  },
  labelButtonsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  modalLabelButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.gray[300],
    backgroundColor: Colors.white,
  },
  modalLabelButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  modalLabelButtonText: {
    fontSize: FontSizes.sm,
    fontWeight: '600' as const,
    color: Colors.gray[600],
  },
  modalLabelButtonTextActive: {
    color: Colors.white,
  },
});
