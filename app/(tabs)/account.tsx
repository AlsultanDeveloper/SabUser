import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
  Modal,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter, useFocusEffect } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { getUserProfile } from '@/constants/firestore';
import { Colors, Spacing, BorderRadius, FontSizes } from '@/constants/theme';
import Constants from 'expo-constants';

export default function AccountScreen() {
  const { t, language } = useApp();
  const { user, isAuthenticated, signOut } = useAuth();
  const router = useRouter();
  
  const [showHelpMenu, setShowHelpMenu] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);

  // Get app version from app.json
  const appVersion = Constants.expoConfig?.version || '1.0.0';

  // Load user profile from Firestore
  useEffect(() => {
    if (user?.uid) {
      loadUserProfile();
    }
  }, [user?.uid]);

  // Reload profile when screen comes into focus (after editing profile)
  useFocusEffect(
    useCallback(() => {
      if (user?.uid) {
        loadUserProfile();
      }
    }, [user?.uid])
  );

  const loadUserProfile = async () => {
    if (!user?.uid) return;
    try {
      const profile = await getUserProfile(user.uid);
      setUserProfile(profile);
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  // Check if email is Apple Private Relay
  const userEmail = user?.email || '';
  const isPrivateEmail = userEmail.includes('privaterelay.appleid.com');
  const displayEmail = isPrivateEmail ? 'Private Email 🔒' : userEmail;
  
  // Get display name from Firestore profile first, then Firebase Auth, then default
  const displayName = userProfile?.fullName || userProfile?.displayName || user?.displayName || 'User';

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        
        {/* Gradient Header */}
        <LinearGradient
          colors={[Colors.gradient.start, Colors.gradient.middle, Colors.gradient.end]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.loginRequiredHeader}
        >
          <SafeAreaView edges={['top']}>
            <View style={styles.header}>
              <View style={styles.backButton} />
              <Text style={styles.headerTitle}>{t('tabs.account')}</Text>
              <View style={styles.backButton} />
            </View>
          </SafeAreaView>
        </LinearGradient>

        {/* Lebanon Flag - Top Left Corner */}
        <Image 
          source={require('@/assets/images/lebanon-flag.png')}
          style={styles.flagImageCorner}
          resizeMode="contain"
        />

        <View style={styles.notAuthenticatedContainer}>
          <View style={styles.notAuthenticatedContent}>
            {/* Greeting Texts before Logo */}
            <Text style={styles.greetingText}>
              {language === 'ar' ? 'مرحبا ريّس شو الأخبار 😊' : 'Hello boss, how are you? 😊'}
            </Text>
            <Text style={styles.greetingSubText}>
              {language === 'ar' ? 'ماشي الحال كلو تمام 😊' : 'Everything is going great 😊'}
            </Text>
            
            {/* SAB STORE Logo with enhanced design */}
            <View style={styles.logoWrapper}>
              <View style={styles.logoContainer}>
                <Text style={styles.logoText}>SAB STORE</Text>
              </View>
            </View>

            <View style={styles.textContainer}>
              <Text style={styles.notAuthenticatedTitle}>{t('account.loginRequired')}</Text>
              <Text style={styles.notAuthenticatedDescription}>
                {t('account.loginRequiredDescription')}
              </Text>
            </View>
            
            <TouchableOpacity
              style={styles.loginRequiredButtonWrapper}
              onPress={() => router.push('/auth/login' as any)}
              activeOpacity={0.85}
            >
              <View style={styles.loginRequiredButton}>
                <Feather name="log-in" size={22} color={Colors.white} />
                <Text style={styles.loginRequiredButtonText}>{t('account.signIn')}</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

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
            <View style={styles.backButton} />
            <Text style={styles.headerTitle}>{t('tabs.account')}</Text>
            <View style={styles.backButton} />
          </View>
          
          {/* Profile Section inside gradient */}
          <View style={styles.profileSection}>
            <Text style={styles.userName}>{displayName}</Text>
            <Text style={styles.userEmail}>{displayEmail}</Text>
            <TouchableOpacity
              style={styles.editProfileButton}
              onPress={() => router.push('/profile/edit' as any)}
              activeOpacity={0.8}
            >
              <Feather name="edit-2" size={15} color={Colors.white} />
              <Text style={styles.editProfileButtonText}>{t('profile.editProfile')}</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={[styles.scrollView, language === 'ar' && { direction: 'rtl' as any }]} showsVerticalScrollIndicator={false}>

        <View style={[styles.section, styles.firstSection]}>
          
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/orders' as any)}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemLeft}>
              <Feather name="package" size={22} color="#111827" />
              <Text style={styles.menuItemText}>{t('account.orders')}</Text>
            </View>
            <Feather name="chevron-right" size={20} color={Colors.gray[400]} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity 
            style={styles.menuItem} 
            activeOpacity={0.7}
            onPress={() => router.push('/addresses' as any)}
          >
            <View style={styles.menuItemLeft}>
              <Feather name="map-pin" size={22} color="#111827" />
              <Text style={styles.menuItemText}>{t('account.addresses')}</Text>
            </View>
            <Feather name="chevron-right" size={20} color={Colors.gray[400]} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity 
            style={styles.menuItem} 
            activeOpacity={0.7}
            onPress={() => router.push('/notifications' as any)}
          >
            <View style={styles.menuItemLeft}>
              <Feather name="bell" size={22} color="#111827" />
              <Text style={styles.menuItemText}>{t('account.notifications')}</Text>
            </View>
            <Feather name="chevron-right" size={20} color={Colors.gray[400]} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          
          <TouchableOpacity 
            style={styles.helpSupportButton} 
            activeOpacity={0.7}
            onPress={() => {
              if (Platform.OS !== 'web') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              setShowHelpMenu(true);
            }}
          >
            <View style={styles.menuItemLeft}>
              <Feather name="help-circle" size={22} color="#111827" />
              <Text style={styles.menuItemText}>{t('account.helpSupport')}</Text>
            </View>
            <Feather name="chevron-right" size={20} color={Colors.gray[400]} />
          </TouchableOpacity>

          {/* Test Notifications button removed */}
        </View>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={async () => {
            if (Platform.OS !== 'web') {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
            
            // Handle sign out confirmation
            const confirmSignOut = async () => {
              console.log('🔄 User confirmed sign out');
              const result = await signOut();
              console.log('📋 Sign out result:', result);
              
              if (result.success) {
                console.log('✅ Sign out successful, redirecting...');
                router.replace('/auth/login');
              } else {
                console.error('❌ Sign out failed:', result.error);
                if (Platform.OS === 'web') {
                  alert('Failed to sign out: ' + result.error);
                }
              }
            };

            // Use native confirm on web, Alert on mobile
            if (Platform.OS === 'web') {
              if (confirm('Are you sure you want to sign out?')) {
                await confirmSignOut();
              }
            } else {
              Alert.alert(
                language === 'ar' ? 'سجل خروج من التطبيق' : 'Sign Out',
                language === 'ar' ? 'لا نكون زعلناك؟' : 'Are you sure you want to sign out?',
                [
                  { text: language === 'ar' ? 'لا خليني' : 'Cancel', style: 'cancel' },
                  { text: language === 'ar' ? 'نشوفك على خير' : 'Sign Out', style: 'destructive', onPress: confirmSignOut }
                ]
              );
            }
          }}
          activeOpacity={0.7}
        >
          <Feather name="log-out" size={18} color={Colors.error} />
          <Text style={styles.logoutButtonText}>{t('account.logout')}</Text>
        </TouchableOpacity>

        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>{language === 'ar' ? `النسخة ${appVersion}` : `Version ${appVersion}`}</Text>
        </View>
      </ScrollView>

      <Modal
        visible={showHelpMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowHelpMenu(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowHelpMenu(false)}
        >
          <View style={[styles.helpMenuModal, language === 'ar' && { direction: 'rtl' as any }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('account.helpSupport')}</Text>
              <TouchableOpacity 
                onPress={() => setShowHelpMenu(false)}
                style={styles.modalCloseButton}
              >
                <Feather name="x" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity 
              style={styles.helpMenuItem} 
              activeOpacity={0.7}
              onPress={() => {
                setShowHelpMenu(false);
                router.push('/contact-support' as any);
              }}
            >
              <View style={styles.helpMenuItemLeft}>
                <Feather name="headphones" size={22} color={Colors.primary} />
                <Text style={styles.helpMenuItemText}>{t('profile.support')}</Text>
              </View>
              <Feather name={language === 'ar' ? 'chevron-left' : 'chevron-right'} size={20} color={Colors.gray[400]} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.helpMenuItem} 
              activeOpacity={0.7}
              onPress={() => {
                setShowHelpMenu(false);
                router.push('/faq' as any);
              }}
            >
              <View style={styles.helpMenuItemLeft}>
                <Feather name="help-circle" size={22} color={Colors.primary} />
                <Text style={styles.helpMenuItemText}>{t('account.help')}</Text>
              </View>
              <Feather name={language === 'ar' ? 'chevron-left' : 'chevron-right'} size={20} color={Colors.gray[400]} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.helpMenuItem} 
              activeOpacity={0.7}
              onPress={() => {
                setShowHelpMenu(false);
                router.push('/about-us' as any);
              }}
            >
              <View style={styles.helpMenuItemLeft}>
                <Feather name="info" size={22} color={Colors.primary} />
                <Text style={styles.helpMenuItemText}>{t('account.about')}</Text>
              </View>
              <Feather name={language === 'ar' ? 'chevron-left' : 'chevron-right'} size={20} color={Colors.gray[400]} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.helpMenuItem} 
              activeOpacity={0.7}
              onPress={() => {
                setShowHelpMenu(false);
                router.push('/terms-of-use' as any);
              }}
            >
              <View style={styles.helpMenuItemLeft}>
                <Feather name="file-text" size={22} color={Colors.primary} />
                <Text style={styles.helpMenuItemText}>{t('account.termsOfUse')}</Text>
              </View>
              <Feather name={language === 'ar' ? 'chevron-left' : 'chevron-right'} size={20} color={Colors.gray[400]} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.helpMenuItem} 
              activeOpacity={0.7}
              onPress={() => {
                setShowHelpMenu(false);
                router.push('/privacy-policy' as any);
              }}
            >
              <View style={styles.helpMenuItemLeft}>
                <Feather name="shield" size={22} color={Colors.primary} />
                <Text style={styles.helpMenuItemText}>{t('account.privacyPolicy')}</Text>
              </View>
              <Feather name={language === 'ar' ? 'chevron-left' : 'chevron-right'} size={20} color={Colors.gray[400]} />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  gradientHeader: {
    paddingBottom: 8,
  },
  loginRequiredHeader: {
    paddingBottom: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800' as const,
    color: Colors.white,
    letterSpacing: 0.3,
  },
  scrollView: {
    flex: 1,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: Spacing.md,
    paddingBottom: 8,
  },
  userName: {
    fontSize: FontSizes.lg,
    fontWeight: '700' as const,
    color: Colors.white,
    marginTop: 2,
    letterSpacing: 0.2,
  },
  userEmail: {
    fontSize: FontSizes.sm,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 2,
  },
  section: {
    backgroundColor: Colors.white,
    marginBottom: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 16,
    marginHorizontal: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  firstSection: {
    marginTop: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.text.secondary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    paddingTop: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md + 2,
    borderRadius: 12,
    marginHorizontal: Spacing.xs,
    marginVertical: 2,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.gray[200],
    marginHorizontal: Spacing.md,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: Spacing.md,
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: FontSizes.md,
    color: Colors.text.primary,
    fontWeight: '600' as const,
    letterSpacing: 0.1,
  },
  valueText: {
    fontSize: FontSizes.sm,
    color: '#6B7280',
    marginRight: Spacing.xs,
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    paddingBottom: Spacing.xxl,
    marginTop: Spacing.md,
  },
  versionText: {
    fontSize: FontSizes.xs,
    color: Colors.text.secondary,
    fontWeight: '400' as const,
  },
  signInButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.md,
  },
  signInButtonText: {
    color: Colors.white,
    fontSize: FontSizes.md,
    fontWeight: 'bold' as const,
  },
  editProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  editProfileButtonText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '700' as const,
    letterSpacing: 0.3,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.white,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.error + '30',
  },
  logoutButtonText: {
    color: Colors.error,
    fontSize: FontSizes.sm,
    fontWeight: '600' as const,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: Spacing.lg,
    width: '100%',
    maxWidth: 420,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
  },
  modalTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '800' as const,
    color: Colors.text.primary,
    letterSpacing: 0.2,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xs,
    backgroundColor: Colors.surface,
  },
  modalOptionSelected: {
    backgroundColor: Colors.primary + '15',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  modalOptionText: {
    fontSize: FontSizes.md,
    fontWeight: '600' as const,
    color: '#111827',
  },
  modalOptionTextSelected: {
    color: Colors.primary,
    fontWeight: 'bold' as const,
  },
  modalOptionSubtext: {
    fontSize: FontSizes.xs,
    color: '#6B7280',
    marginTop: 2,
  },
  helpSupportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md + 2,
    borderRadius: 12,
    marginHorizontal: Spacing.xs,
    marginVertical: 2,
  },
  helpMenuModal: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: Spacing.lg,
    width: '100%',
    maxWidth: 420,
    maxHeight: '75%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1.5,
    borderBottomColor: Colors.gray[100],
  },
  helpMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: 14,
    marginBottom: Spacing.xs,
    backgroundColor: Colors.gray[50],
  },
  helpMenuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  helpMenuItemText: {
    fontSize: FontSizes.md,
    color: Colors.text.primary,
    fontWeight: '600' as const,
    letterSpacing: 0.1,
  },
  notAuthenticatedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
    backgroundColor: Colors.background,
  },
  notAuthenticatedContent: {
    alignItems: 'center',
    maxWidth: 400,
    width: '100%',
  },
  flagImage: {
    width: 250,
    height: 250,
    marginBottom: Spacing.md,
    borderRadius: 20,
    overflow: 'hidden',
  },
  flagImageCorner: {
    position: 'absolute',
    top: 80,
    right: -40,
    width: 220,
    height: 220,
    borderRadius: 12,
    overflow: 'hidden',
    zIndex: 10,
  },
  greetingText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  greetingSubText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  logoWrapper: {
    marginBottom: Spacing.lg,
  },
  logoContainer: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 12,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  logoText: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: Colors.white,
    letterSpacing: 1.2,
    textAlign: 'center',
  },
  textContainer: {
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.md,
  },
  notAuthenticatedTitle: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
    letterSpacing: -0.5,
  },
  notAuthenticatedDescription: {
    fontSize: FontSizes.md,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: Spacing.sm,
  },
  loginRequiredButtonWrapper: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
    width: '100%',
    maxWidth: 240,
  },
  loginRequiredButton: {
    backgroundColor: '#3B82F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm + 4,
  },
  loginRequiredButtonText: {
    color: Colors.white,
    fontSize: FontSizes.md,
    fontWeight: '700' as const,
    letterSpacing: 0.3,
  },
  modalCloseButton: {
    padding: 4,
  },
});
