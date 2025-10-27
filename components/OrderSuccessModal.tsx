// OrderSuccessModal.tsx - dummy content
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Colors, Spacing, BorderRadius, FontSizes } from '@/constants/theme';
import { useApp } from '@/contexts/AppContext';

const { width } = Dimensions.get('window');

interface OrderSuccessModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function OrderSuccessModal({ visible, onClose }: OrderSuccessModalProps) {
  const { t } = useApp();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>🎉</Text>
          </View>

          <Text style={styles.title}>{t('order.successTitle')}</Text>
          <Text style={styles.subtitle}>{t('order.successMessage')}</Text>

          <View style={styles.emojiRow}>
            <Text style={styles.emoji}>✨</Text>
            <Text style={styles.emoji}>🎊</Text>
            <Text style={styles.emoji}>🎈</Text>
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>{t('common.continue')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  modalContainer: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xxl,
    width: width - 64,
    maxWidth: 400,
    alignItems: 'center',
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  icon: {
    fontSize: 60,
  },
  title: {
    fontSize: FontSizes.xxl,
    fontWeight: 'bold' as const,
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: FontSizes.md,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  emojiRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  emoji: {
    fontSize: 32,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    width: '100%',
  },
  buttonText: {
    fontSize: FontSizes.lg,
    fontWeight: 'bold' as const,
    color: Colors.white,
    textAlign: 'center',
  },
});
