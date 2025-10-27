// OrderContext.tsx - dummy content
import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useMemo, useCallback } from 'react';
import type { Order, OrderAddress, OrderItem, PaymentMethod, OrderStatus } from '@/types';
import { getDocument, collections, createDocument, updateDocument, getUserOrders as fetchUserOrders } from '@/constants/firestore';
import { sendPushNotification } from '@/utils/notifications';
import { Platform } from 'react-native';
import { useAuth } from './AuthContext';

export const [OrderProvider, useOrders] = createContextHook(() => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.uid) {
      loadOrders(user.uid);
    } else {
      setOrders([]);
      setIsLoading(false);
    }
  }, [user?.uid]);

  const loadOrders = async (userId: string) => {
    try {
      setIsLoading(true);
      const userOrders = await fetchUserOrders(userId) as Order[];
      setOrders(userOrders);
      console.log('✅ Orders loaded from Firestore:', userOrders.length);
    } catch (error) {
      console.error('❌ Error loading orders from Firestore:', error);
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateOrderNumber = (): string => {
    const timestamp = Date.now();
    return `ORD-${timestamp}`;
  };

  const generateTrackingNumber = (): string => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000000);
    return `TRK${random}${timestamp.toString().slice(-5)}`;
  };

  const createOrder = useCallback(async (
    userId: string,
    items: OrderItem[],
    total: number,
    address: OrderAddress,
    paymentMethod: PaymentMethod
  ): Promise<Order> => {
    const now = new Date().toISOString();
    const estimatedDelivery = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    const orderNumber = generateOrderNumber();
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const orderData = {
      orderNumber,
      userId,
      items,
      total,
      address,
      paymentMethod,
      paymentStatus: 'pending' as const,
      status: 'pending' as const,
      trackingNumber: generateTrackingNumber(),
      estimatedDelivery,
      statusHistory: [
        {
          status: 'pending' as const,
          timestamp: now,
          description: {
            en: 'Order received and is being processed',
            ar: 'تم استلام طلبك وجاري معالجته',
          },
        },
      ],
    };

    const newOrder: Order = {
      id: orderId,
      ...orderData,
      createdAt: now,
      updatedAt: now,
    };

    try {
      await createDocument(collections.orders, orderData, orderId);
      console.log('✅ Order saved to Firestore:', orderId);
      
      const updatedOrders = [newOrder, ...orders];
      setOrders(updatedOrders);
    } catch (error) {
      console.error('❌ Error saving order to Firestore:', error);
      throw error;
    }

    if (Platform.OS !== 'web') {
      try {
        const userProfile = await getDocument(collections.users, userId);
        const pushToken = userProfile?.pushToken;
        
        if (pushToken) {
          await sendPushNotification(
            pushToken as string,
            '🎉 Order Placed Successfully',
            `Your order ${orderNumber} has been received and is being processed.`,
            {
              type: 'order_placed',
              orderId: newOrder.id,
              orderNumber,
            }
          );
          console.log('✅ Order confirmation notification sent');
        } else {
          console.log('⚠️ No push token found for user');
        }
      } catch (error) {
        console.error('❌ Error sending order notification:', error);
      }
    }

    return newOrder;
  }, [orders]);

  const updateOrderStatus = useCallback(async (orderId: string, newStatus: OrderStatus) => {
    const now = new Date().toISOString();
    
    const statusDescriptions: Record<OrderStatus, { en: string; ar: string }> = {
      pending: {
        en: 'Order received and is being processed',
        ar: 'تم استلام طلبك وجاري معالجته',
      },
      processing: {
        en: 'We are preparing your items for shipment',
        ar: 'نحن نحضر عناصرك للشحن',
      },
      shipped: {
        en: 'Your order is on its way to you',
        ar: 'طلبك في طريقه إليك',
      },
      out_for_delivery: {
        en: 'Your order is out for delivery',
        ar: 'طلبك خارج للتسليم',
      },
      delivered: {
        en: 'Your order has been delivered successfully',
        ar: 'تم تسليم طلبك بنجاح',
      },
      cancelled: {
        en: 'Your order has been cancelled',
        ar: 'تم إلغاء طلبك',
      },
    };

    const order = orders.find(o => o.id === orderId);
    if (!order) {
      console.error('Order not found:', orderId);
      return;
    }

    try {
      await updateDocument(collections.orders, orderId, {
        status: newStatus,
        updatedAt: now,
        statusHistory: [
          ...order.statusHistory,
          {
            status: newStatus,
            timestamp: now,
            description: statusDescriptions[newStatus],
          },
        ],
      });
      console.log('✅ Order status updated in Firestore:', orderId);

      const updatedOrders = orders.map((o) => {
        if (o.id === orderId) {
          return {
            ...o,
            status: newStatus,
            updatedAt: now,
            statusHistory: [
              ...o.statusHistory,
              {
                status: newStatus,
                timestamp: now,
                description: statusDescriptions[newStatus],
              },
            ],
          };
        }
        return o;
      });
      setOrders(updatedOrders);
    } catch (error) {
      console.error('❌ Error updating order status in Firestore:', error);
      throw error;
    }

    if (Platform.OS !== 'web') {
      try {
        const userProfile = await getDocument(collections.users, order.userId);
        const pushToken = userProfile?.pushToken;
        
        if (pushToken) {
          const statusEmojis: Record<OrderStatus, string> = {
            pending: '⏳',
            processing: '📦',
            shipped: '🚚',
            out_for_delivery: '🛵',
            delivered: '✅',
            cancelled: '❌',
          };

          await sendPushNotification(
            pushToken as string,
            `${statusEmojis[newStatus]} Order ${newStatus.replace('_', ' ').toUpperCase()}`,
            `Order ${order.orderNumber}: ${statusDescriptions[newStatus].en}`,
            {
              type: 'order_updated',
              orderId: order.id,
              orderNumber: order.orderNumber,
              status: newStatus,
            }
          );
          console.log('✅ Order status update notification sent');
        } else {
          console.log('⚠️ No push token found for user');
        }
      } catch (error) {
        console.error('❌ Error sending status update notification:', error);
      }
    }
  }, [orders]);

  const getOrderById = useCallback((orderId: string): Order | undefined => {
    return orders.find((order) => order.id === orderId);
  }, [orders]);

  const getUserOrders = useCallback((userId: string): Order[] => {
    return orders.filter((order) => order.userId === userId);
  }, [orders]);

  return useMemo(() => ({
    orders,
    isLoading,
    createOrder,
    updateOrderStatus,
    getOrderById,
    getUserOrders,
  }), [orders, isLoading, createOrder, updateOrderStatus, getOrderById, getUserOrders]);
});
