import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
  Modal,
  // Image removed
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { Colors, Spacing, BorderRadius, FontSizes } from '@/constants/theme';

export default function AccountScreen() {
  const { t } = useApp();
  const { user, isAuthenticated, signOut } = useAuth();
  const router = useRouter();
  
  const [showHelpMenu, setShowHelpMenu] = useState(false);

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <View style={styles.notAuthenticatedContainer}>
          <View style={styles.notAuthenticatedContent}>
            <View style={styles.lockIconContainer}>
              <Feather name="lock" size={60} color={Colors.primary} />
            </View>
            <Text style={styles.notAuthenticatedTitle}>{t('account.loginRequired')}</Text>
            <Text style={styles.notAuthenticatedDescription}>
              {t('account.loginRequiredDescription')}
            </Text>
            <TouchableOpacity
              style={styles.loginRequiredButton}
              onPress={() => router.push('/auth/login' as any)}
              activeOpacity={0.8}
            >
              <Feather name="log-in" size={20} color={Colors.white} />
              <Text style={styles.loginRequiredButtonText}>{t('account.signIn')}</Text>
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
        colors={['#8B5CF6', '#6366F1']}
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
            <Text style={styles.userName}>{user?.displayName || 'User'}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
            <TouchableOpacity
              style={styles.editProfileButton}
              onPress={() => router.push('/profile/edit' as any)}
              activeOpacity={0.8}
            >
              <Feather name="edit-2" size={14} color="#8B5CF6" />
              <Text style={styles.editProfileButtonText}>{t('profile.editProfile')}</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('account.settings')}</Text>
          
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/(tabs)/orders' as any)}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemLeft}>
              <Feather name="package" size={22} color="#111827" />
              <Text style={styles.menuItemText}>{t('account.orders')}</Text>
            </View>
            <Feather name="chevron-right" size={20} color={Colors.gray[400]} />
          </TouchableOpacity>

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

          <TouchableOpacity 
            style={styles.menuItem} 
            activeOpacity={0.7}
            onPress={() => router.push('/wishlist' as any)}
          >
            <View style={styles.menuItemLeft}>
              <Feather name="heart" size={22} color="#111827" />
              <Text style={styles.menuItemText}>{t('account.wishlist')}</Text>
            </View>
            <Feather name="chevron-right" size={20} color={Colors.gray[400]} />
          </TouchableOpacity>

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
          <Text style={styles.sectionTitle}>{t('account.helpSupport')}</Text>
          
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

        <View style={styles.section}>
          <TouchableOpacity
            style={styles.menuItem}
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
                  'Sign Out',
                  'Are you sure you want to sign out?',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Sign Out', style: 'destructive', onPress: confirmSignOut }
                  ]
                );
              }
            }}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemLeft}>
              <Feather name="log-out" size={22} color={Colors.error} />
              <Text style={[styles.menuItemText, { color: Colors.error }]}>{t('account.logout')}</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>{t('account.version')}</Text>
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
          <View style={styles.helpMenuModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('account.helpSupport')}</Text>
              <TouchableOpacity 
                onPress={() => setShowHelpMenu(false)}
                style={{ padding: 4 }}
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
                <Feather name="headphones" size={22} color="#111827" />
                <Text style={styles.helpMenuItemText}>{t('profile.support')}</Text>
              </View>
              <Feather name="chevron-right" size={20} color={Colors.gray[400]} />
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
                <Feather name="help-circle" size={22} color="#111827" />
                <Text style={styles.helpMenuItemText}>{t('account.help')}</Text>
              </View>
              <Feather name="chevron-right" size={20} color={Colors.gray[400]} />
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
                <Feather name="info" size={22} color="#111827" />
                <Text style={styles.helpMenuItemText}>{t('account.about')}</Text>
              </View>
              <Feather name="chevron-right" size={20} color={Colors.gray[400]} />
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
                <Feather name="file-text" size={22} color="#111827" />
                <Text style={styles.helpMenuItemText}>{t('account.termsOfUse')}</Text>
              </View>
              <Feather name="chevron-right" size={20} color={Colors.gray[400]} />
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
                <Feather name="shield" size={22} color="#111827" />
                <Text style={styles.helpMenuItemText}>{t('account.privacyPolicy')}</Text>
              </View>
              <Feather name="chevron-right" size={20} color={Colors.gray[400]} />
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
    backgroundColor: '#F9FAFB',
  },
  gradientHeader: {
    paddingBottom: 16,
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
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: '#FFF',
  },
  scrollView: {
    flex: 1,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  userName: {
    fontSize: FontSizes.md,
    fontWeight: 'bold' as const,
    color: '#FFF',
    marginTop: 4,
  },
  userEmail: {
    fontSize: FontSizes.xs,
    color: '#F3F4F6',
    marginTop: 2,
  },
  section: {
    backgroundColor: Colors.white,
    marginBottom: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: '#9CA3AF',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    paddingTop: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
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
    fontSize: FontSizes.lg,
    color: '#111827',
    fontWeight: '500' as const,
  },
  valueText: {
    fontSize: FontSizes.sm,
    color: '#6B7280',
    marginRight: Spacing.xs,
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  versionText: {
    fontSize: FontSizes.xs,
    color: '#9CA3AF',
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
    backgroundColor: '#EEF2FF',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: Spacing.xs,
  },
  editProfileButtonText: {
    color: '#8B5CF6',
    fontSize: 12,
    fontWeight: '600' as const,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.md,
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: Spacing.lg,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  modalTitle: {
    fontSize: FontSizes.xl,
    fontWeight: 'bold' as const,
    color: '#111827',
    marginBottom: Spacing.md,
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
    paddingVertical: Spacing.md,
  },
  helpMenuModal: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: Spacing.lg,
    width: '100%',
    maxWidth: 400,
    maxHeight: '70%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  helpMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderRadius: 12,
    marginBottom: Spacing.xs,
  },
  helpMenuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  helpMenuItemText: {
    fontSize: FontSizes.md,
    color: '#111827',
    fontWeight: '500' as const,
  },
  notAuthenticatedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
    backgroundColor: '#F9FAFB',
  },
  notAuthenticatedContent: {
    alignItems: 'center',
    maxWidth: 400,
  },
  lockIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  notAuthenticatedTitle: {
    fontSize: FontSizes.xl,
    fontWeight: 'bold' as const,
    color: '#111827',
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  notAuthenticatedDescription: {
    fontSize: FontSizes.sm,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: Spacing.lg,
    lineHeight: 22,
  },
  loginRequiredButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  loginRequiredButtonText: {
    color: Colors.white,
    fontSize: FontSizes.md,
    fontWeight: 'bold' as const,
  },
});
