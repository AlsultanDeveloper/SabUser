import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Linking,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { Colors, Spacing, FontSizes } from '@/constants/theme';
import { createDocument } from '@/constants/firestore';

export default function ContactSupportScreen() {
  const { t } = useApp();
  const { user } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCallSupport = () => {
    console.log('Opening phone dialer...');
    Linking.openURL('tel:+96181335929');
  };

  const handleEmailSupport = () => {
    console.log('Opening email client...');
    Linking.openURL('mailto:Support@sab-store.com');
  };

  const handleWhatsAppSupport = () => {
    console.log('Opening WhatsApp...');
    const phoneNumber = '96181335929';
    const defaultMessage = 'Hello, I need help with Sab Store';
    const url = Platform.select({
      ios: `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(defaultMessage)}`,
      android: `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(defaultMessage)}`,
      default: `https://wa.me/${phoneNumber}?text=${encodeURIComponent(defaultMessage)}`,
    });
    Linking.openURL(url).catch(() => {
      Alert.alert(t('common.error'), t('contactSupport.whatsappNotInstalled'));
    });
  };

  const handleVisitWebsite = () => {
    console.log('Opening website...');
    Linking.openURL('https://www.sab-store.com');
  };

  const handleSendMessage = async () => {
    console.log('Sending message...', { name, phoneNumber, message });
    
    if (!name.trim() || !phoneNumber.trim() || !message.trim()) {
      Alert.alert(t('common.error'), t('contactSupport.fillAllFields'));
      return;
    }

    setLoading(true);
    try {
      await createDocument('supportMessages', {
        name: name.trim(),
        phoneNumber: phoneNumber.trim(),
        message: message.trim(),
        userId: user?.uid || null,
        status: 'pending',
        read: false,
      });
      
      Alert.alert(t('common.success'), t('contactSupport.messageSent'));
      setName('');
      setPhoneNumber('');
      setMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
      Alert.alert(t('common.error'), t('contactSupport.messageFailed'));
    } finally {
      setLoading(false);
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
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Feather name="arrow-left" size={24} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{t('profile.support')}</Text>
            <View style={styles.backButton} />
          </View>
        </SafeAreaView>
      </LinearGradient>

      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          style={styles.content} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContentContainer}
        >
        <View style={styles.introSection}>
          <Text style={styles.mainTitle}>{t('contactSupport.howCanWeHelp')}</Text>
          <Text style={styles.subtitle}>{t('contactSupport.subtitle')}</Text>
        </View>

        <View style={styles.contactMethods}>
          <TouchableOpacity
            style={styles.contactCard}
            onPress={handleCallSupport}
            activeOpacity={0.7}
          >
            <Feather name="phone" size={22} color="#111827" />
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>{t('contactSupport.callUs')}</Text>
              <Text style={styles.contactValue}>+961 81 33 5929</Text>
            </View>
            <Feather name="chevron-right" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.contactCard}
            onPress={handleEmailSupport}
            activeOpacity={0.7}
          >
            <Feather name="mail" size={22} color="#111827" />
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>{t('contactSupport.emailUs')}</Text>
              <Text style={styles.contactValue}>Support@sab-store.com</Text>
            </View>
            <Feather name="chevron-right" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.contactCard}
            onPress={handleWhatsAppSupport}
            activeOpacity={0.7}
          >
            <Feather name="message-circle" size={22} color="#111827" />
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>{t('contactSupport.whatsapp')}</Text>
              <Text style={styles.contactValue}>+961 81 33 5929</Text>
            </View>
            <Feather name="chevron-right" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.contactCard}
            onPress={handleVisitWebsite}
            activeOpacity={0.7}
          >
            <Feather name="globe" size={22} color="#111827" />
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>{t('contactSupport.website')}</Text>
              <Text style={styles.contactValue}>www.sab-store.com</Text>
            </View>
            <Feather name="chevron-right" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.formTitle}>{t('contactSupport.sendMessage')}</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{t('address.fullName')}</Text>
            <TextInput
              style={styles.input}
              placeholder={t('accountInfo.enterName')}
              placeholderTextColor={Colors.text.secondary}
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{t('auth.phoneNumber')}</Text>
            <TextInput
              style={styles.input}
              placeholder={t('auth.phoneNumber')}
              placeholderTextColor={Colors.text.secondary}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{t('contactSupport.message')}</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder={t('contactSupport.writeMessage')}
              placeholderTextColor={Colors.text.secondary}
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
          </View>

          <TouchableOpacity
            style={[styles.sendButton, loading && styles.sendButtonDisabled]}
            onPress={handleSendMessage}
            disabled={loading}
            activeOpacity={0.8}
          >
            <Text style={styles.sendButtonText}>
              {loading ? t('contactSupport.sending') : t('contactSupport.sendMessage')}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      </KeyboardAvoidingView>
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
  keyboardAvoidingView: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContentContainer: {
    flexGrow: 1,
    paddingBottom: Platform.OS === 'ios' ? Spacing.xl : Spacing.xxl,
  },
  introSection: {
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: Colors.text.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: FontSizes.md,
    color: Colors.text.secondary,
    lineHeight: 22,
  },
  contactMethods: {
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    padding: 16,
    borderRadius: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  contactInfo: {
    flex: 1,
  },
  contactLabel: {
    fontSize: FontSizes.sm,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  contactValue: {
    fontSize: FontSizes.md,
    fontWeight: '600' as const,
    color: Colors.text.primary,
  },
  formSection: {
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: Colors.text.primary,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: FontSizes.md,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: FontSizes.md,
    color: Colors.text.primary,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  textArea: {
    height: 120,
    paddingTop: 14,
  },
  sendButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFF',
  },
});
