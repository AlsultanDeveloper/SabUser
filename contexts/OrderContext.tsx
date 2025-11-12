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
      // Load both SAB Store and SAB Market orders
      const { getAllUserOrders } = await import('@/constants/firestore');
      const allOrders = await getAllUserOrders(userId) as Order[];
      setOrders(allOrders);
      console.log('✅ All orders loaded from Firestore:', allOrders.length);
      console.log('   - SAB Store orders:', allOrders.filter((o: any) => !o.isSabMarket).length);
      console.log('   - SAB Market orders:', allOrders.filter((o: any) => o.isSabMarket).length);
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
    paymentMethod: PaymentMethod,
    isSabMarket?: boolean // ✅ Add SAB Market flag
  ): Promise<Order> => {
    const now = new Date().toISOString();
    
    // ✅ SAB Market: 30 minutes delivery | SAB Store: 20 days delivery
    const estimatedDelivery = isSabMarket 
      ? new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 minutes
      : new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(); // 20 days
    
    const orderNumber = generateOrderNumber();
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Clean address object - remove undefined values
    const cleanAddress: any = {
      fullName: address.fullName,
      phoneNumber: address.phoneNumber,
      address: address.address,
      city: address.city,
      postalCode: address.postalCode || '',
      country: address.country || 'Lebanon',
    };

    // Only add coordinates if they exist
    if (address.latitude != null && address.longitude != null) {
      cleanAddress.latitude = address.latitude;
      cleanAddress.longitude = address.longitude;
    }

    // Clean items - remove undefined values from product objects
    const cleanItems = items.map(item => {
      // Create clean product object without undefined values
      const cleanProduct: any = {
        id: item.product.id,
        name: item.product.name,
        description: item.product.description,
        price: item.product.price,
        image: item.product.image,
        images: item.product.images || [],
        category: item.product.category,
        brand: item.product.brand,
        rating: item.product.rating || 0,
        reviews: item.product.reviews || 0,
        inStock: item.product.inStock ?? true,
      };

      // Only add optional fields if they exist
      if (item.product.brandId) cleanProduct.brandId = item.product.brandId;
      if (item.product.discount != null) cleanProduct.discount = item.product.discount;
      if (item.product.brandName) cleanProduct.brandName = item.product.brandName;
      if (item.product.categoryName) cleanProduct.categoryName = item.product.categoryName;
      if (item.product.subcategoryName) cleanProduct.subcategoryName = item.product.subcategoryName;
      if (item.product.colors) cleanProduct.colors = item.product.colors;
      if (item.product.sizes) cleanProduct.sizes = item.product.sizes;
      if (item.product.shoeSizes) cleanProduct.shoeSizes = item.product.shoeSizes;
      if (item.product.ageRange) cleanProduct.ageRange = item.product.ageRange;

      // Build clean item object
      const cleanItem: any = {
        product: cleanProduct,
        quantity: item.quantity,
        price: item.price,
      };

      // Add selected options if they exist
      if ((item as any).selectedSize) cleanItem.selectedSize = (item as any).selectedSize;
      if ((item as any).selectedColor) cleanItem.selectedColor = (item as any).selectedColor;
      if ((item as any).selectedAge) cleanItem.selectedAge = (item as any).selectedAge;

      return cleanItem;
    });

    const orderData = {
      orderNumber,
      userId,
      items: cleanItems,
      total,
      address: cleanAddress,
      paymentMethod,
      paymentStatus: 'pending' as const,
      status: 'pending' as const,
      trackingNumber: generateTrackingNumber(),
      estimatedDelivery,
      ...(isSabMarket && { 
        isSabMarket: true,
        deliveryType: 'express', // 30 minutes
      }),
      statusHistory: [
        {
          status: 'pending' as const,
          timestamp: now,
          description: isSabMarket ? {
            en: 'Order received - Express delivery in 30 minutes',
            ar: 'تم استلام الطلب - توصيل سريع خلال 30 دقيقة',
          } : {
            en: 'Order received and is being processed',
            ar: 'طلبكن وصل و شغالين عليه بس يوصل على باب البيت منتصل فيكن',
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
      // ✅ Save to appropriate collection based on order type
      const targetCollection = isSabMarket ? collections.marketOrders : collections.orders;
      await createDocument(targetCollection, orderData, orderId);
      console.log(`✅ Order saved to Firestore (${isSabMarket ? 'SAB Market' : 'SAB Store'}):`, orderId);
      
      const updatedOrders = [newOrder, ...orders];
      setOrders(updatedOrders);

      // Create notification in Firestore
      try {
        const notificationData = {
          userId,
          orderId: newOrder.id,
          type: 'order',
          title: isSabMarket ? 'SAB Market Order Placed! 🎉' : 'Order Placed Successfully! 🎉',
          message: isSabMarket ? {
            en: `Your SAB Market order ${orderNumber} has been confirmed - Delivery in 30 minutes!`,
            ar: `تم تأكيد طلبك من ساب ماركت ${orderNumber} - التوصيل خلال 30 دقيقة!`,
          } : {
            en: `Your order ${orderNumber} has been confirmed and is being processed.`,
            ar: `تم تأكيد طلبك ${orderNumber} وجاري معالجته.`,
          },
          read: false,
          createdAt: new Date(),
          ...(isSabMarket && { isSabMarket: true }),
        };
        
        await createDocument(collections.userNotifications, notificationData);
        console.log('✅ Order notification saved to Firestore');
      } catch (notifError) {
        console.error('❌ Error saving notification to Firestore:', notifError);
      }
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
            isSabMarket ? '🎉 SAB Market Order Placed!' : '🎉 Order Placed Successfully',
            isSabMarket 
              ? `Your SAB Market order ${orderNumber} will arrive in 30 minutes!`
              : `Your order ${orderNumber} has been received and is being processed.`,
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
        ar: 'طلبكن وصل و شغالين عليه بس يوصل على باب البيت منتصل فيكن',
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
