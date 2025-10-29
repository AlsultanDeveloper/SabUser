// login.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
  FlatList,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { useAuth } from '@/contexts/AuthContext';
import { useApp } from '@/contexts/AppContext';
import { Colors, Spacing, BorderRadius, FontSizes } from '@/constants/theme';
import { COUNTRIES, Country } from '@/constants/countries';

export default function LoginScreen() {
  const router = useRouter();
  const { t, language } = useApp();

  // ✅ لاحظ أن signInWithGoogle الآن من AuthContext (نسخته المعدّلة)
  const {
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signInWithApple,
    sendPhoneVerification,
  } = useAuth();

  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<Country>(COUNTRIES[0]);
  const [showCountryPicker, setShowCountryPicker] = useState(false);

  const handlePhoneAuth = async () => {
    if (!phoneNumber) {
      Alert.alert('Error', 'Please enter your phone number');
      return;
    }
    setLoading(true);
    try {
      const fullPhoneNumber = `${selectedCountry.dialCode}${phoneNumber}`;
      const result = await sendPhoneVerification(fullPhoneNumber);
      if (result.success) {
        Alert.alert('Success', 'Verification code sent to your phone');
      } else {
        Alert.alert(
          'Note',
          result.error ??
            'Phone authentication requires React Native Firebase. Please use email, Google, or Apple sign-in instead.'
        );
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    if (isSignUp && password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const result = isSignUp
        ? await signUpWithEmail(email, password)
        : await signInWithEmail(email, password);
      if (result.success) {
        console.log('Auth successful');
        router.back();
      } else {
        Alert.alert('Error', result.error ?? 'Authentication failed');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const result = await signInWithGoogle();
      if (result.success) {
        console.log('✅ Google auth successful');
        router.back();
      } else if ((result as any).cancelled) {
        console.log('ℹ️ User cancelled sign-in');
      } else {
        console.error('❌ Google sign-in failed:', result.error);
        const errorMessage = result.error ?? 'Google sign-in failed';
        Alert.alert('Error', errorMessage);
      }
    } catch (error: any) {
      console.error('❌ Google sign-in exception:', error);
      const errorMessage = error?.message || error?.toString() || 'Google sign-in failed';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    setLoading(true);
    try {
      const result = await signInWithApple();
      if (result.success) {
        console.log('Apple auth successful');
        router.back();
      } else {
        Alert.alert('Error', result.error ?? 'Apple sign-in failed');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Feather name="x" size={24} color={Colors.text.primary} />
          </TouchableOpacity>

          <LinearGradient
            colors={[Colors.primary, Colors.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.header}
          >
            <Text style={styles.headerTitle}>SAB STORE</Text>
            <Text style={styles.headerSubtitle}>
              {isSignUp ? t('auth.createAccount') : t('auth.welcomeBack')}
            </Text>
          </LinearGradient>

          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, loginMethod === 'email' && styles.tabActive]}
              onPress={() => setLoginMethod('email')}
              activeOpacity={0.7}
            >
              <Feather
                name="mail"
                size={20}
                color={loginMethod === 'email' ? Colors.primary : Colors.gray[400]}
              />
              <Text style={[styles.tabText, loginMethod === 'email' && styles.tabTextActive]}>
                {t('auth.email')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, loginMethod === 'phone' && styles.tabActive]}
              onPress={() => setLoginMethod('phone')}
              activeOpacity={0.7}
            >
              <Feather
                name="phone"
                size={20}
                color={loginMethod === 'phone' ? Colors.primary : Colors.gray[400]}
              />
              <Text style={[styles.tabText, loginMethod === 'phone' && styles.tabTextActive]}>
                {t('auth.phoneNumber')}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.formContainer}>
            {loginMethod === 'phone' ? (
              <>
                <View style={styles.phoneInputWrapper}>
                  <TouchableOpacity
                    style={styles.countrySelector}
                    onPress={() => setShowCountryPicker(true)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.countryFlag}>{selectedCountry.flag}</Text>
                    <Text style={styles.countryCode}>{selectedCountry.dialCode}</Text>
                    <Feather name="chevron-down" size={16} color={Colors.gray[400]} />
                  </TouchableOpacity>

                  <View style={styles.phoneInputContainer}>
                    <TextInput
                      style={styles.oninput}
                      placeholder="XX XXX XXX"
                      placeholderTextColor={Colors.gray[400]}
                      value={phoneNumber}
                      onChangeText={setPhoneNumber}
                      keyboardType="phone-pad"
                      autoCapitalize="none"
                    />
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={handlePhoneAuth}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={[Colors.primary, Colors.secondary]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.buttonGradient}
                  >
                    {loading ? (
                      <ActivityIndicator color={Colors.white} />
                    ) : (
                      <Text style={styles.primaryButtonText}>{t('auth.sendOTP')}</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <View style={styles.inputContainer}>
                  <Feather name="mail" size={20} color={Colors.gray[400]} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder={t('auth.email')}
                    placeholderTextColor={Colors.gray[400]}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Feather name="lock" size={20} color={Colors.gray[400]} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder={t('auth.password')}
                    placeholderTextColor={Colors.gray[400]}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <Feather name={showPassword ? 'eye-off' : 'eye'} size={20} color={Colors.gray[400]} />
                  </TouchableOpacity>
                </View>

                {isSignUp && (
                  <View style={styles.inputContainer}>
                    <Feather name="lock" size={20} color={Colors.gray[400]} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder={t('auth.confirmPassword')}
                      placeholderTextColor={Colors.gray[400]}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                    />
                  </View>
                )}

                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={handleEmailAuth}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={[Colors.primary, Colors.secondary]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.buttonGradient}
                  >
                    {loading ? (
                      <ActivityIndicator color={Colors.white} />
                    ) : (
                      <Text style={styles.primaryButtonText}>
                        {isSignUp ? t('auth.signUp') : t('auth.signIn')}
                      </Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </>
            )}

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>{t('auth.orContinueWith')}</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.socialButtons}>
              <TouchableOpacity
                style={styles.socialButtonImg}
                onPress={handleGoogleSignIn}
                disabled={loading}
                activeOpacity={0.7}
              >
                <Image
                  source={require('@/assets/images/google_signin_btn.png')}
                  style={styles.signinImg}
                  resizeMode="contain"
                />
              </TouchableOpacity>

              {Platform.OS === 'ios' && (
                <TouchableOpacity
                  style={styles.socialButtonImg}
                  onPress={handleAppleSignIn}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  <Image
                    source={require('@/assets/images/apple_signin_btn.png')}
                    style={styles.signinImg}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              )}
            </View>

            {loginMethod === 'email' && (
              <TouchableOpacity
                style={styles.switchButton}
                onPress={() => setIsSignUp(!isSignUp)}
                disabled={loading}
              >
                <Text style={styles.switchButtonText}>
                  {isSignUp ? t('auth.haveAccount') : t('auth.noAccount')}
                  <Text style={styles.switchButtonTextBold}>
                    {' '}{isSignUp ? t('auth.signIn') : t('auth.signUp')}
                  </Text>
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal
        visible={showCountryPicker}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCountryPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('auth.selectCountry')}</Text>
              <TouchableOpacity onPress={() => setShowCountryPicker(false)}>
                <Feather name="x" size={24} color={Colors.text.primary} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={COUNTRIES}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.countryItem}
                  onPress={() => {
                    setSelectedCountry(item);
                    setShowCountryPicker(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.countryItemFlag}>{item.flag}</Text>
                  <Text style={styles.countryItemName}>
                    {language === 'ar' ? item.nameAr : item.name}
                  </Text>
                  <Text style={styles.countryItemDialCode}>{item.dialCode}</Text>
                  {selectedCountry.code === item.code && (
                    <Feather name="check" size={20} color={Colors.primary} />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  socialButtonImg: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.sm,
    height: 56,
  },
  signinImg: {
    width: 220,
    height: 48,
    resizeMode: 'contain',
    maxWidth: 220,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  closeButton: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xxl * 2,
    paddingBottom: Spacing.xl,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FontSizes.xxxl + 8,
    fontWeight: 'bold' as const,
    color: Colors.white,
    marginBottom: Spacing.sm,
  },
  headerSubtitle: {
    fontSize: FontSizes.lg,
    color: Colors.white,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    backgroundColor: Colors.gray[100],
    borderRadius: BorderRadius.lg,
    padding: 4,
    gap: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    gap: 6,
  },
  tabActive: {
    backgroundColor: Colors.white,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: FontSizes.sm,
    color: Colors.gray[400],
    fontWeight: '600' as const,
  },
  tabTextActive: {
    color: Colors.primary,
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    height: 56,
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
  primaryButton: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  buttonGradient: {
    paddingVertical: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
  },
  primaryButtonText: {
    fontSize: FontSizes.lg,
    fontWeight: 'bold' as const,
    color: Colors.white,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.gray[300],
  },
  dividerText: {
    marginHorizontal: Spacing.md,
    fontSize: FontSizes.sm,
    color: Colors.text.secondary,
  },
  socialButtons: {
    flexDirection: 'column',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
    alignItems: 'center',
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.gray[200],
    gap: Spacing.sm,
  },
    appleButtonText: {
      fontSize: FontSizes.md,
      fontWeight: '600',
      color: '#FFFFFF',
    },
    phoneInputWrapper: {
      flexDirection: 'row',
      gap: Spacing.sm,
      marginBottom: Spacing.md,
    },
    countrySelector: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: Colors.white,
      borderRadius: BorderRadius.lg,
      paddingHorizontal: Spacing.md,
      borderWidth: 1,
      borderColor: Colors.gray[200],
      gap: 6,
      minWidth: 120,
    },
    countryFlag: {
      fontSize: 24,
    },
    countryCode: {
      fontSize: FontSizes.md,
      fontWeight: '600',
      color: Colors.text.primary,
    },
    phoneInputContainer: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: Colors.white,
      borderRadius: BorderRadius.lg,
      paddingHorizontal: Spacing.md,
      height: 56,
      borderWidth: 1,
      borderColor: Colors.gray[200],
    },
    oninput: {
      flex: 1,
      fontSize: FontSizes.md,
      color: Colors.text.primary,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: Colors.white,
      borderTopLeftRadius: BorderRadius.xl,
      borderTopRightRadius: BorderRadius.xl,
      maxHeight: '80%',
      paddingBottom: Spacing.xl,
    },
    modalTitle: {
      fontSize: FontSizes.xl,
      fontWeight: 'bold',
      color: Colors.text.primary,
    },
    countryItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.md,
      gap: Spacing.md,
    },
    countryItemFlag: {
      fontSize: 28,
    },
    countryItemName: {
      flex: 1,
      fontSize: FontSizes.md,
      color: Colors.text.primary,
      fontWeight: '500',
    },
    countryItemDialCode: {
      fontSize: FontSizes.md,
      color: Colors.text.secondary,
      fontWeight: '600',
    },
      switchButton: {
        alignItems: 'center',
        paddingVertical: Spacing.md,
      },
      switchButtonText: {
        fontSize: FontSizes.md,
        color: Colors.text.secondary,
      },
      switchButtonTextBold: {
        fontWeight: 'bold',
        color: Colors.primary,
      },
      modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: Spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: Colors.gray[200],
      },
  });
