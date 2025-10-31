# حل مشكلة الكيبورد يغطي حقل النص في صفحة الدعم
# Fix for Keyboard Covering Text Input in Support Screen

## المشكلة | The Problem

عند كتابة رسالة في صفحة الدعم (Contact Support)، كان الكيبورد **يغطي حقل النص** ولا يمكن رؤية ما يُكتب.

When typing a message in the Contact Support screen, the keyboard **was covering the text input** and you couldn't see what you were typing.

---

## السبب | The Root Cause

الصفحة كانت تستخدم `ScrollView` فقط **بدون `KeyboardAvoidingView`**، مما يعني أن الكيبورد لا يدفع المحتوى للأعلى.

The screen was using only `ScrollView` **without `KeyboardAvoidingView`**, which means the keyboard doesn't push the content up.

### الكود القديم (المشكلة):

```tsx
// ❌ BEFORE - No KeyboardAvoidingView
return (
  <SafeAreaView style={styles.safeArea}>
    <View style={styles.header}>...</View>
    
    <ScrollView style={styles.content}>
      {/* محتوى الصفحة */}
      <TextInput 
        style={styles.textArea}
        multiline
        // ❌ الكيبورد يغطيه!
      />
    </ScrollView>
  </SafeAreaView>
);
```

**النتيجة:**
- عند فتح الكيبورد → يغطي حقل النص ❌
- لا يمكن رؤية ما تكتب ❌
- تجربة مستخدم سيئة ❌

---

## الحل | The Solution

تم إضافة **`KeyboardAvoidingView`** لدفع المحتوى للأعلى عند ظهور الكيبورد:

Added **`KeyboardAvoidingView`** to push content up when keyboard appears:

### الكود الجديد (الحل):

```tsx
// ✅ AFTER - With KeyboardAvoidingView
import { KeyboardAvoidingView, Platform } from 'react-native';

return (
  <SafeAreaView style={styles.safeArea}>
    <View style={styles.header}>...</View>
    
    {/* ✅ KeyboardAvoidingView يدفع المحتوى للأعلى */}
    <KeyboardAvoidingView
      style={styles.keyboardAvoidingView}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView 
        style={styles.content}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContentContainer}
      >
        {/* محتوى الصفحة */}
        <TextInput 
          style={styles.textArea}
          multiline
          // ✅ الآن يمكن رؤيته!
        />
      </ScrollView>
    </KeyboardAvoidingView>
  </SafeAreaView>
);
```

---

## كيف يعمل | How It Works

### قبل الإصلاح (المشكلة):
```
┌─────────────────────┐
│ الهيدر              │
├─────────────────────┤
│ طرق التواصل         │
│ (اتصال، بريد...)   │
├─────────────────────┤
│ النموذج            │
│ ┌─────────────────┐ │
│ │ الاسم          │ │
│ ├─────────────────┤ │
│ │ البريد         │ │
│ ├─────────────────┤ │
│ │ الرسالة...     │ │ ← عند النقر هنا
│ └─────────────────┘ │
└─────────────────────┘
        ↓
┌─────────────────────┐
│ الهيدر              │
├─────────────────────┤
│ طرق التواصل         │
█████████████████████  ← الكيبورد يغطي النص! ❌
█████████████████████
█████████████████████
```

### بعد الإصلاح (الحل):
```
عند النقر على حقل الرسالة:
        ↓
┌─────────────────────┐
│ الرسالة...         │ ← يظهر في الأعلى ✅
├─────────────────────┤
│ زر الإرسال         │
├─────────────────────┤
█████████████████████  ← الكيبورد
█████████████████████
█████████████████████

الآن يمكن رؤية ما تكتب! ✅
```

---

## ما تم تغييره | What Changed

### 1. إضافة `KeyboardAvoidingView`

```typescript
// ملف: app/contact-support.tsx

// Import
import { KeyboardAvoidingView, Platform } from 'react-native';

// في الـ JSX
<KeyboardAvoidingView
  style={styles.keyboardAvoidingView}
  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
  keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
>
  <ScrollView>
    {/* المحتوى */}
  </ScrollView>
</KeyboardAvoidingView>
```

### 2. إضافة خصائص للـ ScrollView

```typescript
<ScrollView 
  style={styles.content}
  showsVerticalScrollIndicator={false}
  keyboardShouldPersistTaps="handled"        // جديد ✅
  contentContainerStyle={styles.scrollContentContainer}  // جديد ✅
>
```

**الفوائد:**
- `keyboardShouldPersistTaps="handled"` → السماح بالنقر على الأزرار حتى مع فتح الكيبورد
- `contentContainerStyle` → إضافة padding في الأسفل لراحة أكبر

### 3. إضافة Styles الجديدة

```typescript
const styles = StyleSheet.create({
  // ... الـ styles القديمة
  
  // ✅ جديد
  keyboardAvoidingView: {
    flex: 1,
  },
  
  // ✅ جديد
  scrollContentContainer: {
    flexGrow: 1,
    paddingBottom: Platform.OS === 'ios' ? Spacing.xl : Spacing.xxl,
  },
});
```

---

## التأثير | Impact

### ✅ ما يعمل الآن:

1. **رؤية واضحة لحقل النص**
   - عند النقر على حقل الرسالة → يظهر فوق الكيبورد
   - يمكن رؤية كل ما تكتبه

2. **تجربة مستخدم محسّنة**
   - الصفحة تتحرك بسلاسة مع الكيبورد
   - لا حاجة للتمرير يدوياً

3. **يعمل على جميع المنصات**
   - ✅ iOS (يستخدم `padding`)
   - ✅ Android (يستخدم `height`)
   - ✅ Web (لا تأثير، الكيبورد افتراضي)

---

## الاختبار | Testing

### كيفية الاختبار:

1. **افتح صفحة "اتصل بالدعم"**
   ```bash
   npx expo start
   # افتح التطبيق → اذهب للبروفايل → اتصل بالدعم
   ```

2. **انزل للأسفل** حتى ترى نموذج "إرسال رسالة"

3. **انقر على حقل "الرسالة"**

4. **تحقق:**
   - ✅ الكيبورد يظهر
   - ✅ حقل الرسالة يظهر فوق الكيبورد
   - ✅ يمكن رؤية ما تكتبه
   - ✅ زر "إرسال الرسالة" يبقى ظاهراً

---

## خصائص KeyboardAvoidingView المستخدمة

### `behavior`
```typescript
behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
```

**iOS:** يستخدم `padding` (يضيف padding للأسفل)
**Android:** يستخدم `height` (يغير ارتفاع الـ View)

### `keyboardVerticalOffset`
```typescript
keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
```

**الغرض:** تعديل المسافة بين الكيبورد والمحتوى
- iOS: 0 (لا حاجة لتعديل)
- Android: 20 (تعديل بسيط)

### `style`
```typescript
style={styles.keyboardAvoidingView}
```

**الغرض:** جعل الـ View يأخذ المساحة الكاملة (`flex: 1`)

---

## ملاحظات مهمة | Important Notes

### على iOS:
✅ **يعمل بشكل ممتاز:**
- الكيبورد يدفع المحتوى بسلاسة
- لا توجد مشاكل في التمرير

### على Android:
✅ **يعمل بشكل جيد:**
- الكيبورد يعدل ارتفاع الصفحة
- قد تحتاج لضبط `keyboardVerticalOffset` حسب الجهاز

### على Web:
✅ **لا تأثير:**
- الكيبورد الافتراضي للمتصفح
- لا حاجة لـ KeyboardAvoidingView

---

## استكشاف الأخطاء | Troubleshooting

### المشكلة: "الكيبورد لا يزال يغطي النص"

**الحلول:**

1. **جرب تغيير `behavior`:**
   ```typescript
   // جرب 'position' بدلاً من 'padding'
   behavior={Platform.OS === 'ios' ? 'position' : 'height'}
   ```

2. **اضبط `keyboardVerticalOffset`:**
   ```typescript
   // زد القيمة إذا كان الكيبورد قريب جداً
   keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 40}
   ```

3. **تأكد من الـ ScrollView:**
   ```typescript
   // تأكد أن contentContainerStyle موجود
   contentContainerStyle={styles.scrollContentContainer}
   ```

---

### المشكلة: "الصفحة تتحرك كثيراً"

**الحل:**
```typescript
// قلل padding في scrollContentContainer
scrollContentContainer: {
  flexGrow: 1,
  paddingBottom: Spacing.md, // بدلاً من Spacing.xxl
},
```

---

## مقارنة قبل وبعد | Before/After Comparison

### قبل (Before):
❌ الكيبورد يغطي حقل النص
❌ لا يمكن رؤية ما تكتب
❌ تحتاج للتمرير يدوياً (وأحياناً لا ينفع)

### بعد (After):
✅ حقل النص يظهر فوق الكيبورد
✅ رؤية واضحة لما تكتب
✅ تجربة مستخدم سلسة وسهلة

---

## الملفات المعدّلة | Modified Files

### 1. `app/contact-support.tsx`
- ✅ إضافة import `KeyboardAvoidingView`
- ✅ إضافة `KeyboardAvoidingView` wrapper
- ✅ تحديث ScrollView props
- ✅ إضافة styles جديدة

---

## المراجع | References

- [React Native KeyboardAvoidingView](https://reactnative.dev/docs/keyboardavoidingview)
- [ScrollView with Keyboard](https://reactnative.dev/docs/scrollview#keyboardshouldpersisttaps)
- [Platform-specific Code](https://reactnative.dev/docs/platform-specific-code)

---

## الخلاصة | Summary

### قبل:
❌ الكيبورد يغطي النص في صفحة الدعم

### بعد:
✅ الكيبورد يدفع المحتوى للأعلى
✅ رؤية واضحة لحقل النص
✅ تجربة مستخدم محسّنة

---

**تاريخ الإصلاح:** 31 أكتوبر 2025
**الحالة:** ✅ تم الإصلاح والاختبار
