import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { Colors, Spacing, BorderRadius, FontSizes } from '@/constants/theme';
import { verifyPhoneOTP, resendPhoneOTP } from '@/utils/phoneOTP';

export default function VerifyOTPScreen() {
  const router = useRouter();
  const { language, t } = useApp();
  const { user } = useAuth();
  const params = useLocalSearchParams();
  const phoneNumber = params.phoneNumber as string;

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // Refs للـ input boxes
  const inputRefs = useRef<(TextInput | null)[]>([]);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  // Focus first input on mount
  useEffect(() => {
    setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 100);
  }, []);

  const handleOtpChange = (index: number, value: string) => {
    // السماح بالأرقام فقط
    if (value && !/^\d+$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // الانتقال للخانة التالية تلقائياً
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // التحقق التلقائي عند إدخال جميع الأرقام
    if (newOtp.every(digit => digit !== '') && index === 5) {
      Keyboard.dismiss();
      handleVerifyOTP(newOtp.join(''));
    }
  };

  const handleKeyPress = (index: number, key: string) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = async (code?: string) => {
    const otpCode = code || otp.join('');
    
    if (otpCode.length !== 6) {
      Alert.alert(
        language === 'ar' ? 'خطأ' : 'Error',
        language === 'ar' 
          ? 'يرجى إدخال رمز التحقق المكون من 6 أرقام'
          : 'Please enter the 6-digit verification code'
      );
      return;
    }

    setLoading(true);
    try {
      console.log('🔍 Verifying OTP:', otpCode);
      
      const result = await verifyPhoneOTP(phoneNumber, otpCode);

      if (result.success && result.userId) {
        console.log('✅ OTP verified successfully');
        
        // تسجيل الدخول في AuthContext
        const { signInWithPhoneOTP } = useAuth();
        const authResult = await signInWithPhoneOTP(result.userId, phoneNumber);
        
        if (authResult.success) {
          Alert.alert(
            language === 'ar' ? 'نجح!' : 'Success!',
            result.isNewUser
              ? (language === 'ar' 
                  ? 'تم إنشاء حسابك بنجاح!' 
                  : 'Your account has been created successfully!')
              : (language === 'ar' 
                  ? 'تم تسجيل الدخول بنجاح!' 
                  : 'Logged in successfully!'),
            [
              {
                text: 'OK',
                onPress: () => {
                  if (router.canGoBack()) {
                    router.back();
                    router.back(); // Go back twice (past login screen)
                  } else {
                    router.replace('/(tabs)/home');
                  }
                }
              }
            ]
          );
        } else {
          throw new Error(authResult.error || 'Failed to complete sign-in');
        }
      } else {
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
        
        Alert.alert(
          language === 'ar' ? 'خطأ' : 'Error',
          result.error || (language === 'ar' 
            ? 'رمز التحقق غير صحيح' 
            : 'Invalid verification code')
        );
      }
    } catch (error: any) {
      console.error('❌ Error verifying OTP:', error);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      
      Alert.alert(
        language === 'ar' ? 'خطأ' : 'Error',
        language === 'ar' 
          ? 'حدث خطأ أثناء التحقق. يرجى المحاولة مرة أخرى.'
          : 'An error occurred during verification. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;

    setResendLoading(true);
    try {
      console.log('🔄 Resending OTP...');
      
      const result = await resendPhoneOTP(phoneNumber);

      if (result.success) {
        Alert.alert(
          language === 'ar' ? 'تم!' : 'Success!',
          language === 'ar' 
            ? 'تم إرسال رمز التحقق من جديد'
            : 'Verification code has been resent'
        );
        
        setCountdown(60);
        setCanResend(false);
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      } else {
        Alert.alert(
          language === 'ar' ? 'خطأ' : 'Error',
          result.error || (language === 'ar' 
            ? 'فشل إعادة إرسال الرمز' 
            : 'Failed to resend code')
        );
      }
    } catch (error) {
      console.error('❌ Error resending OTP:', error);
      Alert.alert(
        language === 'ar' ? 'خطأ' : 'Error',
        language === 'ar' 
          ? 'حدث خطأ. يرجى المحاولة مرة أخرى.'
          : 'An error occurred. Please try again.'
      );
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: language === 'ar' ? 'تحقق من رقم الجوال' : 'Verify Phone Number',
          headerStyle: { backgroundColor: Colors.gradient.start },
          headerTintColor: '#fff',
        }}
      />
      
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <LinearGradient
          colors={[Colors.gradient.start, Colors.gradient.middle, Colors.gradient.end]}
          style={styles.gradient}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
          >
            <View style={styles.content}>
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.iconContainer}>
                  <Feather name="smartphone" size={60} color="#fff" />
                </View>
                
                <Text style={styles.title}>
                  {language === 'ar' ? 'أدخل رمز التحقق' : 'Enter Verification Code'}
                </Text>
                
                <Text style={styles.subtitle}>
                  {language === 'ar' 
                    ? `أرسلنا رمز التحقق إلى:\n${phoneNumber}`
                    : `We sent a verification code to:\n${phoneNumber}`}
                </Text>
              </View>

              {/* OTP Input Boxes */}
              <View style={styles.otpContainer}>
                {otp.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={(ref) => {
                      inputRefs.current[index] = ref;
                    }}
                    style={[
                      styles.otpInput,
                      digit ? styles.otpInputFilled : null,
                    ]}
                    value={digit}
                    onChangeText={(value) => handleOtpChange(index, value)}
                    onKeyPress={({ nativeEvent }) => handleKeyPress(index, nativeEvent.key)}
                    keyboardType="number-pad"
                    maxLength={1}
                    selectTextOnFocus
                    editable={!loading}
                  />
                ))}
              </View>

              {/* Verify Button */}
              <TouchableOpacity
                style={[styles.verifyButton, loading && styles.buttonDisabled]}
                onPress={() => handleVerifyOTP()}
                disabled={loading || otp.some(digit => digit === '')}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.verifyButtonText}>
                    {language === 'ar' ? 'تحقق' : 'Verify'}
                  </Text>
                )}
              </TouchableOpacity>

              {/* Resend Code */}
              <View style={styles.resendContainer}>
                <Text style={styles.resendText}>
                  {language === 'ar' ? 'لم تستلم الرمز؟' : "Didn't receive the code?"}
                </Text>
                
                {canResend ? (
                  <TouchableOpacity 
                    onPress={handleResend}
                    disabled={resendLoading}
                  >
                    {resendLoading ? (
                      <ActivityIndicator size="small" color="#fff" style={{ marginLeft: 8 }} />
                    ) : (
                      <Text style={styles.resendLink}>
                        {language === 'ar' ? 'إعادة إرسال' : 'Resend'}
                      </Text>
                    )}
                  </TouchableOpacity>
                ) : (
                  <Text style={styles.countdownText}>
                    {language === 'ar' 
                      ? `إعادة الإرسال بعد ${countdown} ثانية`
                      : `Resend in ${countdown}s`}
                  </Text>
                )}
              </View>

              {/* Notification Hint */}
              <View style={styles.hintContainer}>
                <Feather name="bell" size={16} color="rgba(255,255,255,0.7)" />
                <Text style={styles.hintText}>
                  {language === 'ar' 
                    ? 'تحقق من الإشعارات لرؤية الرمز'
                    : 'Check your notifications to see the code'}
                </Text>
              </View>
            </View>
          </KeyboardAvoidingView>
        </LinearGradient>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.gradient.start,
  },
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: Spacing.lg,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl * 2,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: FontSizes.xxl,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: FontSizes.md,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 24,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.sm,
  },
  otpInput: {
    width: 50,
    height: 60,
    borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    fontSize: FontSizes.xxl,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  otpInputFilled: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderColor: '#fff',
  },
  verifyButton: {
    backgroundColor: '#fff',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    marginBottom: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  verifyButtonText: {
    fontSize: FontSizes.lg,
    fontWeight: 'bold',
    color: Colors.gradient.start,
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  resendText: {
    fontSize: FontSizes.md,
    color: 'rgba(255, 255, 255, 0.8)',
    marginRight: 8,
  },
  resendLink: {
    fontSize: FontSizes.md,
    color: '#fff',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  countdownText: {
    fontSize: FontSizes.md,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  hintContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: BorderRadius.md,
  },
  hintText: {
    fontSize: FontSizes.sm,
    color: 'rgba(255, 255, 255, 0.7)',
    marginLeft: 8,
  },
});
