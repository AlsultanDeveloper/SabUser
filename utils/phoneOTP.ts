/**
 * Phone OTP Authentication Service
 * خدمة تسجيل الدخول عبر رمز التحقق المرسل بـ Push Notification
 */

import { httpsCallable } from 'firebase/functions';
import { functions } from '@/constants/firebase';
import { registerForPushNotificationsAsync } from '@/constants/notifications';
import { Platform } from 'react-native';

/**
 * إرسال OTP عبر Push Notification
 */
export async function sendPhoneOTP(phoneNumber: string): Promise<{
  success: boolean;
  error?: string;
  expiresIn?: number;
}> {
  try {
    console.log('📱 Requesting OTP for phone:', phoneNumber);

    // الحصول على Push Token باستخدام الدالة الموجودة
    const pushToken = await registerForPushNotificationsAsync();
    
    if (!pushToken) {
      console.error('❌ Failed to get push token');
      return {
        success: false,
        error: 'يرجى السماح بالإشعارات لتلقي رمز التحقق',
      };
    }

    console.log('🔑 Push token obtained:', pushToken.substring(0, 20) + '...');

    // استدعاء Cloud Function
    const sendOTP = httpsCallable(functions, 'sendPhoneOTP');
    const result = await sendOTP({
      phoneNumber,
      pushToken,
    });

    const data = result.data as any;
    
    console.log('✅ OTP sent successfully');
    
    return {
      success: true,
      expiresIn: data.expiresIn || 300,
    };

  } catch (error: any) {
    console.error('❌ Error sending OTP:', error);
    return {
      success: false,
      error: error.message || 'فشل إرسال رمز التحقق. يرجى المحاولة مرة أخرى.',
    };
  }
}

/**
 * التحقق من OTP المدخل
 */
export async function verifyPhoneOTP(
  phoneNumber: string,
  otp: string
): Promise<{
  success: boolean;
  error?: string;
  userId?: string;
  isNewUser?: boolean;
}> {
  try {
    console.log('🔍 Verifying OTP for phone:', phoneNumber);

    // استدعاء Cloud Function
    const verifyOTP = httpsCallable(functions, 'verifyPhoneOTP');
    const result = await verifyOTP({
      phoneNumber,
      otp,
    });

    const data = result.data as any;
    
    if (data.success) {
      console.log('✅ OTP verified successfully');
      console.log('👤 User ID:', data.userId);
      console.log('🆕 New user:', data.isNewUser);
      
      return {
        success: true,
        userId: data.userId,
        isNewUser: data.isNewUser,
      };
    } else {
      return {
        success: false,
        error: data.message || 'فشل التحقق من الرمز',
      };
    }

  } catch (error: any) {
    console.error('❌ Error verifying OTP:', error);
    
    // رسائل خطأ مخصصة
    let errorMessage = 'فشل التحقق من الرمز. يرجى المحاولة مرة أخرى.';
    
    if (error.message?.includes('expired')) {
      errorMessage = 'انتهت صلاحية الرمز. يرجى طلب رمز جديد.';
    } else if (error.message?.includes('Invalid OTP')) {
      errorMessage = 'الرمز غير صحيح. يرجى المحاولة مرة أخرى.';
    } else if (error.message?.includes('Too many attempts')) {
      errorMessage = 'تم تجاوز عدد المحاولات المسموح به. يرجى طلب رمز جديد.';
    } else if (error.message?.includes('No OTP found')) {
      errorMessage = 'لم يتم العثور على رمز. يرجى طلب رمز جديد.';
    }
    
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * إعادة إرسال OTP
 */
export async function resendPhoneOTP(phoneNumber: string): Promise<{
  success: boolean;
  error?: string;
  expiresIn?: number;
}> {
  console.log('🔄 Resending OTP...');
  return sendPhoneOTP(phoneNumber);
}
