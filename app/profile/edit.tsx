import { Stack } from 'expo-router';
import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  // Image removed
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '@/contexts/AppContext';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { Colors, Spacing, BorderRadius, FontSizes } from '@/constants/theme';
import { getUserProfile, updateUserProfile } from '@/constants/firestore';
import { updateProfile } from 'firebase/auth';

export default function EditProfileScreen() {
  const { t } = useApp();
  const router = useRouter();
  const { user, deleteAccount } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<{
    displayName: string;
    email: string | null;
    phoneNumber: string | null;
    signInMethod: string;
  }>({
    displayName: '',
    email: null,
    phoneNumber: null,
    signInMethod: 'email',
  });

  const [errors, setErrors] = useState<{
    displayName?: string;
    email?: string;
    phoneNumber?: string;
  }>({});

  useEffect(() => {
    loadUserProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadUserProfile = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const userDoc = await getUserProfile(user.uid);
      
      const signInMethod = user.providerData[0]?.providerId === 'phone' 
        ? 'phone' 
        : user.providerData[0]?.providerId === 'google.com'
        ? 'google'
        : user.providerData[0]?.providerId === 'apple.com'
        ? 'apple'
        : 'email';

      // Check if email is Apple Private Relay
      const email = userDoc?.email || user.email || null;
      const isPrivateEmail = email?.includes('privaterelay.appleid.com');

      setProfile({
        displayName: userDoc?.displayName || user.displayName || '',
        email: isPrivateEmail ? 'Private Email 🔒' : email,
        phoneNumber: userDoc?.phoneNumber || user.phoneNumber || null,
        signInMethod,
      });
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhoneNumber = (phone: string): boolean => {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phone.replace(/[\s-]/g, ''));
  };

  const handleSave = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const newErrors: typeof errors = {};

    if (!profile.displayName.trim()) {
      newErrors.displayName = t('profile.nameRequired');
    }

    if (profile.signInMethod === 'phone' && profile.email) {
      if (!validateEmail(profile.email)) {
        newErrors.email = t('profile.invalidEmail');
      }
    }

    if (profile.signInMethod === 'email' && profile.phoneNumber) {
      if (!validatePhoneNumber(profile.phoneNumber)) {
        newErrors.phoneNumber = t('profile.invalidPhone');
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSaving(true);
    try {
      if (!user) {
        throw new Error('No user logged in');
      }

      await updateUserProfile(user.uid, {
        displayName: profile.displayName,
        fullName: profile.displayName, // Save to fullName as well
        email: profile.email,
        phoneNumber: profile.phoneNumber,
      });

      // Update Firebase Auth displayName
      await updateProfile(user, { displayName: profile.displayName });

      Alert.alert(
        t('common.success'),
        t('profile.profileUpdated'),
        [
          {
            text: t('common.ok'),
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error: any) {
      console.error('Error saving profile:', error);
      
      if (error.message?.includes('not configured')) {
        Alert.alert(
          t('common.error'),
          'Profile updates require Firebase configuration. Please check your .env file.'
        );
      } else {
        Alert.alert(t('common.error'), t('profile.updateFailed'));
      }
    } finally {
      setSaving(false);
    }
  };

  // Removed profile photo picker logic

  // Removed profile photo removal logic

  const handleDeleteAccount = () => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
    
    Alert.alert(
      t('account.deleteAccount'),
      t('account.deleteAccountConfirm'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('account.delete'),
          style: 'destructive',
          onPress: async () => {
            const result = await deleteAccount();
            if (result.success) {
              Alert.alert(
                t('account.accountDeleted'),
                t('account.accountDeletedMessage')
              );
              router.replace('/(tabs)/home' as any);
            } else {
              Alert.alert('Error', result.error || 'Failed to delete account');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Feather name="arrow-left" size={24} color={Colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('profile.editProfile')}</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const isEmailReadOnly = profile.signInMethod === 'email' || profile.signInMethod === 'google';
  const isPhoneReadOnly = profile.signInMethod === 'phone';

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Feather name="arrow-left" size={24} color={Colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('profile.editProfile')}</Text>
          <View style={styles.placeholder} />
        </View>

        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
          {/* Profile photo section removed */}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('profile.personalInfo')}</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('profile.name')}</Text>
              <TextInput
                style={[styles.input, errors.displayName && styles.inputError]}
                value={profile.displayName}
                onChangeText={(text) => {
                  setProfile({ ...profile, displayName: text });
                  if (errors.displayName) {
                    setErrors({ ...errors, displayName: undefined });
                  }
                }}
                placeholder={t('profile.enterName')}
                placeholderTextColor={Colors.text.secondary}
              />
              {errors.displayName && (
                <Text style={styles.errorText}>{errors.displayName}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>{t('profile.email')}</Text>
                {isEmailReadOnly && (
                  <View style={styles.readOnlyBadge}>
                    <Feather name="lock" size={12} color={Colors.text.secondary} />
                    <Text style={styles.readOnlyText}>{t('profile.readOnly')}</Text>
                  </View>
                )}
              </View>
              <TextInput
                style={[
                  styles.input,
                  isEmailReadOnly && styles.inputReadOnly,
                  errors.email && styles.inputError,
                ]}
                value={profile.email || ''}
                onChangeText={(text) => {
                  if (!isEmailReadOnly) {
                    setProfile({ ...profile, email: text });
                    if (errors.email) {
                      setErrors({ ...errors, email: undefined });
                    }
                  }
                }}
                placeholder={t('profile.enterEmail')}
                placeholderTextColor={Colors.text.secondary}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isEmailReadOnly}
              />
              {errors.email && (
                <Text style={styles.errorText}>{errors.email}</Text>
              )}
              {!isEmailReadOnly && !profile.email && (
                <Text style={styles.helperText}>{t('profile.emailHelper')}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>{t('profile.phone')}</Text>
                {isPhoneReadOnly && (
                  <View style={styles.readOnlyBadge}>
                    <Feather name="lock" size={12} color={Colors.text.secondary} />
                    <Text style={styles.readOnlyText}>{t('profile.readOnly')}</Text>
                  </View>
                )}
              </View>
              <TextInput
                style={[
                  styles.input,
                  isPhoneReadOnly && styles.inputReadOnly,
                  errors.phoneNumber && styles.inputError,
                ]}
                value={profile.phoneNumber || ''}
                onChangeText={(text) => {
                  if (!isPhoneReadOnly) {
                    setProfile({ ...profile, phoneNumber: text });
                    if (errors.phoneNumber) {
                      setErrors({ ...errors, phoneNumber: undefined });
                    }
                  }
                }}
                placeholder={t('profile.enterPhone')}
                placeholderTextColor={Colors.text.secondary}
                keyboardType="phone-pad"
                editable={!isPhoneReadOnly}
              />
              {errors.phoneNumber && (
                <Text style={styles.errorText}>{errors.phoneNumber}</Text>
              )}
              {!isPhoneReadOnly && !profile.phoneNumber && (
                <Text style={styles.helperText}>{t('profile.phoneHelper')}</Text>
              )}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('profile.accountInfo')}</Text>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t('profile.signInMethod')}</Text>
              <View style={styles.methodBadge}>
                <Feather 
                  name={
                    profile.signInMethod === 'google' ? 'mail' :
                    profile.signInMethod === 'apple' ? 'smartphone' :
                    profile.signInMethod === 'phone' ? 'phone' :
                    'mail'
                  } 
                  size={14} 
                  color={Colors.primary} 
                />
                <Text style={styles.methodText}>
                  {profile.signInMethod === 'google' ? 'Google' :
                   profile.signInMethod === 'apple' ? 'Apple' :
                   profile.signInMethod === 'phone' ? 'Phone' :
                   'Email'}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('account.dangerZone')}</Text>
            
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDeleteAccount}
              activeOpacity={0.7}
            >
              <View style={styles.deleteButtonContent}>
                <Feather name="trash-2" size={20} color={Colors.error} />
                <View style={styles.deleteButtonTextContainer}>
                  <Text style={styles.deleteButtonText}>{t('account.deleteAccount')}</Text>
                  <Text style={styles.deleteButtonSubtext}>{t('account.deleteAccountWarning')}</Text>
                </View>
              </View>
              <Feather name="chevron-right" size={20} color={Colors.error} />
            </TouchableOpacity>
          </View>
          </ScrollView>
        </KeyboardAvoidingView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.8}
          >
            {saving ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.saveButtonText}>{t('common.save')}</Text>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  flex: {
    flex: 1,
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
    padding: Spacing.xs,
  },
  headerTitle: {
    fontSize: FontSizes.xl,
    fontWeight: 'bold' as const,
    color: Colors.text.primary,
  },
  placeholder: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  // Profile photo styles removed
  section: {
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.lg,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSizes.md,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  label: {
    fontSize: FontSizes.sm,
    fontWeight: '600' as const,
    color: Colors.text.primary,
  },
  readOnlyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    backgroundColor: Colors.gray[100],
    borderRadius: BorderRadius.sm,
  },
  readOnlyText: {
    fontSize: FontSizes.xs,
    color: Colors.text.secondary,
  },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.gray[300],
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: FontSizes.md,
    color: Colors.text.primary,
  },
  inputReadOnly: {
    backgroundColor: Colors.gray[100],
    color: Colors.text.secondary,
  },
  inputError: {
    borderColor: Colors.error,
  },
  errorText: {
    fontSize: FontSizes.xs,
    color: Colors.error,
    marginTop: 4,
  },
  helperText: {
    fontSize: FontSizes.xs,
    color: Colors.text.secondary,
    marginTop: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
  },
  infoLabel: {
    fontSize: FontSizes.sm,
    color: Colors.text.secondary,
  },
  methodBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    backgroundColor: Colors.primary + '20',
    borderRadius: BorderRadius.md,
  },
  methodText: {
    fontSize: FontSizes.sm,
    color: Colors.primary,
    fontWeight: '600' as const,
  },
  footer: {
    padding: Spacing.md,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[200],
  },
  saveButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: FontSizes.md,
    fontWeight: 'bold' as const,
    color: Colors.white,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.error + '10',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.error + '30',
  },
  deleteButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  deleteButtonTextContainer: {
    flex: 1,
  },
  deleteButtonText: {
    fontSize: FontSizes.md,
    fontWeight: '600' as const,
    color: Colors.error,
  },
  deleteButtonSubtext: {
    fontSize: FontSizes.xs,
    color: Colors.error,
    opacity: 0.7,
    marginTop: 2,
  },
});
