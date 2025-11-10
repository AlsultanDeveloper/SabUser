/**
 * Update Manager - إدارة التحديثات الهوائية (OTA Updates)
 * يتعامل مع تحديثات Expo Updates تلقائياً
 */

import * as Updates from 'expo-updates';
import { Platform, Alert } from 'react-native';

/**
 * التحقق من وجود تحديثات متاحة
 */
export async function checkForUpdates(showAlert: boolean = true): Promise<boolean> {
  try {
    // التحقق من أن التطبيق يعمل في بيئة إنتاجية (ليس في Expo Go)
    if (!Updates.isEnabled) {
      console.log('⚠️ Updates are not enabled (likely running in Expo Go or development)');
      
      if (showAlert) {
        Alert.alert(
          'تطوير',
          'التحديثات الهوائية غير متاحة في وضع التطوير. ستعمل تلقائياً في التطبيق المنشور.'
        );
      }
      return false;
    }

    // ✅ التحقق من أن التطبيق في وضع الإنتاج
    if (__DEV__) {
      console.log('⚠️ Updates not available in development mode');
      
      if (showAlert) {
        Alert.alert(
          'وضع التطوير',
          'التحديثات التلقائية تعمل فقط في النسخة المنشورة من التطبيق.\n\nللاختبار، استخدم:\neas build --profile preview'
        );
      }
      return false;
    }

    console.log('🔍 Checking for updates...');
    
    const update = await Updates.checkForUpdateAsync();
    
    if (update.isAvailable) {
      console.log('✅ Update available!');
      
      if (showAlert) {
        Alert.alert(
          'تحديث متاح',
          'يتوفر إصدار جديد من التطبيق. هل تريد التحديث الآن؟',
          [
            {
              text: 'لاحقاً',
              style: 'cancel'
            },
            {
              text: 'تحديث',
              onPress: async () => {
                await downloadAndApplyUpdate();
              }
            }
          ]
        );
      }
      
      return true;
    } else {
      console.log('✅ App is up to date');
      
      if (showAlert) {
        Alert.alert(
          'التطبيق محدّث',
          'أنت تستخدم أحدث إصدار من التطبيق'
        );
      }
      
      return false;
    }
  } catch (error: any) {
    console.error('❌ Error checking for updates:', error);
    
    // ✅ تجاهل أخطاء التطوير
    if (error?.message?.includes('not supported in development')) {
      console.log('💡 Updates only work in production builds');
      return false;
    }
    
    if (showAlert) {
      Alert.alert(
        'خطأ',
        'حدث خطأ أثناء التحقق من التحديثات. يرجى المحاولة لاحقاً.'
      );
    }
    
    return false;
  }
}

/**
 * تنزيل وتطبيق التحديث
 */
export async function downloadAndApplyUpdate(): Promise<void> {
  try {
    if (!Updates.isEnabled) {
      console.log('⚠️ Updates are not enabled');
      return;
    }

    // ✅ التحقق من وضع التطوير
    if (__DEV__) {
      console.log('⚠️ Cannot download updates in development mode');
      return;
    }

    console.log('📥 Downloading update...');
    
    const update = await Updates.fetchUpdateAsync();
    
    if (update.isNew) {
      console.log('✅ Update downloaded successfully');
      
      Alert.alert(
        'تم تنزيل التحديث',
        'سيتم إعادة تشغيل التطبيق الآن لتطبيق التحديث',
        [
          {
            text: 'موافق',
            onPress: async () => {
              await Updates.reloadAsync();
            }
          }
        ]
      );
    } else {
      console.log('⚠️ No new update found');
      Alert.alert('معلومة', 'لا يوجد تحديث جديد حالياً');
    }
  } catch (error: any) {
    console.error('❌ Error downloading update:', error);
    
    // ✅ تجاهل أخطاء التطوير
    if (error?.message?.includes('not supported in development')) {
      console.log('💡 Updates only work in production builds');
      return;
    }
    
    Alert.alert(
      'خطأ',
      'حدث خطأ أثناء تنزيل التحديث. يرجى المحاولة لاحقاً.'
    );
  }
}

/**
 * التحقق التلقائي من التحديثات عند فتح التطبيق
 */
export async function autoCheckForUpdates(): Promise<void> {
  try {
    if (!Updates.isEnabled) {
      console.log('⚠️ Updates disabled - skipping auto check (Development/Expo Go)');
      return;
    }

    // ✅ التحقق من أن التطبيق في وضع الإنتاج
    if (__DEV__) {
      console.log('⚠️ Updates not available in development mode');
      return;
    }

    console.log('🔄 Auto-checking for updates...');
    
    const update = await Updates.checkForUpdateAsync();
    
    if (update.isAvailable) {
      console.log('📥 Auto-downloading update in background...');
      
      // تنزيل التحديث في الخلفية
      await Updates.fetchUpdateAsync();
      
      // إظهار إشعار للمستخدم
      Alert.alert(
        'تحديث جاهز',
        'تم تنزيل إصدار جديد من التطبيق. سيتم تطبيقه عند إعادة فتح التطبيق.\n\nهل تريد إعادة التشغيل الآن؟',
        [
          {
            text: 'لاحقاً',
            style: 'cancel'
          },
          {
            text: 'إعادة التشغيل',
            onPress: async () => {
              await Updates.reloadAsync();
            }
          }
        ]
      );
    }
  } catch (error: any) {
    // ✅ تجاهل أخطاء التطوير بشكل صامت
    if (error?.message?.includes('not supported in development')) {
      console.log('💡 Updates only work in production builds (eas build)');
      return;
    }
    
    console.error('❌ Error in auto-check:', error);
    // لا نعرض alert للمستخدم في حالة الفحص التلقائي
  }
}

/**
 * الحصول على معلومات التحديث الحالي
 */
export function getCurrentUpdateInfo() {
  if (!Updates.isEnabled) {
    return {
      isEnabled: false,
      updateId: null,
      createdAt: null,
      runtimeVersion: null,
      manifest: null,
      channel: null
    };
  }

  return {
    isEnabled: true,
    updateId: Updates.updateId,
    createdAt: Updates.createdAt,
    runtimeVersion: Updates.runtimeVersion,
    manifest: Updates.manifest,
    channel: Updates.channel
  };
}

/**
 * طباعة معلومات التحديث في Console
 */
export function logUpdateInfo() {
  const info = getCurrentUpdateInfo();
  
  console.log('📱 Update Information:');
  console.log('  - Updates Enabled:', info.isEnabled);
  
  if (info.isEnabled) {
    console.log('  - Update ID:', info.updateId);
    console.log('  - Created At:', info.createdAt);
    console.log('  - Runtime Version:', info.runtimeVersion);
    console.log('  - Channel:', info.channel);
  }
}
