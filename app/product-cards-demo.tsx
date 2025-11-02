import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, FontSizes, FontWeights } from '@/constants/theme';
import AmazonStyleProductCard from '@/components/AmazonStyleProductCard';

// بيانات المنتجات التجريبية - تم حذف المنتجات الوهمية
const sampleProducts: any[] = [];

export default function ProductCardsDemo() {
  const router = useRouter();
  const [language, setLanguage] = useState('ar');
  const [wishlist, setWishlist] = useState<string[]>([]);

  const formatPrice = (price: number) => {
    if (language === 'ar') {
      return `${price.toFixed(2)} ريال`;
    }
    return `$${price.toFixed(2)}`;
  };

  const handleProductPress = (product: any) => {
    console.log('Product pressed:', product.name);
    // يمكنك هنا التنقل إلى صفحة تفاصيل المنتج
  };

  const handleToggleWishlist = (productId: string) => {
    setWishlist(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'ar' ? 'en' : 'ar');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {language === 'ar' ? 'تصفح منتجاتنا' : 'Browse our products'}
        </Text>
        <TouchableOpacity onPress={toggleLanguage}>
          <Text style={styles.langButton}>
            {language === 'ar' ? 'EN' : 'عربي'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        
        {/* Amazon Style Cards - الأفضل على الإطلاق! */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {language === 'ar' ? 'منتجاتنا المميزة' : 'Our Featured Products'}
          </Text>
          
          {/* عرض المنتجات - تم حذف المنتجات الوهمية */}
          <View style={styles.cardsRow}>
            {sampleProducts.slice(0, 2).map((product) => (
              <AmazonStyleProductCard
                key={product.id}
                product={product}
                onPress={() => handleProductPress(product)}
                formatPrice={formatPrice}
                language={language}
                onToggleWishlist={handleToggleWishlist}
                isInWishlist={wishlist.includes(product.id)}
              />
            ))}
          </View>
          
          {/* الصف الثاني */}
          <View style={styles.cardsRow}>
            {sampleProducts.slice(2, 4).map((product) => (
              <AmazonStyleProductCard
                key={product.id}
                product={product}
                onPress={() => handleProductPress(product)}
                formatPrice={formatPrice}
                language={language}
                onToggleWishlist={handleToggleWishlist}
                isInWishlist={wishlist.includes(product.id)}
              />
            ))}
          </View>
        </View>

        {/* معلومات إضافية */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>
            {language === 'ar' ? '⭐ لماذا نحن الأفضل؟' : '⭐ Why Choose Us?'}
          </Text>
          <Text style={styles.infoText}>
            {language === 'ar' 
              ? '🎯 تصميم احترافي وأنيق\n✨ تجربة تسوق ممتعة\n❤️ إضافة للمفضلة بسهولة\n⭐ تقييمات العملاء الحقيقية\n💰 أسعار تنافسية مع خصومات\n🚚 شحن مجاني على جميع المنتجات\n📱 تجربة تفاعلية متطورة'
              : '🎯 Professional and elegant design\n✨ Enjoyable shopping experience\n❤️ Easy wishlist management\n⭐ Real customer reviews\n💰 Competitive prices with discounts\n🚚 Free shipping on all products\n📱 Advanced interactive experience'
            }
          </Text>
        </View>

        <View style={{ height: 50 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
    backgroundColor: Colors.surface,
  },
  headerTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    color: Colors.text.primary,
  },
  langButton: {
    fontSize: FontSizes.sm,
    color: Colors.primary,
    fontWeight: FontWeights.semibold,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.primary + '15',
    borderRadius: BorderRadius.md,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  cardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.md,
    marginBottom: Spacing.xs, // مسافة أقل بين الصفوف
  },
  infoSection: {
    margin: Spacing.md,
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  infoTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  infoText: {
    fontSize: FontSizes.sm,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
});