import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, Stack } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '@/contexts/AppContext';
import { Colors, Spacing, BorderRadius, FontSizes, FontWeights, Shadows } from '@/constants/theme';

export default function CardPaymentScreen() {
  const { t, language } = useApp();
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [saveCard, setSaveCard] = useState(false);

  // Format card number with spaces
  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\s/g, '');
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    return formatted;
  };

  // Format expiry date MM/YY
  const formatExpiryDate = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
    }
    return cleaned;
  };

  const handleCardNumberChange = (text: string) => {
    const cleaned = text.replace(/\s/g, '');
    if (cleaned.length <= 16) {
      setCardNumber(formatCardNumber(cleaned));
    }
  };

  const handleExpiryChange = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length <= 4) {
      setExpiryDate(formatExpiryDate(cleaned));
    }
  };

  const handleCvvChange = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length <= 4) {
      setCvv(cleaned);
    }
  };

  const validateCard = () => {
    if (!cardNumber || cardNumber.replace(/\s/g, '').length < 16) {
      Alert.alert(t('common.error'), 'Please enter a valid card number');
      return false;
    }
    if (!cardHolder || cardHolder.length < 3) {
      Alert.alert(t('common.error'), 'Please enter cardholder name');
      return false;
    }
    if (!expiryDate || expiryDate.length !== 5) {
      Alert.alert(t('common.error'), 'Please enter valid expiry date (MM/YY)');
      return false;
    }
    if (!cvv || cvv.length < 3) {
      Alert.alert(t('common.error'), 'Please enter valid CVV');
      return false;
    }
    return true;
  };

  const handleSubmit = () => {
    if (!validateCard()) return;

    // Show coming soon message
    Alert.alert(
      'Coming Soon! 🚀',
      'Card payment integration is under development. For now, please use Cash on Delivery.',
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
        colors={['#8B5CF6', '#6366F1']}
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
              {language === 'ar' ? 'الدفع بالبطاقة' : 'Card Payment'}
            </Text>
            <View style={styles.backButton} />
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Card Preview */}
        <View style={styles.cardPreview}>
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cardGradient}
          >
            <View style={styles.cardChip}>
              <Feather name="cpu" size={32} color={Colors.white} />
            </View>
            <Text style={styles.cardNumberPreview}>
              {cardNumber || '•••• •••• •••• ••••'}
            </Text>
            <View style={styles.cardInfo}>
              <View>
                <Text style={styles.cardLabel}>
                  {language === 'ar' ? 'اسم حامل البطاقة' : 'CARDHOLDER NAME'}
                </Text>
                <Text style={styles.cardValue}>
                  {cardHolder.toUpperCase() || 'YOUR NAME'}
                </Text>
              </View>
              <View>
                <Text style={styles.cardLabel}>
                  {language === 'ar' ? 'تاريخ الانتهاء' : 'EXPIRES'}
                </Text>
                <Text style={styles.cardValue}>{expiryDate || 'MM/YY'}</Text>
              </View>
            </View>
            <View style={styles.cardBrand}>
              <Feather name="credit-card" size={40} color={Colors.white} opacity={0.8} />
            </View>
          </LinearGradient>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Card Number */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              {language === 'ar' ? 'رقم البطاقة' : 'Card Number'} *
            </Text>
            <View style={styles.inputContainer}>
              <Feather name="credit-card" size={20} color={Colors.gray[400]} />
              <TextInput
                style={styles.input}
                placeholder="1234 5678 9012 3456"
                placeholderTextColor={Colors.gray[400]}
                value={cardNumber}
                onChangeText={handleCardNumberChange}
                keyboardType="number-pad"
                maxLength={19}
              />
            </View>
          </View>

          {/* Card Holder */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              {language === 'ar' ? 'اسم حامل البطاقة' : 'Cardholder Name'} *
            </Text>
            <View style={styles.inputContainer}>
              <Feather name="user" size={20} color={Colors.gray[400]} />
              <TextInput
                style={styles.input}
                placeholder={language === 'ar' ? 'الاسم كما في البطاقة' : 'Name as on card'}
                placeholderTextColor={Colors.gray[400]}
                value={cardHolder}
                onChangeText={setCardHolder}
                autoCapitalize="characters"
              />
            </View>
          </View>

          {/* Expiry & CVV */}
          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>
                {language === 'ar' ? 'تاريخ الانتهاء' : 'Expiry Date'} *
              </Text>
              <View style={styles.inputContainer}>
                <Feather name="calendar" size={20} color={Colors.gray[400]} />
                <TextInput
                  style={styles.input}
                  placeholder="MM/YY"
                  placeholderTextColor={Colors.gray[400]}
                  value={expiryDate}
                  onChangeText={handleExpiryChange}
                  keyboardType="number-pad"
                  maxLength={5}
                />
              </View>
            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>CVV *</Text>
              <View style={styles.inputContainer}>
                <Feather name="lock" size={20} color={Colors.gray[400]} />
                <TextInput
                  style={styles.input}
                  placeholder="123"
                  placeholderTextColor={Colors.gray[400]}
                  value={cvv}
                  onChangeText={handleCvvChange}
                  keyboardType="number-pad"
                  maxLength={4}
                  secureTextEntry
                />
              </View>
            </View>
          </View>

          {/* Save Card */}
          <TouchableOpacity
            style={styles.saveCardContainer}
            onPress={() => setSaveCard(!saveCard)}
            activeOpacity={0.7}
          >
            <View style={[styles.checkbox, saveCard && styles.checkboxActive]}>
              {saveCard && <Feather name="check" size={16} color={Colors.white} />}
            </View>
            <Text style={styles.saveCardText}>
              {language === 'ar' 
                ? 'حفظ بيانات البطاقة للمشتريات المستقبلية' 
                : 'Save card for future purchases'}
            </Text>
          </TouchableOpacity>

          {/* Security Info */}
          <View style={styles.securityInfo}>
            <Feather name="shield" size={20} color={Colors.success} />
            <Text style={styles.securityText}>
              {language === 'ar'
                ? 'معلوماتك محمية بتشفير SSL 256-bit'
                : 'Your information is secured with 256-bit SSL encryption'}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#8B5CF6', '#6366F1']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.submitGradient}
          >
            <Text style={styles.submitText}>
              {language === 'ar' ? 'تأكيد الدفع' : 'Confirm Payment'}
            </Text>
            <Feather name="arrow-right" size={20} color={Colors.white} />
          </LinearGradient>
        </TouchableOpacity>
      </View>
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
  cardPreview: {
    marginBottom: Spacing.xl,
  },
  cardGradient: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    minHeight: 200,
    ...Shadows.lg,
  },
  cardChip: {
    marginBottom: Spacing.lg,
  },
  cardNumberPreview: {
    fontSize: 22,
    fontWeight: FontWeights.bold,
    color: Colors.white,
    letterSpacing: 2,
    marginBottom: Spacing.xl,
  },
  cardInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardLabel: {
    fontSize: FontSizes.xs,
    color: Colors.white,
    opacity: 0.8,
    marginBottom: Spacing.xs,
  },
  cardValue: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
    color: Colors.white,
  },
  cardBrand: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
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
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  halfWidth: {
    flex: 1,
  },
  saveCardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.gray[300],
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  saveCardText: {
    flex: 1,
    fontSize: FontSizes.sm,
    color: Colors.text.secondary,
  },
  securityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.success + '10',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.sm,
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
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
  },
  submitText: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    color: Colors.white,
  },
});
