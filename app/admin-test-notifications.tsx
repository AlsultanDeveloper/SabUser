// admin-test-notifications.tsx - dummy content
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { useState } from 'react';
import { Colors, Spacing } from '@/constants/theme';
import { useOrders } from '@/contexts/OrderContext';
import { useAuth } from '@/contexts/AuthContext';
import { notifyUserAboutOrderUpdate, sendBulkNotificationToAllUsers } from '@/utils/admin-notifications';
import type { OrderStatus } from '@/types';

export default function AdminTestNotificationsScreen() {
  const { orders, updateOrderStatus } = useOrders();
  const { user } = useAuth();
  const [customTitle, setCustomTitle] = useState('');
  const [customBody, setCustomBody] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpdateOrderStatus = async (orderId: string, orderNumber: string, newStatus: OrderStatus) => {
    setLoading(true);
    try {
      await updateOrderStatus(orderId, newStatus);
      Alert.alert('Success', `Order ${orderNumber} updated to ${newStatus}. Notification sent!`);
    } catch (err) {
      console.error('Error updating order status:', err);
      Alert.alert('Error', 'Failed to update order status');
    } finally {
      setLoading(false);
    }
  };

  const handleSendCustomNotification = async (orderId: string, orderNumber: string) => {
    if (!customTitle || !customBody) {
      Alert.alert('Error', 'Please enter title and body');
      return;
    }

    setLoading(true);
    try {
      await notifyUserAboutOrderUpdate(orderId, customTitle, customBody);
      Alert.alert('Success', `Custom notification sent for order ${orderNumber}`);
      setCustomTitle('');
      setCustomBody('');
    } catch (err) {
      console.error('Error sending custom notification:', err);
      Alert.alert('Error', 'Failed to send notification');
    } finally {
      setLoading(false);
    }
  };

  const handleSendBulkNotification = async () => {
    if (!customTitle || !customBody) {
      Alert.alert('Error', 'Please enter title and body');
      return;
    }

    setLoading(true);
    try {
      await sendBulkNotificationToAllUsers(customTitle, customBody);
      Alert.alert('Success', 'Bulk notification sent to all users!');
      setCustomTitle('');
      setCustomBody('');
    } catch (err) {
      console.error('Error sending bulk notification:', err);
      Alert.alert('Error', 'Failed to send bulk notification');
    } finally {
      setLoading(false);
    }
  };

  const userOrders = user ? orders.filter(o => o.userId === user.uid) : [];

  return (
    <>
      <Stack.Screen 
        options={{ 
          headerShown: true,
          title: 'Test Notifications',
          presentation: 'modal',
        }} 
      />
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📬 Admin Notification Testing</Text>
            <Text style={styles.description}>
              Use this screen to test push notifications. Update order statuses or send custom notifications.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🛍️ Your Test Orders</Text>
            {userOrders.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No orders yet. Place an order first!</Text>
                <TouchableOpacity 
                  style={styles.button}
                  onPress={() => router.push('/(tabs)/home')}
                >
                  <Text style={styles.buttonText}>Go to Home</Text>
                </TouchableOpacity>
              </View>
            ) : (
              userOrders.map(order => (
                <View key={order.id} style={styles.orderCard}>
                  <View style={styles.orderHeader}>
                    <Text style={styles.orderNumber}>{order.orderNumber}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
                      <Text style={styles.statusText}>{order.status.toUpperCase()}</Text>
                    </View>
                  </View>

                  <Text style={styles.orderTotal}>${order.total.toFixed(2)}</Text>

                  <Text style={styles.label}>Update Status:</Text>
                  <View style={styles.statusButtons}>
                    <TouchableOpacity 
                      style={[styles.smallButton, order.status === 'pending' && styles.disabledButton]}
                      onPress={() => handleUpdateOrderStatus(order.id, order.orderNumber, 'processing')}
                      disabled={loading || order.status !== 'pending'}
                    >
                      <Text style={styles.smallButtonText}>📦 Processing</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      style={[styles.smallButton, order.status !== 'processing' && styles.disabledButton]}
                      onPress={() => handleUpdateOrderStatus(order.id, order.orderNumber, 'shipped')}
                      disabled={loading || order.status !== 'processing'}
                    >
                      <Text style={styles.smallButtonText}>🚚 Shipped</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      style={[styles.smallButton, order.status !== 'shipped' && styles.disabledButton]}
                      onPress={() => handleUpdateOrderStatus(order.id, order.orderNumber, 'out_for_delivery')}
                      disabled={loading || order.status !== 'shipped'}
                    >
                      <Text style={styles.smallButtonText}>🛵 Out for Delivery</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      style={[styles.smallButton, order.status !== 'out_for_delivery' && styles.disabledButton]}
                      onPress={() => handleUpdateOrderStatus(order.id, order.orderNumber, 'delivered')}
                      disabled={loading || order.status !== 'out_for_delivery'}
                    >
                      <Text style={styles.smallButtonText}>✅ Delivered</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>

          {userOrders.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>✉️ Send Custom Notification</Text>
              
              <Text style={styles.label}>Title</Text>
              <TextInput
                style={styles.input}
                value={customTitle}
                onChangeText={setCustomTitle}
                placeholder="e.g., Package Update"
                placeholderTextColor={Colors.text.secondary}
              />

              <Text style={styles.label}>Message</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={customBody}
                onChangeText={setCustomBody}
                placeholder="e.g., Your package has arrived at the distribution center"
                placeholderTextColor={Colors.text.secondary}
                multiline
                numberOfLines={3}
              />

              <TouchableOpacity 
                style={[styles.button, (!customTitle || !customBody || loading) && styles.disabledButton]}
                onPress={() => handleSendCustomNotification(userOrders[0].id, userOrders[0].orderNumber)}
                disabled={!customTitle || !customBody || loading}
              >
                <Text style={styles.buttonText}>
                  Send to First Order User
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.button, styles.bulkButton, (!customTitle || !customBody || loading) && styles.disabledButton]}
                onPress={handleSendBulkNotification}
                disabled={!customTitle || !customBody || loading}
              >
                <Text style={styles.buttonText}>
                  Send to All Users (Bulk)
                </Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📝 Instructions</Text>
            <Text style={styles.instruction}>
              1. Place an order from the home screen{'\n'}
              2. Come back here to test order status updates{'\n'}
              3. Each status update sends a push notification{'\n'}
              4. Test custom notifications using the form above{'\n'}
              5. Check your notification tray to see them!
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

function getStatusColor(status: OrderStatus): string {
  const colors: Record<OrderStatus, string> = {
    pending: '#FFA500',
    processing: '#4A90E2',
    shipped: '#9B59B6',
    out_for_delivery: '#3498DB',
    delivered: '#2ECC71',
    cancelled: '#E74C3C',
  };
  return colors[status];
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  description: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  orderCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text.primary,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: '#FFF',
  },
  orderTotal: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.primary,
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
    marginTop: Spacing.sm,
  },
  statusButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  smallButton: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.primary,
    padding: Spacing.sm,
    borderRadius: 8,
    alignItems: 'center',
  },
  smallButtonText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#FFF',
  },
  input: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: Spacing.md,
    fontSize: 14,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border.default,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: Colors.primary,
    padding: Spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  bulkButton: {
    backgroundColor: '#E74C3C',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFF',
  },
  disabledButton: {
    opacity: 0.5,
  },
  emptyState: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: Spacing.md,
  },
  instruction: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 22,
  },
});
