// faq.tsx - dummy content
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Colors, Spacing, FontSizes, BorderRadius } from '@/constants/theme';
import { useApp } from '@/contexts/AppContext';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQItemProps {
  item: FAQItem;
  isExpanded: boolean;
  onToggle: () => void;
}

const FAQItemComponent: React.FC<FAQItemProps> = ({ item, isExpanded, onToggle }) => {
  return (
    <TouchableOpacity
      style={styles.faqItem}
      onPress={onToggle}
      activeOpacity={0.8}
    >
      <View style={styles.questionContainer}>
        <View style={styles.questionTextContainer}>
          <Feather 
            name="help-circle" 
            size={20} 
            color={Colors.primary} 
            style={styles.questionIcon}
          />
          <Text style={styles.questionText}>{item.question}</Text>
        </View>
        <Feather
          name={isExpanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={Colors.text.secondary}
        />
      </View>
      {isExpanded && (
        <View style={styles.answerContainer}>
          <Text style={styles.answerText}>{item.answer}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default function FAQScreen() {
  const { t, language } = useApp();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const faqData: FAQItem[] = language === 'ar' ? [
    {
      question: 'ما هو ساب ستور؟',
      answer: 'ساب ستور هو تطبيق تسوق عبر الهاتف المحمول يربط العملاء بالبائعين الموثوقين في لبنان، ويوفر تجربة تصفح سلسة وتوصيل سريع وتحديثات في الوقت الفعلي.'
    },
    {
      question: 'كيف يمكنني تتبع طلبي؟',
      answer: 'يمكنك تتبع طلبك بسهولة من خلال قسم "طلباتي" في التطبيق. سيتم تحديث حالة طلبك في الوقت الفعلي، وستتلقى إشعارات في كل خطوة من خطوات عملية التسليم.'
    },
    {
      question: 'ما هي طرق الدفع المقبولة؟',
      answer: 'نقبل طرق دفع متعددة بما في ذلك الدفع عند الاستلام، وApple Pay، وOMT، وWish Money لراحتك وأمانك.'
    },
    {
      question: 'هل يمكنني إرجاع أو استبدال المنتجات؟',
      answer: 'نعم، الإرجاع والاستبدال متاحان وفقاً لسياسة كل متجر مشارك. يرجى التواصل مع فريق الدعم لدينا للمساعدة في أي استفسارات بخصوص الإرجاع.'
    },
    {
      question: 'كيف يمكنني التواصل مع خدمة العملاء؟',
      answer: 'يمكنك التواصل مع فريق الدعم لدينا عبر البريد الإلكتروني على support@sab-store.com. نحن هنا لمساعدتك في أي أسئلة أو مشاكل قد تواجهها.'
    },
    {
      question: 'هل بياناتي آمنة؟',
      answer: 'نعم، نحن نأخذ أمان البيانات على محمل الجد. جميع المعاملات آمنة ومحمية، ونحن نتبع أفضل ممارسات الصناعة لحماية معلوماتك الشخصية.'
    },
    {
      question: 'ما هي مناطق التوصيل المتاحة؟',
      answer: 'نقوم حالياً بالتوصيل إلى معظم المناطق في لبنان. يمكنك التحقق من توفر التوصيل في منطقتك عند إدخال عنوان التسليم الخاص بك أثناء عملية الدفع.'
    },
    {
      question: 'كم من الوقت يستغرق التوصيل؟',
      answer: 'عادة ما يستغرق التوصيل من 1-3 أيام عمل حسب موقعك وتوفر المنتج. ستتلقى وقت توصيل متوقع عند تأكيد طلبك.'
    },
    {
      question: 'هل يمكنني إلغاء طلبي؟',
      answer: 'نعم، يمكنك إلغاء طلبك قبل أن يتم شحنه. بمجرد شحن الطلب، ستحتاج إلى اتباع عملية الإرجاع بدلاً من ذلك. يرجى التواصل مع الدعم للحصول على المساعدة.'
    },
    {
      question: 'كيف يمكنني تغيير عنوان التسليم الخاص بي؟',
      answer: 'يمكنك تحديث عنوان التسليم الخاص بك في قسم "عناويني" ضمن إعدادات الحساب. إذا كنت بحاجة إلى تغيير العنوان لطلب موجود، يرجى التواصل مع الدعم على الفور.'
    },
  ] : [
    {
      question: 'What is Sab Store?',
      answer: 'Sab Store is a mobile shopping app that connects customers with trusted vendors in Lebanon, offering smooth browsing, fast delivery, and real-time updates.'
    },
    {
      question: 'How can I track my order?',
      answer: 'You can easily track your order through the "My Orders" section in the app. Your order status will be updated in real-time, and you\'ll receive notifications at each step of the delivery process.'
    },
    {
      question: 'What payment methods are accepted?',
      answer: 'We accept multiple payment methods including Cash on Delivery, Apple Pay, OMT, and Wish Money for your convenience and security.'
    },
    {
      question: 'Can I return or exchange products?',
      answer: 'Yes, returns and exchanges are available according to each participating store\'s policy. Please contact our support team for assistance with any return inquiries.'
    },
    {
      question: 'How do I contact customer service?',
      answer: 'You can reach our support team via email at support@sab-store.com. We\'re here to help with any questions or issues you may encounter.'
    },
    {
      question: 'Is my data secure?',
      answer: 'Yes, we take data security seriously. All transactions are secure and protected, and we follow industry best practices to safeguard your personal information.'
    },
    {
      question: 'What are the delivery areas available?',
      answer: 'We currently deliver to most areas in Lebanon. You can check delivery availability for your location when entering your delivery address during checkout.'
    },
    {
      question: 'How long does delivery take?',
      answer: 'Delivery typically takes 1-3 business days depending on your location and product availability. You\'ll receive an estimated delivery time when your order is confirmed.'
    },
    {
      question: 'Can I cancel my order?',
      answer: 'Yes, you can cancel your order before it has been shipped. Once the order is shipped, you\'ll need to follow the return process instead. Please contact support for assistance.'
    },
    {
      question: 'How can I change my delivery address?',
      answer: 'You can update your delivery address in the "My Addresses" section under Account settings. If you need to change the address for an existing order, please contact support immediately.'
    },
  ];

  const handleToggle = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <>
      <Stack.Screen 
        options={{
          title: language === 'ar' ? 'الأسئلة الشائعة' : 'FAQ',
          headerStyle: {
            backgroundColor: Colors.white,
          },
          headerTintColor: Colors.text.primary,
          headerShadowVisible: true,
        }}
      />
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <ScrollView 
          style={styles.scrollView} 
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerSection}>
            <View style={styles.iconContainer}>
              <Feather name="message-circle" size={48} color={Colors.primary} />
            </View>
            <Text style={styles.title}>
              {language === 'ar' ? 'الأسئلة الشائعة' : 'Frequently Asked Questions'}
            </Text>
            <Text style={styles.subtitle}>
              {language === 'ar' 
                ? 'ابحث عن إجابات للأسئلة الشائعة حول ساب ستور'
                : 'Find answers to common questions about Sab Store'
              }
            </Text>
          </View>

          <View style={styles.faqContainer}>
            {faqData.map((item, index) => (
              <FAQItemComponent
                key={index}
                item={item}
                isExpanded={expandedIndex === index}
                onToggle={() => handleToggle(index)}
              />
            ))}
          </View>

          <View style={styles.contactCard}>
            <Feather name="help-circle" size={32} color={Colors.primary} />
            <Text style={styles.contactTitle}>
              {language === 'ar' ? 'لا تجد ما تبحث عنه؟' : 'Can\'t find what you\'re looking for?'}
            </Text>
            <Text style={styles.contactDescription}>
              {language === 'ar'
                ? 'فريق الدعم لدينا جاهز لمساعدتك في أي أسئلة قد تكون لديك.'
                : 'Our support team is ready to help with any questions you may have.'
              }
            </Text>
            <View style={styles.contactEmailContainer}>
              <Feather name="mail" size={18} color={Colors.primary} />
              <Text style={styles.contactEmail}>support@sab-store.com</Text>
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              {language === 'ar' 
                ? '© 2025 ساب ستور. جميع الحقوق محفوظة.'
                : '© 2025 Sab Store. All rights reserved.'
              }
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: Spacing.xxl,
  },
  headerSection: {
    backgroundColor: Colors.white,
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
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
  title: {
    fontSize: FontSizes.xxxl,
    fontWeight: 'bold' as const,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FontSizes.md,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: FontSizes.md * 1.5,
  },
  faqContainer: {
    backgroundColor: Colors.white,
    marginBottom: Spacing.md,
  },
  faqItem: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  questionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
  },
  questionTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: Spacing.md,
  },
  questionIcon: {
    marginRight: Spacing.sm,
  },
  questionText: {
    fontSize: FontSizes.md,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    flex: 1,
    lineHeight: FontSizes.md * 1.4,
  },
  answerContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    paddingLeft: Spacing.lg + 28,
  },
  answerText: {
    fontSize: FontSizes.md,
    color: Colors.text.secondary,
    lineHeight: FontSizes.md * 1.6,
  },
  contactCard: {
    backgroundColor: Colors.primary + '10',
    padding: Spacing.xl,
    marginHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  contactTitle: {
    fontSize: FontSizes.xl,
    fontWeight: 'bold' as const,
    color: Colors.text.primary,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  contactDescription: {
    fontSize: FontSizes.md,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: FontSizes.md * 1.5,
    marginBottom: Spacing.md,
  },
  contactEmailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  contactEmail: {
    fontSize: FontSizes.md,
    color: Colors.primary,
    fontWeight: '600' as const,
    marginLeft: Spacing.xs,
  },
  footer: {
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
  },
  footerText: {
    fontSize: FontSizes.sm,
    color: Colors.text.secondary,
  },
});
