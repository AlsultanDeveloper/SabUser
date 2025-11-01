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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/constants/firebase';

import { useApp } from '@/contexts/AppContext';
import { Colors, Spacing, BorderRadius, FontSizes } from '@/constants/theme';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { t, language } = useApp();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSendResetEmail = async () => {
    if (!email.trim()) {
      Alert.alert(t('common.error'), 'Please enter your email address');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert(t('common.error'), 'Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      // ✅ Updated: يوجه المستخدم لصفحة /user/login بعد إعادة التعيين
      await sendPasswordResetEmail(auth, email.trim(), {
        url: 'https://admin.sab-store.com/user/login',
        handleCodeInApp: false,
      });
      setEmailSent(true);
      Alert.alert(
        t('common.success'),
        'Password reset email has been sent! Please check your inbox.',
        [
          {
            text: 'OK',
            onPress: () => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace('/auth/login');
              }
            },
          },
        ]
      );
    } catch (error: any) {
      console.error('Password reset error:', error);
      let errorMessage = 'Failed to send reset email. Please try again.';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many requests. Please try again later.';
      }
      
      Alert.alert(t('common.error'), errorMessage);
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
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace('/auth/login');
              }
            }}
            activeOpacity={0.7}
          >
            <Feather name="arrow-left" size={24} color={Colors.text.primary} />
          </TouchableOpacity>

          <View style={styles.headerContainer}>
            <LinearGradient
              colors={[Colors.primary, Colors.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.iconGradient}
            >
              <Feather name="lock" size={48} color={Colors.white} />
            </LinearGradient>

            <Text style={styles.pageTitle}>{t('auth.forgotPassword')}</Text>
            <Text style={styles.pageDescription}>
              {language === 'ar'
                ? 'أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة تعيين كلمة المرور'
                : 'Enter your email and we will send you a link to reset your password'}
            </Text>
          </View>

          <View style={styles.formContainer}>
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
                editable={!emailSent}
              />
            </View>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleSendResetEmail}
              disabled={loading || emailSent}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={emailSent ? [Colors.success, Colors.success] : [Colors.primary, Colors.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.buttonGradient}
              >
                {loading ? (
                  <ActivityIndicator color={Colors.white} />
                ) : (
                  <View style={styles.buttonContent}>
                    <Feather
                      name={emailSent ? 'check-circle' : 'send'}
                      size={20}
                      color={Colors.white}
                    />
                    <Text style={styles.primaryButtonText}>
                      {emailSent
                        ? (language === 'ar' ? 'تم الإرسال' : 'Email Sent')
                        : (language === 'ar' ? 'إرسال رابط إعادة التعيين' : 'Send Reset Link')}
                    </Text>
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {emailSent && (
              <View style={styles.successMessage}>
                <Feather name="check-circle" size={24} color={Colors.success} />
                <Text style={styles.successText}>
                  {language === 'ar'
                    ? 'تم إرسال رابط إعادة التعيين إلى بريدك الإلكتروني!'
                    : 'Reset link sent to your email!'}
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={styles.backButton}
              onPress={() => {
                if (router.canGoBack()) {
                  router.back();
                } else {
                  router.replace('/auth/login');
                }
              }}
              activeOpacity={0.7}
            >
              <Feather name="arrow-left" size={18} color={Colors.primary} />
              <Text style={styles.backButtonText}>
                {language === 'ar' ? 'العودة لتسجيل الدخول' : 'Back to Sign In'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.infoSection}>
            <View style={styles.infoCard}>
              <Feather name="info" size={20} color={Colors.primary} />
              <Text style={styles.infoText}>
                {language === 'ar'
                  ? 'تحقق من مجلد البريد غير المرغوب فيه إذا لم تجد الرسالة'
                  : "Check your spam folder if you don't see the email"}
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: Spacing.xl,
  },
  closeButton: {
    position: 'absolute',
    top: Spacing.md,
    left: Spacing.md,
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
    paddingTop: Spacing.xxl * 2,
    paddingBottom: Spacing.xl,
    alignItems: 'center',
  },
  iconGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  pageTitle: {
    fontSize: FontSizes.xxxl,
    fontWeight: 'bold' as const,
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  pageDescription: {
    fontSize: FontSizes.md,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: Spacing.md,
  },
  formContainer: {
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
    marginBottom: Spacing.md,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonGradient: {
    paddingVertical: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  primaryButtonText: {
    fontSize: FontSizes.lg,
    fontWeight: 'bold' as const,
    color: Colors.white,
    letterSpacing: 0.5,
  },
  successMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.success + '15',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  successText: {
    flex: 1,
    fontSize: FontSizes.sm,
    color: Colors.success,
    fontWeight: '600' as const,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    gap: Spacing.xs,
  },
  backButtonText: {
    fontSize: FontSizes.md,
    color: Colors.primary,
    fontWeight: '600' as const,
  },
  infoSection: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.primary + '10',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
  },
  infoText: {
    flex: 1,
    fontSize: FontSizes.sm,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
});
