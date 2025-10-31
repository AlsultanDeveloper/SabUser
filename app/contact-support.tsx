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
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { Colors, Spacing, BorderRadius, FontSizes } from '@/constants/theme';
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
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('profile.support')}</Text>
        <View style={styles.headerPlaceholder} />
      </View>

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
            <View style={[styles.contactIconContainer, { backgroundColor: Colors.primary + '20' }]}>
              <Feather name="phone" size={24} color={Colors.primary} />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>{t('contactSupport.callUs')}</Text>
              <Text style={styles.contactValue}>+961 81 33 5929</Text>
            </View>
            <Feather name="chevron-right" size={20} color={Colors.gray[400]} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.contactCard}
            onPress={handleEmailSupport}
            activeOpacity={0.7}
          >
            <View style={[styles.contactIconContainer, { backgroundColor: Colors.secondary + '20' }]}>
              <Feather name="mail" size={24} color={Colors.secondary} />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>{t('contactSupport.emailUs')}</Text>
              <Text style={styles.contactValue}>Support@sab-store.com</Text>
            </View>
            <Feather name="chevron-right" size={20} color={Colors.gray[400]} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.contactCard}
            onPress={handleWhatsAppSupport}
            activeOpacity={0.7}
          >
            <View style={[styles.contactIconContainer, { backgroundColor: '#25D366' + '20' }]}>
              <Feather name="message-circle" size={24} color="#25D366" />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>{t('contactSupport.whatsapp')}</Text>
              <Text style={styles.contactValue}>+961 81 33 5929</Text>
            </View>
            <Feather name="chevron-right" size={20} color={Colors.gray[400]} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.contactCard}
            onPress={handleVisitWebsite}
            activeOpacity={0.7}
          >
            <View style={[styles.contactIconContainer, { backgroundColor: Colors.primary + '20' }]}>
              <Feather name="globe" size={24} color={Colors.primary} />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>{t('contactSupport.website')}</Text>
              <Text style={styles.contactValue}>www.sab-store.com</Text>
            </View>
            <Feather name="chevron-right" size={20} color={Colors.gray[400]} />
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  backButton: {
    padding: Spacing.xs,
  },
  headerTitle: {
    fontSize: FontSizes.xl,
    fontWeight: 'bold' as const,
    color: Colors.text.primary,
  },
  headerPlaceholder: {
    width: 40,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  content: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContentContainer: {
    flexGrow: 1,
    paddingBottom: Platform.OS === 'ios' ? Spacing.xl : Spacing.xxl,
  },
  introSection: {
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xl,
    marginBottom: Spacing.md,
  },
  mainTitle: {
    fontSize: FontSizes.xxxl,
    fontWeight: 'bold' as const,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  subtitle: {
    fontSize: FontSizes.md,
    color: Colors.text.secondary,
    lineHeight: 22,
  },
  contactMethods: {
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.md,
    gap: Spacing.md,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray[50],
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  contactIconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
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
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xl,
    paddingBottom: Spacing.xxl,
  },
  formTitle: {
    fontSize: FontSizes.xl,
    fontWeight: 'bold' as const,
    color: Colors.text.primary,
    marginBottom: Spacing.lg,
  },
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  inputLabel: {
    fontSize: FontSizes.md,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  input: {
    backgroundColor: Colors.gray[50],
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: FontSizes.md,
    color: Colors.text.primary,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  textArea: {
    height: 120,
    paddingTop: Spacing.md,
  },
  sendButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  sendButtonDisabled: {
    opacity: 0.6,
  },
  sendButtonText: {
    fontSize: FontSizes.md,
    fontWeight: '600' as const,
    color: Colors.white,
  },
});
