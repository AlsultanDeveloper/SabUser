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

export default function WhishPaymentScreen() {
  const { language, cartTotal, formatPrice } = useApp();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [showPinInput, setShowPinInput] = useState(false);

  // Format Lebanese phone number
  const formatPhoneNumber = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    
    if (cleaned.startsWith('961')) {
      const number = cleaned.slice(3);
      if (number.length <= 2) return `+961 ${number}`;
      if (number.length <= 5) return `+961 ${number.slice(0, 2)} ${number.slice(2)}`;
      return `+961 ${number.slice(0, 2)} ${number.slice(2, 5)} ${number.slice(5, 8)}`;
    }
    
    if (cleaned.length <= 2) return cleaned ? `+961 ${cleaned}` : '';
    if (cleaned.length <= 5) return `+961 ${cleaned.slice(0, 2)} ${cleaned.slice(2)}`;
    return `+961 ${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5, 8)}`;
  };

  const handlePhoneChange = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length <= 11) {
      setPhoneNumber(formatPhoneNumber(cleaned));
    }
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
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
    if (!email || !validateEmail(email)) {
      Alert.alert(
        language === 'ar' ? 'خطأ' : 'Error',
        language === 'ar' 
          ? 'الرجاء إدخال بريد إلكتروني صحيح' 
          : 'Please enter a valid email address'
      );
      return false;
    }
    return true;
  };

  const handleRequestPayment = () => {
    if (!validateInputs()) return;

    setShowPinInput(true);
    Alert.alert(
      language === 'ar' ? 'جاهز للدفع' : 'Ready to Pay',
      language === 'ar'
        ? 'أدخل رمز PIN الخاص بـ Whish Money لإتمام الدفع'
        : 'Enter your Whish Money PIN to complete payment',
      [{ text: 'OK' }]
    );
  };

  const handleConfirmPayment = () => {
    if (!pin || pin.length < 4) {
      Alert.alert(
        language === 'ar' ? 'خطأ' : 'Error',
        language === 'ar'
          ? 'الرجاء إدخال رمز PIN'
          : 'Please enter your PIN'
      );
      return;
    }

    // Show coming soon message
    Alert.alert(
      language === 'ar' ? 'قريباً! 🚀' : 'Coming Soon! 🚀',
      language === 'ar'
        ? 'نعمل حالياً على تفعيل الدفع عبر Whish Money. سيتم الإطلاق قريباً جداً!'
        : 'Whish Money payment integration is under development. Will be launched very soon!',
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
        colors={['#6366F1', '#8B5CF6']}
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
              {language === 'ar' ? 'الدفع عبر Whish Money' : 'Whish Money Payment'}
            </Text>
            <View style={styles.backButton} />
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Whish Logo & Info */}
        <View style={styles.logoCard}>
          <View style={styles.logoContainer}>
            {/* Try to load real logo, fallback to text */}
            <Image
              source={require('@/assets/images/payment/whish-logo.png')}
              style={styles.logoImage}
              resizeMode="contain"
              onError={() => {
                // Fallback handled by catch
              }}
            />
            {/* Fallback text logo */}
            <View style={styles.whishLogo}>
              <Text style={styles.whishLogoText}>W$</Text>
            </View>
          </View>
          <Text style={styles.logoTitle}>Whish Money</Text>
          <Text style={styles.logoSubtitle}>
            {language === 'ar' 
              ? 'ادفع بسرعة وأمان عبر Whish Money' 
              : 'Pay quickly and securely with Whish Money'}
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
              {language === 'ar' ? 'رقم الهاتف المسجل في Whish' : 'Whish Registered Phone'} *
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
                editable={!showPinInput}
              />
            </View>
          </View>

          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              {language === 'ar' ? 'البريد الإلكتروني' : 'Email Address'} *
            </Text>
            <View style={styles.inputContainer}>
              <Feather name="mail" size={20} color={Colors.gray[400]} />
              <TextInput
                style={styles.input}
                placeholder={language === 'ar' ? 'البريد الإلكتروني' : 'email@example.com'}
                placeholderTextColor={Colors.gray[400]}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!showPinInput}
              />
            </View>
          </View>

          {/* Request Payment Button */}
          {!showPinInput && (
            <TouchableOpacity
              style={styles.requestButton}
              onPress={handleRequestPayment}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#6366F1', '#8B5CF6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.requestGradient}
              >
                <Feather name="arrow-right-circle" size={20} color={Colors.white} />
                <Text style={styles.requestText}>
                  {language === 'ar' ? 'طلب الدفع' : 'Request Payment'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          )}

          {/* PIN Input */}
          {showPinInput && (
            <View style={styles.pinSection}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  {language === 'ar' ? 'رمز PIN' : 'Whish PIN'} *
                </Text>
                <View style={styles.inputContainer}>
                  <Feather name="lock" size={20} color={Colors.gray[400]} />
                  <TextInput
                    style={styles.input}
                    placeholder="••••"
                    placeholderTextColor={Colors.gray[400]}
                    value={pin}
                    onChangeText={setPin}
                    keyboardType="number-pad"
                    maxLength={6}
                    secureTextEntry
                  />
                </View>
                <Text style={styles.hint}>
                  {language === 'ar'
                    ? 'أدخل رمز PIN الخاص بحسابك في Whish Money'
                    : 'Enter your Whish Money account PIN'}
                </Text>
              </View>
            </View>
          )}

          {/* Features */}
          <View style={styles.featuresCard}>
            <View style={styles.feature}>
              <View style={styles.featureIcon}>
                <Feather name="zap" size={20} color="#6366F1" />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>
                  {language === 'ar' ? 'دفع فوري' : 'Instant Payment'}
                </Text>
                <Text style={styles.featureText}>
                  {language === 'ar' 
                    ? 'يتم تأكيد الدفع فوراً' 
                    : 'Payment confirmed instantly'}
                </Text>
              </View>
            </View>

            <View style={styles.feature}>
              <View style={styles.featureIcon}>
                <Feather name="shield" size={20} color="#6366F1" />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>
                  {language === 'ar' ? 'آمن 100%' : '100% Secure'}
                </Text>
                <Text style={styles.featureText}>
                  {language === 'ar' 
                    ? 'محمي بتشفير من الطراز العالمي' 
                    : 'Protected by world-class encryption'}
                </Text>
              </View>
            </View>

            <View style={styles.feature}>
              <View style={styles.featureIcon}>
                <Feather name="dollar-sign" size={20} color="#6366F1" />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>
                  {language === 'ar' ? 'بدون رسوم إضافية' : 'No Extra Fees'}
                </Text>
                <Text style={styles.featureText}>
                  {language === 'ar' 
                    ? 'ادفع المبلغ المطلوب فقط' 
                    : 'Pay only the required amount'}
                </Text>
              </View>
            </View>
          </View>

          {/* How it works */}
          <View style={styles.instructionsCard}>
            <View style={styles.instructionsHeader}>
              <Feather name="info" size={20} color="#6366F1" />
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
                  ? 'أدخل رقم هاتفك والبريد الإلكتروني المسجلين في Whish'
                  : 'Enter your Whish registered phone and email'}
              </Text>
            </View>

            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <Text style={styles.stepText}>
                {language === 'ar'
                  ? 'أدخل رمز PIN الخاص بحسابك'
                  : 'Enter your account PIN'}
              </Text>
            </View>

            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <Text style={styles.stepText}>
                {language === 'ar'
                  ? 'أكمل عملية الدفع بأمان'
                  : 'Complete payment securely'}
              </Text>
            </View>
          </View>

          {/* Security Info */}
          <View style={styles.securityInfo}>
            <Feather name="shield" size={20} color={Colors.success} />
            <Text style={styles.securityText}>
              {language === 'ar'
                ? 'معاملتك محمية بالكامل. نحن لا نخزن معلومات الدفع الخاصة بك'
                : 'Your transaction is fully protected. We never store your payment info'}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Confirm Button */}
      {showPinInput && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleConfirmPayment}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#6366F1', '#8B5CF6']}
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
  whishLogo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#6366F1',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  whishLogoText: {
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
    backgroundColor: '#EEF2FF',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  amountLabel: {
    fontSize: FontSizes.sm,
    color: '#4338CA',
    marginBottom: Spacing.xs,
    fontWeight: FontWeights.semibold,
  },
  amountValue: {
    fontSize: 32,
    fontWeight: FontWeights.bold,
    color: '#6366F1',
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
  requestButton: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginTop: Spacing.sm,
    ...Shadows.md,
  },
  requestGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
  },
  requestText: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    color: Colors.white,
  },
  pinSection: {
    gap: Spacing.md,
  },
  featuresCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  featureText: {
    fontSize: FontSizes.sm,
    color: Colors.text.secondary,
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
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#6366F1',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  stepNumberText: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.bold,
    color: '#6366F1',
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
