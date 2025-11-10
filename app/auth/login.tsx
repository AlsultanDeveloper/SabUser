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
  } = useAuth();

  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [signupPhoneNumber, setSignupPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<Country>(COUNTRIES[0]);
  const [showCountryPicker, setShowCountryPicker] = useState(false);

  const handlePhoneAuth = async () => {
    if (!phoneNumber) {
      Alert.alert(t('common.error'), t('auth.errors.enterPhone'));
      return;
    }
    setLoading(true);
    try {
      // Phone authentication is not implemented yet
      Alert.alert(
        t('common.error'),
        t('auth.errors.phoneAuthNote')
      );
    } catch (error: any) {
      Alert.alert(t('common.error'), error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async () => {
    if (!email || !password) {
      Alert.alert(t('common.error'), t('auth.errors.fillAllFields'));
      return;
    }

    if (isSignUp) {
      // التحقق من الحقول الإضافية عند التسجيل
      if (!firstName.trim()) {
        Alert.alert(t('common.error'), t('auth.errors.enterFirstName'));
        return;
      }
      if (!lastName.trim()) {
        Alert.alert(t('common.error'), t('auth.errors.enterLastName'));
        return;
      }
      if (password !== confirmPassword) {
        Alert.alert(t('common.error'), t('auth.errors.passwordMismatch'));
        return;
      }
    }

    setLoading(true);
    try {
      const result = isSignUp
        ? await signUpWithEmail(email, password, {
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            phoneNumber: signupPhoneNumber.trim() || undefined,
            language,
          })
        : await signInWithEmail(email, password);
      if (result.success) {
        console.log('✅ Auth successful');
        if (router.canGoBack()) {
          router.back();
        } else {
          router.replace('/(tabs)/home');
        }
      } else {
        // رسالة خطأ أوضح بناءً على نوع الخطأ
        let errorMessage = result.error ?? t('auth.errors.authFailed');
        
        if (errorMessage.includes('invalid-credential') || errorMessage.includes('wrong-password')) {
          errorMessage = language === 'ar' 
            ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة'
            : 'Incorrect email or password';
        } else if (errorMessage.includes('user-not-found')) {
          errorMessage = language === 'ar'
            ? 'لا يوجد حساب بهذا البريد الإلكتروني'
            : 'No account found with this email';
        } else if (errorMessage.includes('too-many-requests')) {
          errorMessage = language === 'ar'
            ? 'محاولات كثيرة. يرجى المحاولة لاحقاً'
            : 'Too many attempts. Please try again later';
        }
        
        Alert.alert(t('common.error'), errorMessage);
      }
    } catch (error: any) {
      let errorMessage = error.message;
      
      if (errorMessage.includes('invalid-credential')) {
        errorMessage = language === 'ar'
          ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة'
          : 'Incorrect email or password';
      }
      
      Alert.alert(t('common.error'), errorMessage);
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
        if (router.canGoBack()) {
          router.back();
        } else {
          router.replace('/(tabs)/home');
        }
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
        console.log('✅ Apple auth successful');
        if (router.canGoBack()) {
          router.back();
        } else {
          router.replace('/(tabs)/home');
        }
      } else if ((result as any).cancelled) {
        // User cancelled, don't show error
        console.log('ℹ️ User cancelled Apple sign-in');
      } else {
        // Only show error if it's not a cancellation
        const errorMessage = result.error ?? t('auth.errors.appleFailed');
        console.error('❌ Apple sign-in failed:', errorMessage);
        Alert.alert(t('common.error'), errorMessage);
      }
    } catch (error: any) {
      console.error('❌ Apple sign-in exception:', error);
      // Don't show alert for user cancellation
      if (!error.message?.includes('canceled') && !error.message?.includes('unknown reason')) {
        Alert.alert(t('common.error'), error.message);
      }
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
            onPress={() => {
              // إذا في صفحة سابقة، ارجع لها
              // إذا لا، روح للـ home
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace('/(tabs)/home');
              }
            }}
            activeOpacity={0.7}
          >
            <Feather name="x" size={24} color={Colors.text.primary} />
          </TouchableOpacity>

          <View style={styles.headerContainer}>
            <LinearGradient
              colors={[Colors.primary, Colors.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.logoGradient}
            >
              <Text style={styles.logoText}>SAB STORE</Text>
            </LinearGradient>
            
            <Text style={styles.pageTitle}>
              {isSignUp ? t('auth.createAccount') : t('auth.welcomeBack')}
            </Text>
          </View>

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

                {isSignUp && (
                  <>
                    <View style={styles.nameRow}>
                      <View style={[styles.inputContainer, styles.halfInput]}>
                        <Feather name="user" size={20} color={Colors.gray[400]} style={styles.inputIcon} />
                        <TextInput
                          style={styles.input}
                          placeholder={t('auth.placeholders.firstName')}
                          placeholderTextColor={Colors.gray[400]}
                          value={firstName}
                          onChangeText={setFirstName}
                          autoCapitalize="words"
                          autoCorrect={false}
                        />
                      </View>

                      <View style={[styles.inputContainer, styles.halfInput]}>
                        <Feather name="user" size={20} color={Colors.gray[400]} style={styles.inputIcon} />
                        <TextInput
                          style={styles.input}
                          placeholder={t('auth.placeholders.lastName')}
                          placeholderTextColor={Colors.gray[400]}
                          value={lastName}
                          onChangeText={setLastName}
                          autoCapitalize="words"
                          autoCorrect={false}
                        />
                      </View>
                    </View>

                    <View style={styles.inputContainer}>
                      <Feather name="phone" size={20} color={Colors.gray[400]} style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder={t('auth.placeholders.phoneNumber')}
                        placeholderTextColor={Colors.gray[400]}
                        value={signupPhoneNumber}
                        onChangeText={setSignupPhoneNumber}
                        keyboardType="phone-pad"
                        autoCapitalize="none"
                      />
                    </View>
                  </>
                )}

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

                {!isSignUp && (
                  <TouchableOpacity
                    style={styles.forgotPasswordButton}
                    onPress={() => router.push('/auth/forgot-password' as any)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.forgotPasswordText}>
                      {t('auth.forgotPassword')}
                    </Text>
                  </TouchableOpacity>
                )}

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

        {/* Footer Links - خارج الـ ScrollView */}
        <View style={styles.footer}>
          <View style={styles.footerLinks}>
            <TouchableOpacity
              onPress={() => router.push('/privacy-policy')}
              activeOpacity={0.7}
            >
              <Text style={styles.footerLink}>{t('account.privacyPolicy')}</Text>
            </TouchableOpacity>
            <Text style={styles.footerDivider}>•</Text>
            <TouchableOpacity
              onPress={() => router.push('/about-us')}
              activeOpacity={0.7}
            >
              <Text style={styles.footerLink}>{t('account.about')}</Text>
            </TouchableOpacity>
            <Text style={styles.footerDivider}>•</Text>
            <TouchableOpacity
              onPress={() => router.push('/terms-of-use')}
              activeOpacity={0.7}
            >
              <Text style={styles.footerLink}>{t('account.termsOfUse')}</Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity
            onPress={() => {
              // Open website in browser
              console.log('🌐 Opening website: https://www.sab-store.com');
            }}
            activeOpacity={0.7}
            style={styles.websiteLink}
          >
            <Feather name="globe" size={14} color={Colors.primary} />
            <Text style={styles.websiteText}>www.sab-store.com</Text>
          </TouchableOpacity>

          <Text style={styles.footerCopyright}>
            © 2025 SAB Store. {t('aboutUs.footer')}
          </Text>
        </View>
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
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.xs,
    height: 50,
  },
  signinImg: {
    width: '90%',
    height: 44,
    maxWidth: 280,
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
  headerContainer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  logoGradient: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  logoText: {
    fontSize: FontSizes.lg,
    fontWeight: 'bold' as const,
    color: Colors.white,
    letterSpacing: 0.5,
  },
  pageTitle: {
    fontSize: FontSizes.xxl,
    fontWeight: 'bold' as const,
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xxl * 2,
    paddingBottom: Spacing.xl,
    alignItems: 'center',
    borderBottomLeftRadius: BorderRadius.xl * 2,
    borderBottomRightRadius: BorderRadius.xl * 2,
  },
  headerTitle: {
    fontSize: FontSizes.xxxl + 12,
    fontWeight: 'bold' as const,
    color: Colors.white,
    marginBottom: 1,
    letterSpacing: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  headerSubtitle: {
    fontSize: FontSizes.lg,
    color: Colors.white,
    opacity: 0.95,
    letterSpacing: 0.5,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
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
    paddingVertical: Spacing.xs,
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
    paddingTop: Spacing.sm,
  },
  nameRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: 0,
  },
  halfInput: {
    flex: 1,
    marginBottom: Spacing.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    height: 48,
    borderWidth: 2,
    borderColor: Colors.gray[200],
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
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
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonGradient: {
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
  },
  primaryButtonText: {
    fontSize: FontSizes.lg,
    fontWeight: 'bold' as const,
    color: Colors.white,
    letterSpacing: 0.5,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.sm,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.gray[300],
  },
  dividerText: {
    marginHorizontal: Spacing.sm,
    fontSize: FontSizes.xs,
    color: Colors.text.secondary,
  },
  socialButtons: {
    flexDirection: 'column',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
    alignItems: 'center',
    width: '100%',
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
        paddingVertical: Spacing.sm,
      },
      switchButtonText: {
        fontSize: FontSizes.sm,
        color: Colors.text.secondary,
      },
      switchButtonTextBold: {
        fontWeight: 'bold',
        color: Colors.primary,
      },
      forgotPasswordButton: {
        alignSelf: 'flex-end',
        paddingVertical: Spacing.xs,
        marginBottom: Spacing.sm,
      },
      forgotPasswordText: {
        fontSize: FontSizes.sm,
        color: Colors.primary,
        fontWeight: '600' as const,
      },
      footer: {
        paddingTop: Spacing.sm,
        paddingBottom: Spacing.sm,
        paddingHorizontal: Spacing.lg,
        borderTopWidth: 1,
        borderTopColor: Colors.gray[200],
        alignItems: 'center',
        gap: Spacing.xs,
        backgroundColor: Colors.background,
      },
      footerLinks: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        flexWrap: 'wrap',
        marginBottom: 2,
      },
      footerLink: {
        fontSize: 10,
        color: Colors.text.secondary,
        fontWeight: '500' as const,
      },
      footerDivider: {
        fontSize: 10,
        color: Colors.gray[300],
        marginHorizontal: Spacing.xs,
      },
      websiteLink: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        marginBottom: 2,
        paddingVertical: 2,
      },
      websiteText: {
        fontSize: 10,
        color: Colors.primary,
        fontWeight: '600' as const,
      },
      footerCopyright: {
        fontSize: 9,
        color: Colors.gray[400],
        textAlign: 'center',
        marginTop: 2,
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
