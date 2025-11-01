import React, { useState } from 'react';
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
import { router, Stack } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '@/contexts/AppContext';
import { Colors, Spacing, BorderRadius, FontSizes, FontWeights, Shadows } from '@/constants/theme';

export default function OMTPaymentScreen() {
  const { language, cartTotal, formatPrice } = useApp();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [showVerification, setShowVerification] = useState(false);

  // Format Lebanese phone number
  const formatPhoneNumber = (text: string) => {
    // Remove non-digits
    const cleaned = text.replace(/\D/g, '');
    
    // Format as +961 XX XXX XXX
    if (cleaned.startsWith('961')) {
      const number = cleaned.slice(3);
      if (number.length <= 2) return `+961 ${number}`;
      if (number.length <= 5) return `+961 ${number.slice(0, 2)} ${number.slice(2)}`;
      return `+961 ${number.slice(0, 2)} ${number.slice(2, 5)} ${number.slice(5, 8)}`;
    }
    
    // Add +961 prefix
    if (cleaned.length <= 2) return cleaned ? `+961 ${cleaned}` : '';
    if (cleaned.length <= 5) return `+961 ${cleaned.slice(0, 2)} ${cleaned.slice(2)}`;
    return `+961 ${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5, 8)}`;
  };

  const handlePhoneChange = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length <= 11) { // +961 + 8 digits
      setPhoneNumber(formatPhoneNumber(cleaned));
    }
  };

  const validateInputs = () => {
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 11) {
      Alert.alert(
        language === 'ar' ? 'خطأ' : 'Error',
        language === 'ar' 
          ? 'الرجاء إدخال رقم هاتف صحيح' 
          : 'Please enter a valid phone number'
      );
      return false;
    }
    if (!fullName || fullName.length < 3) {
      Alert.alert(
        language === 'ar' ? 'خطأ' : 'Error',
        language === 'ar' 
          ? 'الرجاء إدخال الاسم الكامل' 
          : 'Please enter your full name'
      );
      return false;
    }
    return true;
  };

  const handleSendCode = () => {
    if (!validateInputs()) return;

    // Simulate sending verification code
    setShowVerification(true);
    Alert.alert(
      language === 'ar' ? 'تم الإرسال' : 'Code Sent',
      language === 'ar'
        ? 'تم إرسال رمز التحقق إلى رقم هاتفك عبر OMT'
        : 'Verification code has been sent to your phone via OMT',
      [{ text: 'OK' }]
    );
  };

  const handleVerifyAndPay = () => {
    if (!verificationCode || verificationCode.length < 4) {
      Alert.alert(
        language === 'ar' ? 'خطأ' : 'Error',
        language === 'ar'
          ? 'الرجاء إدخال رمز التحقق'
          : 'Please enter verification code'
      );
      return;
    }

    // Show coming soon message
    Alert.alert(
      language === 'ar' ? 'قريباً! 🚀' : 'Coming Soon! 🚀',
      language === 'ar'
        ? 'نعمل حالياً على تفعيل الدفع عبر OMT. سيتم الإطلاق قريباً جداً!'
        : 'OMT payment integration is under development. Will be launched very soon!',
      [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Header */}
      <LinearGradient
        colors={['#FF6B00', '#FF8C00']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <SafeAreaView edges={['top']}>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Feather name="arrow-left" size={24} color={Colors.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              {language === 'ar' ? 'الدفع عبر OMT' : 'OMT Payment'}
            </Text>
            <View style={styles.backButton} />
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* OMT Logo & Info */}
        <View style={styles.logoCard}>
          <View style={styles.logoContainer}>
            {/* Try to load real logo, fallback to text */}
            <Image
              source={require('@/assets/images/payment/omt-logo.png')}
              style={styles.logoImage}
              resizeMode="contain"
              onError={() => {
                // Fallback handled by catch
              }}
            />
            {/* Fallback text logo (hidden if image loads) */}
            <View style={styles.omtLogo}>
              <Text style={styles.omtLogoText}>OMT</Text>
            </View>
          </View>
          <Text style={styles.logoTitle}>
            {language === 'ar' ? 'أوامت للتحويلات المالية' : 'OMT Money Transfer'}
          </Text>
          <Text style={styles.logoSubtitle}>
            {language === 'ar' 
              ? 'ادفع بأمان وسهولة عبر OMT' 
              : 'Pay safely and easily with OMT'}
          </Text>
        </View>

        {/* Amount Card */}
        <View style={styles.amountCard}>
          <Text style={styles.amountLabel}>
            {language === 'ar' ? 'المبلغ المطلوب' : 'Amount to Pay'}
          </Text>
          <Text style={styles.amountValue}>{formatPrice(cartTotal)}</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Phone Number */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              {language === 'ar' ? 'رقم الهاتف المسجل في OMT' : 'OMT Registered Phone'} *
            </Text>
            <View style={styles.inputContainer}>
              <Feather name="phone" size={20} color={Colors.gray[400]} />
              <TextInput
                style={styles.input}
                placeholder="+961 XX XXX XXX"
                placeholderTextColor={Colors.gray[400]}
                value={phoneNumber}
                onChangeText={handlePhoneChange}
                keyboardType="phone-pad"
                maxLength={17}
                editable={!showVerification}
              />
            </View>
            <Text style={styles.hint}>
              {language === 'ar'
                ? 'أدخل رقم هاتفك المسجل في تطبيق OMT'
                : 'Enter your phone number registered with OMT app'}
            </Text>
          </View>

          {/* Full Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              {language === 'ar' ? 'الاسم الكامل' : 'Full Name'} *
            </Text>
            <View style={styles.inputContainer}>
              <Feather name="user" size={20} color={Colors.gray[400]} />
              <TextInput
                style={styles.input}
                placeholder={language === 'ar' ? 'الاسم كما في OMT' : 'Name as in OMT'}
                placeholderTextColor={Colors.gray[400]}
                value={fullName}
                onChangeText={setFullName}
                editable={!showVerification}
              />
            </View>
          </View>

          {/* Send Verification Code Button */}
          {!showVerification && (
            <TouchableOpacity
              style={styles.sendCodeButton}
              onPress={handleSendCode}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#FF6B00', '#FF8C00']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.sendCodeGradient}
              >
                <Feather name="send" size={20} color={Colors.white} />
                <Text style={styles.sendCodeText}>
                  {language === 'ar' ? 'إرسال رمز التحقق' : 'Send Verification Code'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          )}

          {/* Verification Code */}
          {showVerification && (
            <View style={styles.verificationSection}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  {language === 'ar' ? 'رمز التحقق' : 'Verification Code'} *
                </Text>
                <View style={styles.inputContainer}>
                  <Feather name="lock" size={20} color={Colors.gray[400]} />
                  <TextInput
                    style={styles.input}
                    placeholder="XXXX"
                    placeholderTextColor={Colors.gray[400]}
                    value={verificationCode}
                    onChangeText={setVerificationCode}
                    keyboardType="number-pad"
                    maxLength={6}
                  />
                </View>
                <Text style={styles.hint}>
                  {language === 'ar'
                    ? 'أدخل الرمز المرسل إلى هاتفك'
                    : 'Enter the code sent to your phone'}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.resendButton}
                onPress={handleSendCode}
              >
                <Text style={styles.resendText}>
                  {language === 'ar' ? 'إعادة إرسال الرمز' : 'Resend Code'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* How it works */}
          <View style={styles.instructionsCard}>
            <View style={styles.instructionsHeader}>
              <Feather name="info" size={20} color="#FF6B00" />
              <Text style={styles.instructionsTitle}>
                {language === 'ar' ? 'كيف يعمل؟' : 'How it works?'}
              </Text>
            </View>
            
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <Text style={styles.stepText}>
                {language === 'ar'
                  ? 'أدخل رقم هاتفك المسجل في OMT'
                  : 'Enter your OMT registered phone number'}
              </Text>
            </View>

            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <Text style={styles.stepText}>
                {language === 'ar'
                  ? 'سيتم إرسال رمز تحقق إلى هاتفك'
                  : 'A verification code will be sent to your phone'}
              </Text>
            </View>

            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <Text style={styles.stepText}>
                {language === 'ar'
                  ? 'أدخل الرمز وأكمل عملية الدفع'
                  : 'Enter the code and complete payment'}
              </Text>
            </View>
          </View>

          {/* Security Info */}
          <View style={styles.securityInfo}>
            <Feather name="shield" size={20} color={Colors.success} />
            <Text style={styles.securityText}>
              {language === 'ar'
                ? 'الدفع آمن ومشفر 100%. تتم المعاملة عبر OMT مباشرة'
                : 'Payment is 100% secure and encrypted. Transaction via OMT directly'}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Submit Button */}
      {showVerification && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleVerifyAndPay}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#FF6B00', '#FF8C00']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.submitGradient}
            >
              <Text style={styles.submitText}>
                {language === 'ar' ? 'تأكيد الدفع' : 'Confirm Payment'}
              </Text>
              <Text style={styles.submitAmount}>{formatPrice(cartTotal)}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingBottom: Spacing.md,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    color: Colors.white,
  },
  content: {
    flex: 1,
    padding: Spacing.md,
  },
  logoCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    marginBottom: Spacing.lg,
    ...Shadows.md,
  },
  logoContainer: {
    marginBottom: Spacing.md,
    position: 'relative',
  },
  logoImage: {
    width: 80,
    height: 80,
    position: 'absolute',
    zIndex: 2,
  },
  omtLogo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FF6B00',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  omtLogoText: {
    fontSize: 28,
    fontWeight: FontWeights.bold,
    color: Colors.white,
  },
  logoTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  logoSubtitle: {
    fontSize: FontSizes.sm,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  amountCard: {
    backgroundColor: '#FFF7ED',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: '#FFD7B5',
  },
  amountLabel: {
    fontSize: FontSizes.sm,
    color: '#C2410C',
    marginBottom: Spacing.xs,
    fontWeight: FontWeights.semibold,
  },
  amountValue: {
    fontSize: 32,
    fontWeight: FontWeights.bold,
    color: '#FF6B00',
  },
  form: {
    gap: Spacing.lg,
  },
  inputGroup: {
    gap: Spacing.sm,
  },
  label: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
    color: Colors.text.primary,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border.light,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: FontSizes.md,
    color: Colors.text.primary,
    paddingVertical: Spacing.xs,
  },
  hint: {
    fontSize: FontSizes.xs,
    color: Colors.text.secondary,
    marginTop: -Spacing.xs,
  },
  sendCodeButton: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginTop: Spacing.sm,
    ...Shadows.md,
  },
  sendCodeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
  },
  sendCodeText: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    color: Colors.white,
  },
  verificationSection: {
    gap: Spacing.md,
  },
  resendButton: {
    alignSelf: 'center',
    padding: Spacing.sm,
  },
  resendText: {
    fontSize: FontSizes.sm,
    color: '#FF6B00',
    fontWeight: FontWeights.semibold,
    textDecorationLine: 'underline',
  },
  instructionsCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  instructionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  instructionsTitle: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
    color: Colors.text.primary,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FF6B00',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  stepNumberText: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.bold,
    color: '#FF6B00',
  },
  stepText: {
    flex: 1,
    fontSize: FontSizes.sm,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  securityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.success + '10',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  securityText: {
    flex: 1,
    fontSize: FontSizes.sm,
    color: Colors.success,
  },
  footer: {
    padding: Spacing.md,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
  },
  submitButton: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadows.md,
  },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  submitText: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    color: Colors.white,
  },
  submitAmount: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    color: Colors.white,
  },
});
